import type { Seating } from './Seating';

export interface Exam {
    _id?: string;
    name: string;
    date: string;
    description: string;
    seating: Seating[][];
}

export type ExamCreate = Omit<Exam, 'seating'> & {
    seating: string;
};

export interface ExamEdit extends Exam {
    uploadedSeating?: string;
}

export type PublicExam = Omit<Exam, 'seating'>;