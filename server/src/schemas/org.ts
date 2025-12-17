import Joi from 'joi';

export const orgCreateSchema = Joi.object({
    name: Joi.string().required(),
    domains: Joi.array().required(),
    members: Joi.array().required(),
});
