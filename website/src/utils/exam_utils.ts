import type { Exam, ExamCreate, ExamEdit, PublicExam } from '@/interfaces/Exam';
import type { ResponseJson } from '@/interfaces/ResponseJson';
import type { Seating } from '@/interfaces/Seating';
import type { FunctionNotifier } from '@/interfaces/FunctionNotifier';
import { createEvent, type EventAttributes } from 'ics';
import { formatDistance } from 'date-fns';

const apiBaseUrl = import.meta.env.VITE_API_BASE_URL;
const clientUrl = import.meta.env.VITE_CLIENT_URL;

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
    const now = new Date().getTime();

    return [...exams].sort((a, b) => {
        const timeA = new Date(a.date).getTime();
        const timeB = new Date(b.date).getTime();

        const isInvalidA = isNaN(timeA);
        const isInvalidB = isNaN(timeB);

        // Handle Invalid Dates (Move to the absolute end)
        if (isInvalidA && isInvalidB) return 0;
        if (isInvalidA) return 1;
        if (isInvalidB) return -1;

        const isPastA = timeA < now;
        const isPastB = timeB < now;

        // If one is past and the other is future, move the past one down
        if (!isPastA && isPastB) return -1;
        if (isPastA && !isPastB) return 1;

        // If both are future: sort by soonest first (ascending)
        // If both are past: sort by most recent first (descending)
        return timeA - timeB;
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
    console.log('Exam date:', examDate);

    const parsedDate = new Date(examDate);

    const day = parsedDate.getDate();
    const month = parsedDate.toLocaleString('default', { month: 'long' });
    const year = parsedDate.getFullYear();

    return `${day} ${month} ${year}`;
}

export async function createExam(examDetails: ExamCreate): Promise<FunctionNotifier> {
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

export async function editExam(examDetails: ExamEdit): Promise<FunctionNotifier> {
    console.log('Editing exam:', examDetails);

    const examId = examDetails._id;
    const examBody = JSON.stringify(examDetails);

    try {
        const response = await fetch(`${apiBaseUrl}/api/exam/update/${examId}/`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json'
            },
            body: examBody,
            credentials: 'include',
        });

        const responseJson: ResponseJson = await response.json();

        if (!response.ok) {
            console.error('Failed to edit exam:', responseJson);
            return { message: responseJson.message, success: false };
        }

        console.log('Successfully edited exam.');

        return { message: 'Successfully edited examination', success: true };
    } catch (error) {
        console.error('Failed to edit exam:', error);
        return { message: 'An unexpected error occurred while editing examination', success: false };
    }
}

export async function deleteExam(examDetails: Exam): Promise<FunctionNotifier> {
    console.log('Deleting exam:', examDetails);

    const examId = examDetails._id;

    try {
        const response = await fetch(`${apiBaseUrl}/api/exam/delete/${examId}/`, {
            method: 'DELETE',
            credentials: 'include',
        });

        const responseJson: ResponseJson = await response.json();

        if (!response.ok) {
            console.error('Failed to delete exam:', responseJson);
            return { message: responseJson.message, success: false };
        }

        console.log('Successfully deleted exam.');

        return { message: 'Successfully deleted examination', success: true }
    } catch (error) {
        console.error('Failed to delete exam:', error);
        return { message: 'An unexpected error occurred while deleting examination', success: false };
    }
}

export async function fetchAllExams(): Promise<Exam[]> {
    try {
        const response = await fetch(`${apiBaseUrl}/api/exams/fetch/user/`, {
            method: 'GET',
            credentials: 'include',
        });

        const responseJson: ResponseJson = await response.json();

        if (!responseJson?.exams) {
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

export async function fetchPublicExam(id: string): Promise<PublicExam> {
    try {
        const response = await fetch(`${apiBaseUrl}/api/public/exam/fetch/${id}/`, {
            method: 'GET',
            credentials: 'include',
        });

        const responseJson: ResponseJson = await response.json();

        if (!response.ok) {
            console.error('Error while fetching exam:', responseJson);
            throw new Error(`Failed to fetch exam: ${responseJson.message}`);
        }

        console.log('Successfully fetched exam:', responseJson);

        return responseJson.exam as PublicExam;
    } catch (error) {
        console.error('Error while fetching exam:', error);
        throw new Error('An unexpected error occurred while fetching exam.');
    }
}

export function getExamId(): string | null {
    const urlParams = new URLSearchParams(window.location.search);

    const examId = urlParams.get('examId');

    return examId;
}

export async function downloadExam(examDetails: PublicExam): Promise<FunctionNotifier> {
    const fileName = `examduler_exam_${examDetails._id}`;
    const description = `${examDetails.description}\n\nGenerated by Examduler`;

    const eventDetails = {
        title: examDetails.name,
        description: description,
        start: formatExamDateToICSFormat(examDetails.date),
        url: `${clientUrl}/exam?examId=${examDetails._id}`,
    } as EventAttributes;

    try {
        const value: string = await new Promise((resolve, reject) => {
            createEvent(eventDetails, (error, val) => {
                if (error) reject(error);
                else resolve(val);
            });
        });

        console.log('Event:', value);

        const examEvent = new Blob([ value ], { type: 'text/calendar' });

        if ('showSaveFilePicker' in window) {
            const handle = await window.showSaveFilePicker({
                suggestedName: fileName,
                startIn: 'downloads',
                types: [{
                    description: 'Examduler exam export',
                    accept: { 'text/calendar': ['.ics'] },
                }],
            });

            const writable = await handle.createWritable();
            await writable.write(examEvent);
            await writable.close();
        } else {
            const blobUrl = URL.createObjectURL(examEvent);
            const a = document.createElement('a');
            a.href = blobUrl;
            a.download = fileName;
            a.style.display = 'none';
            document.body.append(a);
            a.click();
        }

        return { message: 'Successfully downloaded examination', success: true };
    } catch (error) {
        if ((error as Error).name === 'AbortError') {
            console.error('User cancelled download.');
            return { message: 'Download cancelled', success: false };
        }

        console.error('An error occurred while downloading exam:', error);
        
        return { message: 'Failed to download examination', success: false };
    }
}

function formatExamDateToICSFormat(dateString: string): number[] {
    const date = new Date(dateString);

    const dateList = [
        date.getFullYear(),
        date.getMonth() + 1,
        date.getDate(),
        date.getHours(),
        date.getMinutes(),
    ];

    console.log('Converted date:', dateList);

    return dateList;
}

export async function shareExam(examDetails: PublicExam): Promise<FunctionNotifier> {
    const shareData = {
        title: `Examination ${examDetails.name} on Examduler`,
        text: 'View this examination on Examduler.',
        url: `${clientUrl}/exam?examId=${examDetails._id}`,
    } as ShareData;

    try {
        if (navigator.share) {
            navigator.share(shareData);
            return { message: 'Successfully shared examination', success: true };
        }

        if (!shareData.url) {
            console.error('URL missing.');
            return { message: 'Share URL missing', success: false };
        }

        await navigator.clipboard.writeText(shareData.url);

        console.log('Successfully copied share URL to clipboard.');

        return { message: 'Successfully copied examination URL to clipboard.', success: true };
    } catch (error) {
        console.error('An error occurred while sharing examination:', error);
        return { message: 'An unexpected error occurred while sharing examination', success: false };
    }
}

export function getTimeTillExam(examDate: Date): string {
    const now = new Date();

    const timeTill = formatDistance(examDate, now, { addSuffix: true });

    return timeTill;
}