import dns from 'dns/promises';
import crypto from 'crypto';
import type { Db, InsertOneModel, InsertOneOptions, ObjectId, UpdateOneModel } from 'mongodb';
import type { IUser } from '../interfaces/User.js';
import { getDomain } from './user_utils.js';
import type { Role } from '../types/user.js';

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

export async function parseOrgMembers(unparsedMembers: string, db: Db, verifiedDomains: string[]): Promise<ObjectId[]> {
    const membersArray = unparsedMembers.split(/\r?\n/).filter(line => line.trim() !== '');
    const operations = [];
    const unverifiedOperations = [];
    const emails = [];
    const unverifiedEmails = [];

    for (const member of membersArray) {
        const [name, email, role] = member.split(',').map(p => p.trim());

        if (!name || !email || !role) {
            console.error('Invalid row skipping:', member);
            continue;
        }

        const userToUpsert: IUser = {
            email: email,
            domain: getDomain(email),
            name: name,
            exams: [],
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
        let finalIds: ObjectId[] = [];

        // Verified users
        if (operations.length > 0) {
            await db.collection('users').bulkWrite(operations);
            const found = await db.collection('users').find({ email: { $in: emails } }).project({ _id: 1 }).toArray();
            finalIds = [...finalIds, ...found.map(u => u._id as ObjectId)];
        }

        // Unverified users
        if (unverifiedOperations.length > 0) {
            await db.collection('unverifiedUsers').bulkWrite(unverifiedOperations);
            const found = await db.collection('unverifiedUsers').find({ email: { $in: unverifiedEmails } }).project({ _id: 1 }).toArray();
            finalIds = [...finalIds, ...found.map(u => u._id as ObjectId)];
        }

        return finalIds;
    } catch (error) {
        console.error('Bulk operation failed:', error);
        throw new Error('An internal server error occurred while parsing users.');
    }
}