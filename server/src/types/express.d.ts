import type { Db } from 'mongodb';
import type { IReqUser } from '../interfaces/ReqUser.ts';
import type { JwtPayload } from 'jsonwebtoken';

declare global {
    namespace Express {
        interface Request {
            db: Db;
            user?: JwtPayload;
        }
    }
}

export {};
