import type { Seating } from "./Seating";

export interface Exam {
    _id: string;
    name: string;
    date: string;
    description: string;
    meta: object;
    seating: Seating[][];
}