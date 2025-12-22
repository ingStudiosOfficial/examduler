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
    console.log('Seating from body:', seatingString);

    // Parses seating
    const seatingArray = seatingString.split(/\r?\n/).filter((line) => line.trim());
    const seatingMap = new Map<string, ISeating[]>();
    
    const parsedRows: { seat: string, email: string, row: string }[] = [];
    const emailsToFetch = new Set<string>();

    for (const line of seatingArray) {
        // Gets seat and email
        const [seatSeat, seatEmail] = line.split(',').map(s => s.trim());
        if (!seatSeat || !seatEmail) {
            console.error('Seat or email not found.');
            continue;
        }

        const rowMatch = seatSeat.match(/^[A-Z]+/);
        if (!rowMatch) {
            console.error('Row match failed.');
            continue;
        }

        const row = rowMatch[0];
        const email = seatEmail.toLowerCase() === 'blank' ? '' : seatEmail;

        parsedRows.push({ seat: seatSeat, email, row });

        // Add to the emails to fetch array for batch fetch
        if (email) emailsToFetch.add(email);
    }

    // Batch finds all the users
    const users = await req.db.collection('users')
        .find({ email: { $in: Array.from(emailsToFetch) } })
        .toArray();

    const userMap = new Map(users.map(u => [u.email, u.name]));

    for (const item of parsedRows) {
        const formattedSeat: ISeating = {
            seat: item.seat,
            email: item.email,
        };

        if (!item.email) {
            formattedSeat.isBlank = true;
        } else if (userMap.has(item.email)) {
            formattedSeat.name = userMap.get(item.email);
        }

        if (!seatingMap.has(item.row)) {
            seatingMap.set(item.row, []);
        }
        seatingMap.get(item.row)!.push(formattedSeat);
    }

    const sortedRowKeys = Array.from(seatingMap.keys()).sort();
    
    return sortedRowKeys.map((rowKey) => {
        const rowSeats = seatingMap.get(rowKey)!;
        return rowSeats.sort((a, b) => a.seat.localeCompare(b.seat, undefined, { numeric: true }));
    });
}
