export interface Domain {
    domain: string;
    verificationToken: string;
    verified: boolean;
}

export type DomainVerificationMethod = 'txt' | 'http';