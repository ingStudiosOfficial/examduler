import { Router, type Request, type Response } from 'express';
import { authenticateToken } from '../middleware/auth.js';
import { ObjectId } from 'mongodb';
import type { UsersCollection } from '../types/mongodb.js';

export const userRouter = Router();

userRouter.get('/fetch/', authenticateToken(), async (req: Request, res: Response) => {
    console.log('Fetching user data...');

    const usersCollection = req.db.collection<UsersCollection>('users');

    if (!req.user?.id || !ObjectId.isValid(req.user?.id)) {
        return res.status(400).json({
            message: 'User ID is missing or invalid.',
        });
    }

    try {
        const userId = new ObjectId(req.user.id);

        const user = await usersCollection.findOne({ _id: userId });

        if (!user) {
            return res.status(404).json({
                message: `The user with ID ${userId} could not be found.`,
            });
        }

        return res.status(200).json({
            message: `User ${user._id} found successfully.`,
            user: user,
        });
    } catch (error) {
        console.error('Error while fetching user:', error);
        return res.status(500).json({
            message: 'An internal server error occurred.',
        });
    }
});
