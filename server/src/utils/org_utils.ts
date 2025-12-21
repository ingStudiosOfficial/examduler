import dns from 'dns/promises';
import crypto from 'crypto';
import type { ObjectId } from 'mongodb';

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

export async function parseOrgMembers(unparsedMembers: string): Promise<ObjectId[]> {
    console.log('Members:', unparsedMembers);

    const membersArray = unparsedMembers.split(/\r?\n/);

    for (const member of membersArray) {
        const memberPropertiesArray = member.split(',').map(property => property.trim());

        const name = memberPropertiesArray[0];
        const email = memberPropertiesArray[1];
        const role = memberPropertiesArray[2];
    }
}