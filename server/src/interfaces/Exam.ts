import type { ObjectId } from 'mongodb';

import type { ISeating } from './Seating.js';

export interface IExam {
    _id?: ObjectId;
    name: string;
    date: string;
    description: string;
    seating: ISeating[][];
}

export type IExamCreate = Omit<IExam, 'seating'> & {
    seating: string;
};

export interface IEXamUpdate extends IExam {
    uploadedSeating: string;
}
