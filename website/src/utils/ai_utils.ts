import type { Exam } from "@/interfaces/Exam";
import type { User } from "@/interfaces/User";
import { getUserSeat } from "./exam_utils";

declare global {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    interface ReadableStream<R = any> {
        [Symbol.asyncIterator](): AsyncIterableIterator<R>;
    }
}

export async function summarizeExams(exams: Exam[], user: User, onChunk: (chunk: string) => void, onDownload: (progress: number) => void): Promise<string> {
    if (!('Summarizer' in window)) {
        console.error('Summarizer API not supported by browser.');
        throw new Error('Summarizer API not supported by browser');
    }

    const summarizerOptions: SummarizerCreateCoreOptions = {
        type: 'tldr',
        length: 'short',
        format: 'markdown',
        expectedInputLanguages: ['en-US'],
        outputLanguage: 'en-US',
    };

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

    const summarizer = await Summarizer.create({
        ...summarizerOptions,
        sharedContext: 'A summary of the user\'s upcoming examinations. Make it tailored to the user. Use words like \'you\', referring to the user. An example seat would be B5, so say \'Your seat is B5 for {exam name}.\'.',
        monitor: (m) => {
            m.addEventListener('downloadprogress', (e) => {
                const percentageComplete = e.loaded / e.total;
                console.log('Percentage complete:', percentageComplete * 100);
                onDownload(percentageComplete);
            });
        },
    });

    const userSeats = [];

    try {
        for (const exam of exams) {
            const userSeat = { seat: getUserSeat(exam.seating, user.email).seat, exam: exam };
            userSeats.push(userSeat);
        }
    } catch (error) {
        console.error('Failed to fetch seats for user:', error);
    }

    const prompt = `Examination: ${JSON.stringify(
        userSeats.map((examWithSeat) => {
            const { _id, seating, ...examWithoutSeating } = examWithSeat.exam;
            console.log('Removed seating:', _id, seating);
            return {
                seat: examWithSeat.seat,
                exam: examWithoutSeating
            };
        })
    )}, User: ${JSON.stringify(user)}`;
    console.log('Prompt:', prompt);

    const stream = summarizer.summarizeStreaming(prompt);
    let summary = '';

    for await (const chunk of stream) {
        summary += chunk;
        onChunk(summary);
    }

    console.log('Final summary:', summary);

    return summary;
}