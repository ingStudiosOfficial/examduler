import type { Request, Response, NextFunction } from "express";
import type { ValidationOptions } from "joi";

import { examCreateSchema } from "../schemas/exam.js";

export function validateCreateBotSchema(req: Request, res: Response, next: NextFunction) {
    const validationOptions: ValidationOptions = {
        abortEarly: false,
        allowUnknown: false,
        stripUnknown: true,
    };

    const { error, value } = examCreateSchema.validate(req.body, validationOptions);

    if (error) {
        const validationErrors = error.details.map(detail => ({
            field: detail.context?.key,
            message: detail.message.replace(/['"]/g, ''),
        }));

        console.error('Input validation failed:', validationErrors);

        return res.status(400).json({
            message: 'One or more required fields are missing or invalid.',
            errors: validationErrors,
        });
    }

    req.body = value;

    next();
}