export interface Domain {
    keyId?: string;
    domain: string;
    verificationToken: string;
    verified: boolean;
}

export type DomainVerificationMethod = 'txt' | 'http';