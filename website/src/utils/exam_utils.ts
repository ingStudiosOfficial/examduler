import type { Exam, ExamCreate } from '@/interfaces/Exam';
import type { ResponseJson } from '@/interfaces/ResponseJson';
import type { Seating } from '@/interfaces/Seating';

const apiBaseUrl = import.meta.env.VITE_API_BASE_URL;

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

interface ExamCreationPromise {
    message: string;
    success: boolean;
}

export async function createExam(examDetails: ExamCreate): Promise<ExamCreationPromise> {
    console.log('Submitting:', examDetails);

    try {
        const body = JSON.stringify(examDetails);
        console.log('Sending exam:', body);

        const response = await fetch(`${apiBaseUrl}/api/exam/create/`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: body,
            credentials: 'include',
        });

        const responseJson: ResponseJson = await response.json();

        if (!response.ok) {
            console.error('Error while creating exam:', responseJson);
            return { message: responseJson.message, success: false };
        }

        console.log('Successfully created exam:', responseJson);

        return { message: responseJson.message, success: true };
    } catch (error) {
        console.error('Error while creating exam:', error);
        return { message: 'An unexpected error occurred while creating the examination.', success: false };
    }
}

export async function fetchAllExams(): Promise<Exam[]> {
    try {
        const response = await fetch(`${apiBaseUrl}/api/exams/fetch/user/`, {
            method: 'GET',
            credentials: 'include',
        });

        const responseJson: ResponseJson = await response.json();

        if (!responseJson.exams) {
            console.error('No exams returned.');
            return [];
        }

        if (!response.ok) {
            console.error('Failed to fetch all exams:', responseJson);
            throw new Error(`Failed to fetch exams: ${responseJson.message}`);
        }

        const exams: Exam[] = responseJson.exams as Exam[];

        console.log('Fetched exams:', exams);

        return exams;
    } catch (error) {
        console.error('Error while fetching exams:', error);
        throw new Error('An unexpected error occurred while fetching exams.');
    }
}
