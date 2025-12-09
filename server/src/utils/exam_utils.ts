import type { Request, Response } from 'express';
import { ObjectId } from 'mongodb';
import type { IExam } from '../interfaces/Exam.js';
import type { UsersCollection } from '../types/mongodb.js';

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

                const result = await req.db.collection<UsersCollection>('users').findOneAndUpdate(
                    { email: studentEmail },
                    { $push: { exams: examId } },
                );

                if (!result) {
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