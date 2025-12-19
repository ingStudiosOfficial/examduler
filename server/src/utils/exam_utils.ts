import type { Request, Response } from 'express';
import { ObjectId } from 'mongodb';
import type { IExam } from '../interfaces/Exam.js';
import type { UsersCollection } from '../types/mongodb.js';
import type { ISeating } from '../interfaces/Seating.js';

export async function assignExamToUsers(exam: IExam, req: Request, res: Response) {
    const seating = exam.seating;

    try {
        for (const row of seating) {
            for (const seat of row) {
                if (!seat.email) {
                    console.error('Email missing.');
                    continue;
                }

                if (!exam._id || !ObjectId.isValid(exam._id)) {
                    console.error('Exam ID is missing or invalid.');
                    continue;
                }

                const studentEmail = seat.email;
                const examId = new ObjectId(exam._id);

                const result = await req.db.collection<UsersCollection>('users').updateOne({ email: studentEmail }, { $push: { exams: examId } });

                if (result.matchedCount === 0) {
                    console.error('User not found.');
                }
            }
        }
    } catch (error) {
        console.error('An error occurred while assigning exam to users:', error);
        return res.status(500).json({
            message: 'An internal server error occurred while assigning exam to users.',
        });
    }
}

export async function parseExamSeating(seatingString: string, req: Request): Promise<ISeating[][]> {
    /*
        Expected:
        A1 - seat
        A - row
        1 - column
    */

    console.log('Seating from body:', seatingString);

    const seatingArray = seatingString.split(/\r?\n/).filter((line) => line.trim());

    const seatingMap = new Map<string, ISeating[]>();

    for (const seat of seatingArray) {
        const seatArray = seat.replaceAll(' ', '').split(',');

        const seatSeat = seatArray[0];
        const seatEmail = seatArray[1];

        if (!seatSeat || !seatEmail) {
            console.error('Seat seat or email is missing.');
            continue;
        }

        const row = seatSeat.match(/^[A-Z]+/)?.[0];

        if (!row) {
            console.error(`Invalid seat format: ${seatSeat}`);
            continue;
        }

        const formattedSeat: ISeating = {
            seat: seatSeat,
            email: seatEmail,
        };

        if (!seatEmail || seatEmail.toLowerCase() === 'blank' || seatEmail === '') {
            formattedSeat.isBlank = true;
            formattedSeat.email = '';
        }

        const seatUser = await req.db.collection('users').findOne({ email: seatEmail });

        if (seatUser && seatUser.name) {
            formattedSeat.name = seatUser.name;
        } else {
            console.error('User not found.');
        }

        if (!seatingMap.has(row)) {
            seatingMap.set(row, []);
        }
        seatingMap.get(row)!.push(formattedSeat);
    }

    const sortedRows = Array.from(seatingMap.keys()).sort();
    const seating: ISeating[][] = sortedRows.map((row) => seatingMap.get(row)!);

    console.log('Parsed seating:', seating);

    return seating;
}
