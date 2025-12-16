import { Collection } from 'mongodb';
import { IUser } from '../interfaces/User.ts';
import type { ICred } from '../interfaces/Cred.ts';
import type { IOrg } from '../interfaces/Org.ts';

export type UsersCollection = Collection<IUser>;
export type CredsCollection = Collection<ICred>;
export type OrgsCollection = Collection<IOrg>;
