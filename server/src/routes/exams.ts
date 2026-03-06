import { Router, type Request, type Response } from 'express';
import { authenticateToken, verifyRole } from '../middleware/auth.js';
import { ObjectId, type AnyBulkWriteOperation } from 'mongodb';
import type { ExamsCollection, UsersCollection } from '../types/mongodb.js';
import type { IUser } from '../interfaces/User.js';
import type { IExam, IExamCreate } from '../interfaces/Exam.js';
import { validateCreateBulkExamSchema } from '../middleware/validate_schema.js';
import { assignExamToUsers } from '../utils/exam_utils.js';

export const examsRouter = Router();

examsRouter.get('/fetch/user/', authenticateToken(), async (req: Request, res: Response) => {
    if (!req.user?.id) {
        return res.status(400).json({
            message: 'User ID missing.',
        });
    }

    if (!ObjectId.isValid(req.user.id)) {
        return res.status(400).json({
            message: 'User ID invalid',
        });
    }

    try {
        const userId = new ObjectId(req.user.id);

        const user = await req.db.collection<IUser>('users').findOne({ _id: userId });

        if (!user) {
            console.error('User not found.');
            return res.status(404).json({
                message: 'User not found.',
            });
        }

        if (!user.exams || user.exams.length === 0) {
            console.info('User has no exams.');
            return res.status(404).json({
                message: 'User has no exams.',
            });
        }

        const userExams: ObjectId[] = user.exams;

        const fetchedUserExams = await req.db
            .collection<IUser>('exams')
            .find({ _id: { $in: userExams } })
            .toArray();

        return res.status(200).json({
            message: 'Successfully fetched exams.',
            exams: fetchedUserExams,
        });
    } catch (error) {
        console.error('Error while fetching exams:', error);
        return res.status(500).json({
            message: 'An internal server errror occurred.',
        });
    }
});

examsRouter.post('/bulk-create/', authenticateToken(), verifyRole('teacher'), validateCreateBulkExamSchema, async (req: Request, res: Response) => {
    if (!req.user?.id || !ObjectId.isValid(req.user.id)) {
        return res.status(400).json({
            message: 'User ID missing or invalid.',
        });
    }

    const session = req.client.startSession();

    try {
        const examOps: AnyBulkWriteOperation<IExam>[] = [];
        const userOps: AnyBulkWriteOperation<IUser>[] = [];
        const userId = new ObjectId(req.user.id);

        const user = await req.db.collection<IUser>('users').findOne({ _id: userId });

        if (!user) {
            return res.status(400).json({
                message: 'User ID missing.',
            });
        }

        const examBody: IExam[] = req.body;
        if (examBody.length === 0) {
            return res.status(400).json({
                message: 'No examinations provided.',
            });
        }

        const examIds: ObjectId[] = [];

        for (const exam of examBody) {
            const newExamId = new ObjectId();
            exam._id = newExamId;
            examIds.push(exam._id);

            examOps.push({
                insertOne: {
                    document: exam,
                },
            });

            if (!exam.seating || exam.seating.length === 0) continue;

            exam.seating.flat().forEach(s => {
                userOps.push({
                    updateOne: {
                        filter: { email: s.email },
                        update: {
                            $addToSet: {
                                exams: newExamId,
                            },
                        },
                    },
                });
            });
        };

        userOps.push({
            updateOne: {
                filter: { _id: userId },
                update: { $addToSet: {
                    exams: {
                        $each: examIds,
                    },
                }},
            },
        });

        await session.withTransaction(async () => {
            await req.db.collection<IExam>('exams').bulkWrite(examOps);
            await req.db.collection<IUser>('users').bulkWrite(userOps);
        });

        return res.status(200).json({
            message: 'Successfully inserted exams.',
        });
    } catch (error) {
        console.error('Error while inserting exams:', error);
        return res.status(500).json({
            message: 'An internal server error occurred.',
        });
    }
});