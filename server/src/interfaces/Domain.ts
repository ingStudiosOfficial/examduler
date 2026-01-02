export interface IDomain {
    domain: string;
    verificationToken: string;
    verified: boolean;
}

export interface IDomainVerification {
    success: boolean;
    status: number;
    message: string;
}