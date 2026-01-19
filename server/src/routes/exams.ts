import { Router, type Request, type Response } from 'express';
import { authenticateToken } from '../middleware/auth.js';
import { ObjectId } from 'mongodb';
import type { ExamsCollection, UsersCollection } from '../types/mongodb.js';
import type { IUser } from '../interfaces/User.js';
import type { IExam } from '../interfaces/Exam.js';

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

        const fetchedUserExams = await req.db.collection<IUser>('exams').find({ _id: { $in: userExams } }).toArray();

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
