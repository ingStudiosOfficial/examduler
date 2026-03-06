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
        const validationErrors = error.details.map((detail) => ({
            field: detail.context?.key,
            message: detail.message.replace(/['"]/g, ''),
        }));

        console.error('Input validation failed:', validationErrors);

        throw new Error(validationErrors.join(','));
    }
}