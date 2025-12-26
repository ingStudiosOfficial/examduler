export interface Organization {
    _id?: string;
    name: string;
    domains: string[];
    members: string[];
}

export type OrganizationCreate = Omit<Organization, 'members'> & {
    members: string;
};