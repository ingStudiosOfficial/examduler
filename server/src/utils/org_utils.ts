import dns from 'dns/promises';
import crypto from 'crypto';
import { ObjectId, type Db, type InsertOneModel, type InsertOneOptions, type UpdateOneModel } from 'mongodb';
import type { IUser } from '../interfaces/User.js';
import { getDomain } from './user_utils.js';
import type { Role } from '../types/user.js';
import type { IMemberDiff, IMemberWithEmail, IStoredMember } from '../interfaces/Member.js';
import type { IDomainVerification } from '../interfaces/Domain.js';

export async function verifyDomainTxt(domain: string, verificationToken: string): Promise<IDomainVerification> {
    try {
        const records = await dns.resolveTxt(removeDomainPrefix(domain));
        const isVerified = records.flat().includes(verificationToken);

        if (isVerified) {
            console.log('Domain verified successfully.');
            return { success: true, status: 200, message: 'Successfully verified domain.' };
        } else {
            console.error('Domain is not verified.');
            return { success: false, status: 400, message: 'Verification token does not match.' };
        }
    } catch (error) {
        console.error('An error occurred while verifying domain:', error);
        return { success: false, status: 500, message: 'An internal server error occurred while verifying the domain.' };
    }
}

export async function verifyDomainHttp(domain: string, verificationToken: string): Promise<IDomainVerification> {
    try {
        const response = await fetch(`${domain}/.well-known/examduler`);

        if (!response.ok) {
            if (response.status === 404) {
                return { success: false, status: 404, message: 'Verification file not found.' };
            } else {
                return { success: false, status: 424, message: `The server responded with a ${response.status} error.` };
            }
        }

        const foundToken = (await response.text()).trim();

        if (foundToken !== verificationToken) {
            return { success: false, status: 400, message: 'Verification token does not match.' };
        }

        console.log('Successfully verified domain.');

        return { success: true, status: 200, message: 'Successfully verified domain.' };
    } catch (error) {
        console.error('An error occurred while verifying domain:', error);
        return { success: false, status: 500, message: 'An internal server error occurred while verifying the domain.' };
    }
}

export function createVerificationToken(): string {
    const randomBytes = crypto.randomBytes(32);
    const token = `examduler-${randomBytes.toString('base64')}`;
    return token;
}

export async function parseOrgMembers(unparsedMembers: string, db: Db, verifiedDomains: string[], organization: ObjectId, adminId: ObjectId, adminEmail: string): Promise<IMemberWithEmail[]> {
    const membersArray = unparsedMembers.split(/\r?\n/).filter(line => line.trim() !== '');
    const operations = [];
    const unverifiedOperations = [];
    const emails = [];
    const unverifiedEmails = [];

    for (const member of membersArray) {
        const [name, email, role] = member.split(',').map(p => p.trim());

        if (!name || !email || !role) {
            console.error('Invalid row skipping:', member);
            throw new Error('Invalid members format.');
        }

        switch (role) {
            case 'student':
            case 'teacher':
            case 'admin':
                console.log('Role valid.');
                break;
            default:
                console.error('Role invalid.');
                throw new Error(`Role '${role}' is invalid.`);
        }

        const userToUpsert: IUser = {
            email: email,
            domain: addDomainPrefix(getDomain(email)),
            name: name,
            exams: [],
            organizations: [organization],
            role: role as Role,
            tokenVersion: 0,
        };

        if (verifiedDomains.includes(getDomain(email))) {
            emails.push(email);

            operations.push({
                updateOne: {
                    filter: { email: email },
                    update: { $set: userToUpsert },
                    upsert: true
                } as UpdateOneModel,
            });
        } else {
            unverifiedEmails.push(email);

            unverifiedOperations.push({
                updateOne: {
                    filter: { email: email },
                    update: { $set: userToUpsert },
                    upsert: true,
                } as UpdateOneModel,
            })
        }
    }

    try {
        // Get admin
        const admin = await db.collection<IUser>('users').updateOne(
            { _id: adminId },
            { $push: { organizations: organization } },
        );

        if (admin.matchedCount === 0) {
            throw new Error('Admin could not be found.');
        }

        let finalIds: IMemberWithEmail[] = [ {
            _id: adminId,
            verified: true,
            email: adminEmail,
        } ];

        // Verified users
        if (operations.length > 0) {
            await db.collection<IUser>('users').bulkWrite(operations);
            const found = await db.collection<IUser>('users').find({ email: { $in: emails } }).project({ _id: 1, email: 1 }).toArray();
            finalIds = [...finalIds, ...found.map(u => ({
                _id: u._id as ObjectId,
                verified: true,
                email: u.email,
            }))];
        }

        // Unverified users
        if (unverifiedOperations.length > 0) {
            await db.collection<IUser>('unverifiedUsers').bulkWrite(unverifiedOperations);
            const found = await db.collection<IUser>('unverifiedUsers').find({ email: { $in: unverifiedEmails } }).project({ _id: 1, email: 1 }).toArray();
            finalIds = [...finalIds, ...found.map(u => ({
                _id: u._id as ObjectId,
                verified: false,
                email: u.email,
            }))];
        }

        return finalIds;
    } catch (error) {
        console.error('Bulk operation failed:', error);
        throw new Error('An internal server error occurred while parsing users.');
    }
}

export function checkValidDomain(domain: string) {
    try {
        new URL(domain);
        return true;
    } catch (error) {
        console.error('Domain is invalid.');
        return false;
    }
}

export function addDomainPrefix(domain: string): string {
    if (!domain.startsWith('http://') && !domain.startsWith('https://')) {
        const newDomain = `https://${domain}`;
        return newDomain;
    } else {
        return domain;
    }
}

export function removeDomainPrefix(domain: string): string {
    if (!domain.startsWith('http://') || !domain.startsWith('https://')) {
        const domainUrl = new URL(domain);
        return domainUrl.hostname;
    } else {
        return domain;
    }
}

/*
export function getMembersToDelete(uploadedMembers: IMemberWithEmail[], existingMembers: IMemberWithEmail[]): IMemberDiff {
    const verifiedMembersToDelete: ObjectId[] = [];
    const unverifiedMembersToDelete: ObjectId[] = [];

    for (let i = 0; i < existingMembers.length; i++) {
        const member = existingMembers[i]

        if (member && !uploadedMembers.map(m => m.email).includes(member.email)) {
            if (member.verified) {
                verifiedMembersToDelete.push(member._id);
            } else {
                unverifiedMembersToDelete.push(member._id);
            }
        }
    }

    return { verifiedMembers: verifiedMembersToDelete, unverifiedMembers: unverifiedMembersToDelete };
}
*/

export function getNewMembers(uploadedMembers: string, existingMembers: IMemberWithEmail[]): IMemberDiff {
    const membersArray = uploadedMembers.split(/\r?\n/).filter(line => line.trim() !== '');
    const parsedUploadedMembers: IUser[] = [];

    for (const member of membersArray) {
        const [name, email, role] = member.split(',').map(p => p.trim());

        if (!name || !email || !role) {
            console.error('Invalid row skipping:', member);
            throw new Error('Invalid members format.');
        }

        switch (role) {
            case 'student':
            case 'teacher':
            case 'admin':
                console.log('Role valid.');
                break;
            default:
                console.error('Role invalid.');
                throw new Error(`Role '${role}' is invalid.`);
        }

        parsedUploadedMembers.push({ name, email, role, domain: getDomain(email), exams: [], organizations: [], tokenVersion: 0 });
    }

    const uploadedIds = new Set(parsedUploadedMembers.map(m => m.email));
    const existingIds = new Set(existingMembers.map(m => m.email));

    // New members
    const newMembers = parsedUploadedMembers.filter(m => !existingIds.has(m.email));

    // Members to delete
    const membersToDelete = existingMembers.filter(m => !uploadedIds.has(m._id.toString())).map(m => m._id);

    return { membersToDelete, newMembers };
}