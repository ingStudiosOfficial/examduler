import { Router, type Request, type Response } from 'express';
import { authenticateToken, verifyRole } from '../middleware/auth.js';
import { ObjectId } from 'mongodb';
import type { IExam, IExamCreate } from '../interfaces/Exam.js';
import { validateCreateExamSchema } from '../middleware/validate_schema.js';
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
        console.error('An error occurred while deleting exam:', error);
        return res.status(500).json({
            message: 'An internal server error occurred while deleting the exam.',
        });
    }
});
