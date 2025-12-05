import type { Exam } from "@/interfaces/Exam";

export function parseExams(exams: string): Exam[] {
    try {
        const parsedExams: Exam[] = JSON.parse(exams);
        return parsedExams;
    } catch(error) {
        console.error('An error occurred while parsing exams:', error);
        return [];
    }
}

export function sortExams(exams: Exam[]): Exam[] {
    return [...exams].sort((a, b) => {
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