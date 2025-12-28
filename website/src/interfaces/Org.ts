import type { Domain } from "./Domain";

export interface Organization {
    _id?: string;
    name: string;
    domains: Domain[];
    members: string[];
}

export type OrganizationCreate = Omit<Organization, 'members'> & {
    members: string;
};