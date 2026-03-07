import Joi from 'joi';

export const examCreateSchema = Joi.object({
    name: Joi.string().max(50).required(),
    date: Joi.date().required(),
    description: Joi.string().max(1000).required(),
    seating: Joi.string().optional().allow(''),
});

export const examBulkCreateSchema = Joi.array().items(Joi.object({
    name: Joi.string().max(50).required(),
    date: Joi.date().required(),
    description: Joi.string().max(1000).required(),
    seating: Joi.array().optional(),
}));

export const aiExamBulkCreateSchema = Joi.array().items(Joi.object({
    name: Joi.string().max(50).required(),
    date: Joi.string().required(),
    description: Joi.string().max(1000).required(),
    seating: Joi.array().optional(),
}));

export const examUpdateSchema = Joi.object({
    name: Joi.string().max(50).required(),
    date: Joi.date().required(),
    description: Joi.string().max(1000).required(),
    seating: Joi.array().optional().allow(''),
    uploadedSeating: Joi.string().optional(),
});
