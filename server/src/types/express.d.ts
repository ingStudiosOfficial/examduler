import type { Db } from 'mongodb';
import type { IReqUser } from '../interfaces/ReqUser.js';
import type { JwtPayload } from 'jsonwebtoken';

declare global {
    namespace Express {
        interface Request {
            db: Db;
        }

        interface User extends IReqUser {}
    }
}

export {};
