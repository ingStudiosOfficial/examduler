import type { ObjectId } from "mongodb";
import type { IUser } from "./User.js";

export interface IStoredMember {
    _id: ObjectId;
    verified: boolean;
}

export type IReturnMember = Pick<IUser, 'name' | 'email' | 'role'>;