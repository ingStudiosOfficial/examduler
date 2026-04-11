import { Router, type Request, type Response } from 'express';
import { authenticateToken } from '../middleware/auth.js';
import { ObjectId } from 'mongodb';
import type { IUser } from '../interfaces/User.js';

export const sessionRouter = Router();

sessionRouter.get('/verify/', authenticateToken(), (req: Request, res: Response) => {
    console.log('User authenticated.');
    return res.status(200).json({
        message: 'Successfully authenticated user.',
    });
});

sessionRouter.post('/logout/' , authenticateToken(), async (req: Request, res: Response) => {
    if (!req.user?.id || !ObjectId.isValid(req.user.id)) {
        return res.status(400).json({
            message: 'User ID not missing or invalid.',
        });
    }

    const CLIENT_URL = process.env.CLIENT_URL;

    try {
        const userId = new ObjectId(req.user.id);
        
        await req.db.collection<IUser>('users').updateOne({ _id: userId }, { $set: { tokenVersion: req.user.tokenVersion + 1 } });
        
        res.status(200).json({
            meassage: 'Successfully logged user out.'
        });
    } catch (error) {
        return res.status(500).json({
            message: 'Failed to log user out.',
        })
    }
});