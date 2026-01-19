import type { ObjectId } from "mongodb";
import type { IUser } from "./User.js";

export interface IStoredMember {
    _id: ObjectId;
    verified: boolean;
}

export type IReturnMember = Pick<IUser, 'name' | 'email' | 'role'>;

export interface IMemberWithEmail extends IStoredMember {
    email: string;
}

export interface IMemberToDelete {
    verifiedMembers: ObjectId[];
    unverifiedMembers: ObjectId[];
}