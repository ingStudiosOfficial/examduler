import { Router } from "express";
import { authenticateToken } from "../middleware/auth.js";
import { ObjectId } from "mongodb";
import type { IUser } from "../interfaces/User.js";
import { use } from "passport";
import type { IExam } from "../interfaces/Exam.js";

export const examsRouter = Router();

examsRouter.get('/fetch-from-user/:id/', authenticateToken(), async (req, res) => {
    if (!req.params.id) {
        return res.status(400).json({
            message: 'User ID missing.',
        });
    }

    if (!ObjectId.isValid(req.params.id)) {
        return res.status(400).json({
            message: 'User ID invalid',
        });
    }

    try {
        const userId = new ObjectId(req.params.id);

        const user = await req.db.collection('users').findOne({ _id: userId });

        if (!user) {
            console.error('User not found.');
            return res.status(404).json({
                message: 'User not found.',
            });
        }

        if (!user.exams || user.exams.length === 0) {
            console.error('User has no exams.');
            return res.status(404).json({
                message: 'User has no exams.',
            });
        }

        const userExams: ObjectId[] = user.exams;

        let fetchedUserExams: IExam[] = [];

        for (const exam of userExams) {
            const fetchedExam = await req.db.collection('exams').findOne({ _id: exam });

            if (!fetchedExam) {
                console.error(`Exam with ID '${exam}' not found.`);
                continue;
            }

            fetchedUserExams.push(fetchedExam as IExam);
        }

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