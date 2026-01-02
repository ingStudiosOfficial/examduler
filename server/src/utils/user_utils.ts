import type { Db, ObjectId } from "mongodb";
import type { IUser } from "../interfaces/User.js";

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

export async function verifyUsers(db: Db, userIds: ObjectId[]) {
    console.log('Attempting to veriify users:', userIds);

    if (!userIds || userIds.length === 0) {
        console.error('No user IDs to verify.');
        return;
    }

    try {
        await db.collection<IUser>('unverifiedUsers').aggregate([
            { $match: { _id: { $in: userIds } } },
            { $merge: {
                into: 'users',
                on: 'email',
                whenMatched: 'merge',
                whenNotMatched: 'insert',
            } },
        ]).toArray();

        const deleteResult = await db.collection<IUser>('unverifiedUsers').deleteMany({ _id: { $in: userIds } });

        if (deleteResult.deletedCount === 0) {
            console.error('Failed to remove users from unverified collection.');
            throw new Error('Failed to remove users from unverified collection.');
        }

        console.log('Successfully verified users.');
    } catch (error) {
        console.error('Failed to move users:', error);
        throw new Error(`Failed to move users: ${error}`);
    }
}