export interface Organization {
    name: string;
    domains: string[];
    members: string[];
}

export type OrganizationCreate = Omit<Organization, 'members'> & {
    members: string;
};