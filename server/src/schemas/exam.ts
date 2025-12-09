import Joi from 'joi';

export const examCreateSchema = Joi.object({
    name: Joi.string().required(),
    date: Joi.date().required(),
    description: Joi.string().required(),
    meta: Joi.object().required(),
    seating: Joi.object().required(),
});