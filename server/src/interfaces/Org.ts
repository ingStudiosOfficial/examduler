import type { ObjectId } from 'mongodb';
import type { IDomain } from './Domain.js';

export interface IOrg {
    _id?: ObjectId;
    name: string;
    domains: IDomain[];
    members: ObjectId[];
}

export type ICreateOrg = Omit<IOrg, 'members'> & {
    members: string;
};