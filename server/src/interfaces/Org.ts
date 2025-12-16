import type { ObjectId } from "mongodb";
import type { IDomain } from "./Domain.js";

export interface IOrg {
    _id?: ObjectId;
    domains: IDomain[];
    members: ObjectId[];
}