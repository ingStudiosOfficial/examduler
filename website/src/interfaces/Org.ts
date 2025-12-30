import type { Domain } from "./Domain";
import type { Member } from "./Member";

export interface Organization {
    _id?: string;
    name: string;
    domains: Domain[];
    members: Member[];
}

export type OrganizationCreate = Omit<Organization, 'members'> & {
    members: string;
};

export interface OrganizationEdit extends Organization {
    uploadedMembers?: string;
}