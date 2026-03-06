import { Router, type Request, type Response } from "express";
import { authenticateToken, verifyRole } from "../middleware/auth";
import ollama, { type Message } from 'ollama';
import { verifyParsedResult } from "../utils/ai_utils";
import type { IExam } from "../interfaces/Exam";

export const aiRouter = Router();

aiRouter.post('/magic-paste/', authenticateToken(), verifyRole('teacher'), async (req: Request, res: Response) => {
    const rawText = req.body.text;

    if (!rawText) {
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
        You are a Data Extraction Assistant. 
        Task: Extract EVERY examination mentioned in the text into a JSON array.

        ### INPUT EXAMPLE:
        "Midterm on Oct 10th. Final on Dec 12th with seating: A1: John."

        ### OUTPUT EXAMPLE (NO "exams": []):
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
        4. Use "YYYY-MM-DD" format for all dates.
        5. The key is "seating" (singular), never "seatings".
        6. Do not include a key for the exam output (e.g. DO NOT use "exams": [...], instead use just [...])
    `;

    const systemMessage: Message = { role: 'system', content: systemInstructions };
    const message: Message = { role: 'user', content: `Parse this text: '${rawText}'` };

    const messages: Message[] = [
        systemMessage,
        message,
    ];

    const maxRetries = 2;
    let retryCount = 0;

    while (retryCount <= maxRetries) {
        try {
            const response = await ollama.chat({
                model: 'gemma3n:e2b',
                messages: messages,
                options: {
                    temperature: retryCount * 0.2,
                },
                format: 'json',
            });

            console.log('AI Response:', response.message.content);

            messages.push({ role: 'assistant', content: response.message.content });

            let parsedResult: IExam[] = JSON.parse(response.message.content);

            if (!Array.isArray(parsedResult)) {
                parsedResult = [parsedResult];
                console.log("AI did not include the brackets, added it in:", parsedResult);
            }

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