import type { Db } from "mongodb";
import type { IReqUser } from "../interfaces/ReqUser.ts";

declare global {
    namespace Express {
        interface Request {
            db: Db;
        }

        interface User extends IReqUser {}
    }
}

export {};
