import { Router, type Request, type Response } from 'express';
import passport from 'passport';

const apiBaseUrl = process.env.API_BASE_URL;

export const authRouter = Router();

authRouter.get('/google/', passport.authenticate('google', { scope: ['profile', 'email'], callbackURL: `${apiBaseUrl}/oauth2/callback/google/` } as any));

authRouter.get('/google/flutter/', passport.authenticate('google', { scope: ['profile', 'email'], callbackURL: `${apiBaseUrl}/oauth2/callback/google/flutter/` } as any));

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

        return res
            .status(200)
            .cookie('auth_token', token, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
                maxAge: cookieAgeMs,
            })
            .redirect(`${process.env.CLIENT_URL}/dashboard`);
    },
);

authRouter.get('/callback/google/flutter/', passport.authenticate('google', {
    failureRedirect: 'examduler://login/error',
    session: false,
}), (req: Request, res: Response) => {
    const token = req.user?.token;
    return res.status(200).redirect(`examduler://login/success?token=${token}`);
});