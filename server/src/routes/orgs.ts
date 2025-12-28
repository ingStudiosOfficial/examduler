import { Router, type Request, type Response } from "express";
import { authenticateToken, verifyRole } from "../middleware/auth.js";
import { ObjectId } from "mongodb";
import type { IUser } from "../interfaces/User.js";
import type { IOrg } from "../interfaces/Org.js";

export const orgsRouter = Router();

orgsRouter.get('/fetch/user/', authenticateToken(), verifyRole('admin'), async (req: Request, res: Response) => {
    if (!req.user?.id || !ObjectId.isValid(req.user.id)) {
        console.error('User ID missing or invalid.');
        return res.status(400).json({
            message: 'User ID missing or invalid.',
        });
    } 

    try {
        const userId = new ObjectId(req.user.id);

        const fetchedUser = await req.db.collection<IUser>('users').findOne({ _id: userId });

        if (!fetchedUser) {
            console.error('Failed to fetch user.');
            return res.status(404).json({
                message: 'User not found.',
            });
        }

        if (!fetchedUser.organizations || fetchedUser.organizations.length === 0) {
            console.error('User has no organizations (before fetch).');
            return res.status(404).json({
                message: 'User has no organizations.',
            });
        }

        const organizationIds = fetchedUser.organizations;

        const organizations = await req.db.collection<IOrg>('organizations').find({ _id: { $in: organizationIds } }).toArray();

        if (!organizations || organizations.length === 0) {
            console.error('User has no organizations (after fetch).');
            return res.status(404).json({
                message: 'User has no organizations.',
            });
        }

        const memberIds = [ ...new Set(organizations.flatMap(org => org.members)) ];

        const fetchedMembers = await req.db.collection<IUser>('users').find({ _id: { $in: memberIds } }).project({ name: 1, email: 1, role: 1 }).toArray();

        const memberMap = new Map(fetchedMembers.map(m => [m._id.toString(), m]));

        // WORK ON THIS LATER

        for (const organization of organizations) {
            organization.members = organization.members.map(memberId => {
                return memberMap.get(memberId.toString());
            })
        }

        console.log('Successfully fetched organizations.');

        return res.status(200).json({
            message: 'Successfully fetched organizations.',
            organizations: organizations,
        });
    } catch (error) {
        console.error('Error while fetching organizations:', error);
        return res.status(500).json({
            message: 'An internal server errror occurred while fetching organizations.',
        });
    }
});