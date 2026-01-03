import Joi from 'joi';

export const orgCreateSchema = Joi.object({
    name: Joi.string().required(),
    domains: Joi.array().items(Joi.string()).required(),
    members: Joi.string().required(),
});

const domainSchema = Joi.object({
    domain: Joi.string(),
});

const memberSchema = Joi.object({
    _id: Joi.string().required(),
});

export const orgUpdateSchema = Joi.object({
    name: Joi.string().required(),
    domains: Joi.array().items(domainSchema).required(),
    members: Joi.array().items(memberSchema).required(),
    updloadedMembers: Joi.array().items(Joi.string()).optional(),
});