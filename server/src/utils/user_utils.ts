import type { AnyBulkWriteOperation, Db, ObjectId } from "mongodb";
import type { IUser } from "../interfaces/User.js";
import { removeDomainPrefix } from "./org_utils.js";

export function getDomain(email: string): string {
    if (!email) {
        console.error('No email found.');
        throw new Error('No email found.');
    }

    const regex = /@(.*)/;
    const match = email.match(regex);

    if (match && match[1]) {
        return match[1];
    } else {
        throw new Error('No domain found.');
    }
}

export function constructName(firstName?: string, middleName?: string, lastName?: string): string {
    const nameParts = [firstName, middleName, lastName];

    const name = nameParts.filter((part) => !!part).join(' ');

    if (name === '') {
        throw new Error('Name is empty.');
    }

    return name;
}

export async function verifyUsers(db: Db, userIds: ObjectId[], domain: string, adminId: ObjectId) {
    console.log('Domain:', domain);
    console.log('User IDs:', userIds);

    const usersToVerify = await db.collection<IUser>('unverifiedUsers')
        .find({ _id: { $in: userIds }, domain: domain })
        .toArray();

    if (usersToVerify.length === 0) {
        console.log('No matching unverified users found.');
        return;
    }

    const operations: AnyBulkWriteOperation<IUser>[] = usersToVerify.map(user => {
        const { _id, ...userData } = user;

        return {
            updateOne: {
                filter: { email: user.email, _id: { $ne: adminId } },
                update: { $set: userData },
                upsert: true,
            }
        };
    });

    try {
        const writeResult = await db.collection<IUser>('users').bulkWrite(operations, { ordered: false });
        
        console.log(`Matched: ${writeResult.matchedCount}, Upserted: ${writeResult.upsertedCount}`);

        const emailsProcessed = usersToVerify.map(u => u.email);
        await db.collection('unverifiedUsers').deleteMany({
            email: { $in: emailsProcessed },
            domain: domain
        });

    } catch (error) {
        console.error('Bulk write failed:', error);
        throw error;
    }
}