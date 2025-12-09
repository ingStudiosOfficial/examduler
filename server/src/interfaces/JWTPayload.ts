import { ObjectId } from 'mongodb';

import type { Role } from '../types/user.js';

export interface IJWTPayload {
    id: string;
    tokenVersion: number;
    role: Role;
}
