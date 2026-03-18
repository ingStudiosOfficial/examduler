import type { Exam, ExamCreate } from '@/interfaces/Exam';
import type { User } from '@/interfaces/User';
import { getUserSeat } from './exam_utils';
import type { ResponseJson } from '@/interfaces/ResponseJson';

declare global {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    interface ReadableStream<R = any> {
        [Symbol.asyncIterator](): AsyncIterableIterator<R>;
    }
}

const apiBaseUrl = import.meta.env.VITE_API_BASE_URL;

export async function summarizeExams(exams: Exam[], user: User, onChunk: (chunk: string) => void, onDownload: (progress: number) => void, onEvent: (message: string) => void, onComplete: () => void): Promise<string> {
    if (!('Summarizer' in window)) {
        console.error('Summarizer API not supported by browser.');
        throw new Error('Summarizer API not supported by browser');
    }

    console.log('Exams:', exams);

    const summarizerOptions: SummarizerCreateCoreOptions = {
        type: 'tldr',
        length: 'short',
        format: 'markdown',
        expectedInputLanguages: ['en-US'],
        outputLanguage: 'en-US',
    };

    onEvent('Checking summarizer availability...');

    const availability = await Summarizer.availability(summarizerOptions);

    switch (availability) {
        case 'available':
            console.log('Summarizer available.');
            break;

        case 'downloadable':
            console.log('Summarizer is downloadable.');
            break;

        case 'downloading':
            console.log('Summarizer is downloading.');
            break;

        case 'unavailable':
            console.error('Summarizer is unavailable');
            throw new Error('Summarizer is unavailable');

        default:
            console.error('Unknown summarizer state.');
            throw new Error('An unexpected error occurred');
    }

    onEvent('Creating summarizer instance...');

    const summarizer = await Summarizer.create({
        ...summarizerOptions,
        sharedContext: "A summary of the user's upcoming examinations. Make it tailored to the user. Use words like 'you', referring to the user. An example seat would be B5, so say 'Your seat is B5 for {exam name}.'.",
        monitor: (m) => {
            m.addEventListener('downloadprogress', (e) => {
                const percentageComplete = e.loaded / e.total;
                console.log('Percentage complete:', percentageComplete * 100);
                if (percentageComplete !== 0 && percentageComplete !== 1) onDownload(percentageComplete);
            });
        },
    });

    const userSeats: { seat: string; exam: Exam }[] = [];
    const examsWithoutSeat: Exam[] = [];

    try {
        for (const exam of exams) {
            console.log('Exam:', exam);

            if (exam.seating) {
                const userSeat = { seat: getUserSeat(exam.seating, user.email).seat, exam: exam };
                userSeats.push(userSeat);
            } else {
                examsWithoutSeat.push(exam);
            }
        }
    } catch (error) {
        console.error('Failed to fetch seats for user:', error);
    }

    onEvent('Generating summary...');

    const prompt = `Examinations (with seating): ${JSON.stringify(
        userSeats.map((examWithSeat) => {
            const { _id, seating, ...examWithoutSeating } = examWithSeat.exam;
            console.log('Removed seating:', _id, seating);
            return {
                seat: examWithSeat.seat,
                exam: examWithoutSeating,
            };
        }),
    )}, Examinations (without seating): ${JSON.stringify(
        examsWithoutSeat.map((exam) => {
            const { _id, seating, ...examWithoutId } = exam;
            console.log('Removed seating:', _id, seating);
            return {
                exam: examWithoutId,
            };
        }),
    )}, User: ${JSON.stringify(user.name)}`;
    console.log('Prompt:', prompt);

    const stream = summarizer.summarizeStreaming(prompt);
    let summary = '';

    for await (const chunk of stream) {
        summary += chunk;
        onChunk(summary);
    }

    console.log('Final summary:', summary);

    onComplete();

    return summary;
}

export async function magicPaste(examsString: string): Promise<ExamCreate[]> {
    console.log('Unformatted exams:', examsString);

    try {
        const response = await fetch(`${apiBaseUrl}/api/ai/magic-paste/`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                text: examsString,
            }),
            credentials: 'include',
        });

        const responseJson: ResponseJson = await response.json();

        if (!response.ok) {
            console.error('Error while using magic paste:', responseJson);
            throw new Error(responseJson.message);
        }

        console.log('Successfully used magic paste:', responseJson.exams);

        return responseJson.exams as ExamCreate[];
    } catch (error) {
        console.error('An error occurred while using magic paste:', error);
        throw new Error('An unexpected error occurred while using magic paste');
    }
}
