import type { ObjectId } from 'mongodb';

import type { ISeating } from './Seating.js';

export interface IExam {
    _id?: ObjectId;
    name: string;
    date: string;
    description: string;
    meta: object;
    seating: ISeating[][];
}
