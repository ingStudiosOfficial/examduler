import { Router, type Request, type Response } from "express";
import { authenticateToken, verifyRole } from "../middleware/auth.js";
import { ObjectId } from "mongodb";
import type { IExam } from "../interfaces/Exam.js";
import { validateCreateExamSchema } from "../middleware/validate_schema.js";
import { assignExamToUsers } from "../utils/exam_utils.js";

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

        const exam = await req.db.collection('exams').findOne({ _id: examId });

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

examRouter.post('/create/', authenticateToken(), verifyRole('teacher'), validateCreateExamSchema, async (req, res) => {
    try {
        const exam: IExam = req.body;

        const result = await req.db.collection('exams').insertOne(exam);

        if (!result.insertedId) {
            console.error('Failed to insert exam.');
            return res.status(500).json({
                message: 'Failed to insert exam.',
            });
        }

        assignExamToUsers(exam, req, res);

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