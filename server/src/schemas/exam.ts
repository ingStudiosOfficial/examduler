import Joi from 'joi';

export const examCreateSchema = Joi.object({
    name: Joi.string().max(50).required(),
    date: Joi.date().required(),
    description: Joi.string().max(1000).required(),
    seating: Joi.string().required(),
});
