import { Router, type Request, type Response } from 'express';
import { authenticateToken, verifyRole } from '../middleware/auth.js';
import { ObjectId, type AnyBulkWriteOperation } from 'mongodb';
import type { IExam, IExamCreate, IEXamUpdate } from '../interfaces/Exam.js';
import { validateCreateExamSchema, validateUpdateExamSchema } from '../middleware/validate_schema.js';
import { assignExamToUsers, parseExamSeating } from '../utils/exam_utils.js';
import type { ExamsCollection } from '../types/mongodb.js';
import type { IUser } from '../interfaces/User.js';

export const examRouter = Router();

examRouter.get('/fetch/:id/', authenticateToken(), async (req: Request, res: Response) => {
    if (!req.params.id) {
        return res.status(400).json({
            message: 'Exam ID not provided.',
        });
    }

    if (!ObjectId.isValid(req.params.id)) {
        return res.status(400).json({
            message: 'Invalid exam ID format.',
        });
    }

    try {
        const examId = new ObjectId(req.params.id);

        const exam = await req.db.collection<IExam>('exams').findOne({ _id: examId });

        if (!exam) {
            return res.status(404).json({
                message: 'Exam not found',
            });
        }

        return res.status(200).json({
            message: `Sucessfully found exam with ID ${examId.toString()}.`,
            exam: exam,
        });
    } catch (error) {
        console.error('Error while fetching exams:', error);
        return res.status(500).json({
            message: 'An internal server error occurred.',
        });
    }
});

examRouter.post('/create/', authenticateToken(), verifyRole('teacher'), validateCreateExamSchema, async (req: Request, res: Response) => {
    if (!req.user?.id || !ObjectId.isValid(req.user.id)) {
        return res.status(400).json({
            message: 'User ID missing or invalid.',
        });
    }

    try {
        const userId = new ObjectId(req.user.id);

        const user = await req.db.collection<IUser>('users').findOne({ _id: userId });

        if (!user) {
            return res.status(400).json({
                message: 'User ID missing.',
            });
        }

        const examBody: IExamCreate = req.body;
        const { seating, ...tempExam } = examBody;
        const parsedSeating = await parseExamSeating(examBody.seating, req);
        const exam = { ...tempExam, seating: parsedSeating } as IExam;

        console.log('Exam:', exam);
        console.log('Type of date:', (typeof exam.date));

        const result = await req.db.collection<IExam>('exams').insertOne(exam);

        if (!result.insertedId) {
            console.error('Failed to insert exam.');
            return res.status(500).json({
                message: 'Failed to insert exam.',
            });
        }

        assignExamToUsers(exam, req, res, user.email);

        return res.status(200).json({
            message: 'Successfully inserted exam.',
        });
    } catch (error) {
        console.error('Error while inserting exam:', error);
        return res.status(500).json({
            message: 'An internal server error occurred.',
        });
    }
});

examRouter.patch('/update/:id/', authenticateToken(), verifyRole('teacher'), validateUpdateExamSchema, async (req: Request, res: Response) => {
    if (!req.params.id || !ObjectId.isValid(req.params.id)) {
        return res.status(400).json({
            message: 'Exam ID missing or invalid.',
        });
    }

    if (!req.user?.id || !ObjectId.isValid(req.user.id)) {
        return res.status(400).json({
            message: 'User ID missing or invalid.',
        });
    }

    try {
        const userId = new ObjectId(req.user.id);
        const examId = new ObjectId(req.params.id);
        const examToUpdate: IEXamUpdate = req.body;
        const examOps: AnyBulkWriteOperation<IExam>[] = [];
        const userOps: AnyBulkWriteOperation<IUser>[] = [];

        const session = req.client.startSession();

        const user = await req.db.collection<IUser>('users').findOne({ _id: userId });

        console.log('User exams:', user?.exams);
        console.log('Exam ID:', examId);
        console.log('Exam to update:', examToUpdate);
        console.log('Type of date:', (typeof examToUpdate.date));

        if (!user?.exams.map(e => e.toString()).includes(examId.toString())) {
            return res.status(403).json({
                message: 'User is forbidden from updating the exam.',
            });
        }

        const examination = await req.db.collection<IExam>('exams').findOne({ _id: examId });

        if (!examination) {
            console.error('Examination not found.');
            return res.status(404).json({
                message: 'Examination not found.',
            });
        }

        const keys: (keyof IExam)[] = ['name', 'date', 'description'];

        const fieldsToSet: Partial<IExam> = {};

        keys.forEach(key => {
            if (examToUpdate[key] !== examination[key]) {
                (fieldsToSet[key] as unknown) = examToUpdate[key];
            }
        });

        if (Object.keys(fieldsToSet).length !== 0) {
            examOps.push({
                updateOne: {
                    filter: { _id: examId },
                    update: { $set: fieldsToSet },
                },
            });
        }

        // Email seating logic
        if (examToUpdate.uploadedSeating) {
            const parsedSeating = await parseExamSeating(examToUpdate.uploadedSeating, req);

            const existingEmails = await req.db.collection<IUser>('users').find({ exams: examId }).project<Pick<IUser, 'email'>>({ email: 1 }).toArray();
            
            const oldSet = new Set<string>(existingEmails.map(u => u.email));
            const newSet = new Set<string>(parsedSeating.flat().map(s => s.email));


            const toAdd = [ ...newSet ].filter(email => !oldSet.has(email));
            const toDelete = [ ...oldSet ].filter(email => !newSet.has(email));

            toAdd.forEach(email => {
                userOps.push({
                    updateOne: {
                        filter: { email: email },
                        update: { $addToSet: { exams: examId } },
                    },
                });
            });

            toDelete.forEach(email => {
                userOps.push({
                    updateOne: {
                        filter: { email: email },
                        update: { $pull: { exams: examId } },
                    },
                });
            });

            examOps.push({
                updateOne: {
                    filter: { _id: examId },
                    update: { $set: { seating: parsedSeating } },
                },
            });
        }

        await session.withTransaction(async () => {
            if (examOps.length !== 0) await req.db.collection<IExam>('exams').bulkWrite(examOps);
            if (userOps.length !== 0) await req.db.collection<IUser>('users').bulkWrite(userOps);
        });

        console.log('Successfully updated the exam.');

        return res.status(200).json({
            message: 'Successfully updated the exam.',
        });
    } catch (error) {
        console.error('An error occurred while updating the exam:', error);
        return res.status(500).json({
            message: 'An internal server error occurred while updating the exam.',
        });
    }
});

// TODO: Wrap this in a transaction
examRouter.delete('/delete/:id/', authenticateToken(), verifyRole('teacher'), async (req: Request, res: Response) => {
    if (!req.params.id || !ObjectId.isValid(req.params.id)) {
        return res.status(400).json({
            message: 'Exam ID missing or invalid.',
        });
    }

    if (!req.user?.id || !ObjectId.isValid(req.user.id)) {
        return res.status(400).json({
            message: 'User ID missing or invalid.',
        });
    }

    try {
        const userId = new ObjectId(req.user.id);
        const examId = new ObjectId(req.params.id);

        const user = await req.db.collection<IUser>('users').findOne({ _id: userId });

        console.log('User exams:', user?.exams);
        console.log('Exam ID:', examId);

        if (!user?.exams.map(e => e.toString()).includes(examId.toString())) {
            return res.status(403).json({
                message: 'User is forbidden from deleting the exam.',
            });
        }

        const deleteResult = await req.db.collection<IExam>('exams').deleteOne({ _id: examId });

        if (deleteResult.deletedCount === 0) {
            return res.status(404).json({
                message: 'Exam to delete not found.',
            });
        }

        await req.db.collection<IUser>('users').updateMany(
            { exams: examId },
            { $pull: { exams: examId } },
        );

        return res.status(200).json({
            message: 'Exam deleted successfully.',
        });
    } catch (error) {
        console.error('An error occurred while deleting the exam:', error);
        return res.status(500).json({
            message: 'An internal server error occurred while deleting the exam.',
        });
    }
});
