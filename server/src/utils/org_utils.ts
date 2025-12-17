import dns from 'dns/promises';
import crypto from 'crypto';

export async function verifyDomain(domain: string, verificationToken: string) {
    try {
        const records = await dns.resolveTxt(domain);
        const isVerified = records.flat().includes(verificationToken);

        if (isVerified) {
            console.log('Domain verified successfully.');
            return true;
        } else {
            console.error('Domain is not verified.');
            return false;
        }
    } catch (error) {
        console.error('An error occurred while verifying domain:', error);
        return false;
    }
}

export function createVerificationToken(): string {
    const randomBytes = crypto.randomBytes(32);
    const token = randomBytes.toString('base64');
    return token;
}
