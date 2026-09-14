import type { ObjectId } from "mongodb";

export interface UnverifiedUser {
	email: string;
	exams: ObjectId[];
}