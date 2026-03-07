import { Router, type Request, type Response } from "express";
import { authenticateToken, verifyRole } from "../middleware/auth";
import ollama, { type Message } from 'ollama';
import { verifyParsedResult } from "../utils/ai_utils";
import type { IExam } from "../interfaces/Exam";
import format from 'joi-to-json';
import { aiExamBulkCreateSchema } from "../schemas/exam";

export const aiRouter = Router();

aiRouter.post('/magic-paste/', authenticateToken(), verifyRole('teacher'), async (req: Request, res: Response) => {
    const rawText = req.body.text;

    if (!rawText) {
        return res.status(400).json({
            message: 'Body content missing or invalid.',
        });
    }

    const now = new Date();
    const dateContext = `
        Today's Date: ${now.toDateString()}
        Current Year: ${now.getFullYear()}
        Current Millisecond Timestamp: ${now.getTime()}
        Remember to calculate the timestamp (YYYY-MM-DD) based on the FUTURE date mentioned.
    `;

    const systemInstructions = `
        You are a Data Extraction Assistant. 
        Task: Extract EVERY examination mentioned in the text into a JSON array.
        Date Context: ${dateContext}

        ### INPUT EXAMPLE:
        "Midterm on Oct 10th. Final on Dec 12th with seating: A1: John."

        ### OUTPUT EXAMPLE:
        [
            {
                "name": "Midterm",
                "date": "2026-10-10",
                "description": "Midterm examination"
            },
            {
                "name": "Final",
                "date": "2026-12-12",
                "description": "Final examination",
                "seating": [[{"seat": "A1", "name": "John", "email": "", "isBlank": false}]]
            }
        ]

        ### STRICT RULES:
        1. Output ONLY the JSON array.
        2. Do NOT stop after the first exam; extract ALL of them.
        3. Only include the "seating" key if specific seats/students are mentioned.
        4. Use unix millisecond epoch format for all dates.
        5. The key is "seating" (singular), never "seatings".
        6. Only extract actual academic examinations, tests, or quizzes. If no exams are found, return an empty array [].
    `;

    const systemMessage: Message = { role: 'system', content: systemInstructions };
    const message: Message = { role: 'user', content: `Parse this text: '${rawText}'` };

    const messages: Message[] = [
        systemMessage,
        message,
    ];

    const maxRetries = 2;
    let retryCount = 0;

    const joiSchemaJson = format(aiExamBulkCreateSchema);
    console.log('JSON schema:', joiSchemaJson);

    while (retryCount <= maxRetries) {
        try {
            const response = await ollama.chat({
                model: 'gemma3n:e2b',
                messages: messages,
                options: {
                    temperature: retryCount * 0.2,
                },
                format: joiSchemaJson,
            });

            console.log('AI Response:', response.message.content);

            messages.push({ role: 'assistant', content: response.message.content });

            let parsedResult: IExam[] = JSON.parse(response.message.content);

            verifyParsedResult(parsedResult);

            return res.status(200).json({
                message: 'Successfully parsed examinations.',
                exams: parsedResult,
            });
        } catch (error) {
            console.error('AI parsing error:', error);
            messages.push({ role: 'system', content: `Error while parsing content: '${error}'` })
            retryCount++;
            if (retryCount > maxRetries) return res.status(500).json({
                message: error,
            });
        }
    }
});