import { ObjectId } from "mongodb";

export interface ICred {
    _id?: ObjectId;
    userId: ObjectId;
    provider: string;
    subject: string;
}