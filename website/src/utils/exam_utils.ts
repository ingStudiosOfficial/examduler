import type { Exam } from '@/interfaces/Exam';
import type { Seating } from '@/interfaces/Seating';

export function parseExams(exams: string): Exam[] {
    try {
        const parsedExams: Exam[] = JSON.parse(exams);
        return parsedExams;
    } catch (error) {
        console.error('An error occurred while parsing exams:', error);
        return [];
    }
}

export function sortExams(exams: Exam[]): Exam[] {
    return [...exams].sort((b, a) => {
        const timeA = new Date(a.date).getTime();
        const timeB = new Date(b.date).getTime();

        const isInvalidA = isNaN(timeA);
        const isInvalidB = isNaN(timeB);

        // A and B invalid, keep the same order
        if (isInvalidA && isInvalidB) return 0;
        // A invalid, move to the end
        if (isInvalidA) return 1;
        // B invalid, move to the end
        if (isInvalidB) return -1;

        return timeB - timeA;
    });
}

export function getUserSeat(seating: Seating[][], userEmail: string): Seating {
    for (const row of seating) {
        for (const seat of row) {
            if (seat.email === userEmail) {
                return seat;
            } else {
                continue;
            }
        }
    }

    console.error('No seat found for user.');
    throw new Error('No seat found for user.');
}

export function formatExamDate(examDate: string): string {
    const parsedDate = new Date(examDate);

    const day = parsedDate.getDate();
    const month = parsedDate.toLocaleString('default', { month: 'long' });
    const year = parsedDate.getFullYear();

    return `${day} ${month} ${year}`;
}
