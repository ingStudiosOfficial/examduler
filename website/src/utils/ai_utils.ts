import type { Exam } from "@/interfaces/Exam";

declare global {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    interface ReadableStream<R = any> {
        [Symbol.asyncIterator](): AsyncIterableIterator<R>;
    }
}

export async function summarizeExams(exams: Exam[], onChunk: (chunk: string) => void, onDownload: (progress: number) => void): Promise<string> {
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
        sharedContext: 'A summary of the user\'s upcoming examinations',
        monitor: (m) => {
            m.addEventListener('downloadprogress', (e) => {
                const percentageComplete = Math.round((e.loaded / e.total));
                console.log('Percentage complete:', percentageComplete * 100);
                onDownload(percentageComplete);
            });
        },
    });

    const stream = summarizer.summarizeStreaming(exams.toString());
    let summary = '';

    for await (const chunk of stream) {
        summary += chunk;
        onChunk(summary);
    }

    console.log('Final summary:', summary);

    return summary;
}