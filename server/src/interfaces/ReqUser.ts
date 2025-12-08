import type { ObjectId } from "mongodb";

export interface IReqUser {
    token: string;
    id: string;
    tokenVersion: number;
}
