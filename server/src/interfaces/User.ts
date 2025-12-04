import { ObjectId } from 'mongodb';

export interface IUser {
    _id?: ObjectId;
    email: string;
    domain: string;
    name: string;
    exams: ObjectId[];
    tokenVersion: number;
}
