import { Router, type Request, type Response } from "express";
import { ObjectId } from "mongodb";
import type { IExam } from "../interfaces/Exam.js";

export const publicRouter = Router();

publicRouter.get('/exam/fetch/:id/', async (req: Request, res: Response) => {
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

        const exam = await req.db.collection<IExam>('exams').findOne({ _id: examId }, { projection: { name: 1, date: 1, description: 1 } });

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