import type { Exam } from "@/interfaces/Exam";

export async function summarizeExams(exams: Exam[]) {
    if (!('Summarizer' in window)) {
        console.error('Summarizer API not supported in browser.');
        return;
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
            return;

        default:
            console.error('Unknown summarizer state.');
            return;
    }

    const summarizer = await Summarizer.create({
        ...summarizerOptions,
        sharedContext: 'A summary of the user\'s upcoming examinations',
        monitor: (m) => {
            m.addEventListener('downloadprogress', (e) => {
                const percentageComplete = Math.round((e.loaded / e.total));
                console.log('Percentage complete:', percentageComplete * 100);

                
            });
        },
    });
}