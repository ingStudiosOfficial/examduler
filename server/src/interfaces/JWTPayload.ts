import { ObjectId } from 'mongodb';

export interface IJWTPayload {
    id: string;
    tokenVersion: number;
}
