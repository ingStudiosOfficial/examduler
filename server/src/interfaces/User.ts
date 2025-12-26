import { ObjectId } from 'mongodb';

import type { Role } from '../types/user.js';

export interface IUser {
    _id?: ObjectId;
    email: string;
    domain: string;
    name: string;
    exams: ObjectId[];
    organizations: ObjectId[];
    role: Role;
    tokenVersion: number;
}
