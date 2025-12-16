import type { Request, Response, NextFunction } from "express";
import type { Err, ObjectSchema, ValidationError, ValidationOptions } from "joi";

import { examCreateSchema } from "../schemas/exam.js";
import { orgCreateSchema } from "../schemas/org.js";

function validateSchema(schema: ObjectSchema, body: object, options: ValidationOptions, req: Request, res: Response, next: NextFunction) {
    const { error, value } = schema.validate(body, options);
    
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

    body = value;

    next();
}

export function validateCreateExamSchema(req: Request, res: Response, next: NextFunction) {
    const validationOptions: ValidationOptions = {
        abortEarly: false,
        allowUnknown: false,
        stripUnknown: true,
    };

    validateSchema(examCreateSchema, req.body, validationOptions, req, res, next);
}

export function validateCreateOrgSchema(req: Request, res: Response, next: NextFunction) {
    const validationsOptions: ValidationOptions = {
        abortEarly: false,
        allowUnknown: false,
        stripUnknown: true,
    };

    validateSchema(orgCreateSchema, req.body, validationsOptions, req, res, next);
}