import type { ObjectId } from 'mongodb';
import type { IDomain } from './Domain.js';
import type { IReturnMember, IStoredMember } from './Member.js';

export interface IOrg {
    _id?: ObjectId;
    name: string;
    domains: IDomain[];
    members: IStoredMember[];
}

export type ICreateOrg = Omit<IOrg, 'members'> & {
    members: string;
};

export type IReturnOrg = Omit<IOrg, 'members'> & {
    members: IReturnMember[];
};

export interface IUpdateOrg extends IOrg {
    uploadedMembers?: string;
}