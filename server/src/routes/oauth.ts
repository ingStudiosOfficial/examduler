import { Router, type Request, type Response } from 'express';
import { createGoogleStrategy } from '../auth/strategies.js';
import passport from 'passport';
import type { CredsCollection, UsersCollection } from '../types/mongodb.js';

export function setupPassport(usersCollection: UsersCollection, credsCollection: CredsCollection) {
    passport.use(createGoogleStrategy(usersCollection, credsCollection));
}

export const authRouter = Router();

authRouter.get('/google/', passport.authenticate('google', { scope: ['profile', 'email'] }));

authRouter.get(
    '/callback/google/',
    passport.authenticate('google', {
        failureRedirect: `${process.env.CLIENT_URL}/login`,
        session: false,
    }),
    (req: Request, res: Response) => {
        const token = req.user?.token;

        const DURATION_DAYS = 7;
        const cookieAgeMs = DURATION_DAYS * 24 * 60 * 60 * 1000;

        res.status(200)
            .cookie('auth_token', token, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
                maxAge: cookieAgeMs,
            })
            .redirect(`${process.env.CLIENT_URL}/dashboard`);
    },
);
