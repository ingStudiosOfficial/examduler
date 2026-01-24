import Joi from 'joi';

const domainSchema = Joi.object({
    domain: Joi.string(),
});

export const orgCreateSchema = Joi.object({
    name: Joi.string().max(50).required(),
    domains: Joi.array().items(domainSchema).required(),
    members: Joi.string().required(),
});

const editMemberSchema = Joi.object({
    _id: Joi.string().required(),
});

export const orgUpdateSchema = Joi.object({
    name: Joi.string().max(50).required(),
    domains: Joi.array().items(domainSchema).required(),
    members: Joi.array().items(editMemberSchema).required(),
    uploadedMembers: Joi.string().optional(),
    memberUploaded: Joi.boolean().optional(),
});