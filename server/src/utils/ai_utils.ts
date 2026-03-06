import type { ValidationOptions } from "joi";
import { examBulkCreateSchema } from "../schemas/exam";
import type { IExam } from "../interfaces/Exam";

export function verifyParsedResult(result: IExam[]) {
    const validationsOptions: ValidationOptions = {
        abortEarly: false,
        allowUnknown: false,
    };

    const { error } = examBulkCreateSchema.validate(result, validationsOptions);

    if (error) {
        const errorMessage = error.details
            .map((detail) => `${detail.path.join('.')}: ${detail.message}`)
            .join(' | ');

        console.error('Input validation failed:', errorMessage);

        throw new Error(errorMessage);
    }
}