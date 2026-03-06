import { Router, type Request, type Response } from "express";
import { authenticateToken, verifyRole } from "../middleware/auth";
import ollama, { type Message } from 'ollama';
import { verifyParsedResult } from "../utils/ai_utils";
import type { IExam } from "../interfaces/Exam";

const aiRouter = Router();

aiRouter.post('/magic-paste/', authenticateToken(), verifyRole('teacher'), async (req: Request, res: Response) => {
    if (!req.body || typeof req.body !== 'string') {
        return res.status(400).json({
            message: 'Body content missing or invalid.',
        });
    }

    const sampleJson = [
        {
            "name": "Mid Term Examinations",
            "date": "2027-12-06",
            "description": "Please prepare for your mid-terms.",
            "seating": [
                [
                    { "seat": "A1", "name": "Ethan Lee", "email": "ingstudiosofficial@gmail.com" },
                    { "seat": "A2", "name": "Person 1", "email": "unique.email.01@example.com" },
                ],
                [
                    { "seat": "B1", "name": "", "email": "", "isBlank": true },
                    { "seat": "B2", "name": "Person 2", "email": "unique.email.02@example.com" },
                ],
            ],
        },
    ];
    const systemInstructions = `
        You are a sepcialized data extraction AI.
        Task: Convert unstructured examinations text about the examination details and seating into a valid JSON array.

        Critical Rules:
        1. Output ONLY valid JSON.
        2. Do NOT include introductory text, markdown code blocks (like \`\`\`json), or explanations.
        3. Use the following schema as a template: '${JSON.stringify(sampleJson)}'.
        4. If a seat is empty, set 'isBlank' to true, and leave name and email empty.
        5. Not all examinations have a seating plan, so do not incude where unnecessary. If a seating plan IS provided, do include it in the JSON output.
        6. The seating should be an array of arrays, do NOT flatten them.
    `;

    const systemMessage: Message = { role: 'system', content: systemInstructions };
    const message: Message = { role: 'user', content: `Parse this text: '${req.body}'` };

    const maxRetries = 2;
    let retryCount = 0;

    while (retryCount <= maxRetries) {
        try {
            const response = await ollama.chat({
                model: 'gemma3n:e4b',
                messages: [
                    systemMessage,
                    message,
                ],
                options: {
                    temperature: 0,
                },
                format: 'json',
            });

            const parsedResult: IExam[] = JSON.parse(response.message.content);

            verifyParsedResult(parsedResult);

            return res.status(200).json({
                message: 'Successfully parsed examinations.',
                exams: parsedResult,
            });
        } catch (error) {
            console.error('AI parsing error:', error);
            retryCount++;
            if (retryCount > maxRetries) return res.status(500).json({
                message: 'An internal server error occurred while parsing exam data.',
            });
        }
    }
});