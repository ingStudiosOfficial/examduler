import { Router, type Request, type Response } from "express";
import jwt, { type JwtPayload } from 'jsonwebtoken';

interface TrustedTesterPayload extends JwtPayload {
    iss: string;
    app: string;
    scope: string[];   
}

export const trustedTesterRouter = Router();

trustedTesterRouter.post('/set/', async (req: Request, res: Response) => {
    const { token } = req.body;

    if (!process.env.TRUSTED_SECRET) return;

    const payload: TrustedTesterPayload = jwt.verify(token, process.env.TRUSTED_SECRET) as TrustedTesterPayload;

    if (payload.app !== 'examduler') {
        return res.status(403).send('App forbidden from receiving token.');
    }

    res.cookie('trusted_tester_session', token, {
        httpOnly: true,
        secure: true,
        sameSite:'lax',
        path: '/',
    });

    res.status(200).type('html').send(`
        <!DOCTYPE html>
        <html>
            <head>
                <meta charset="utf-8" />
                <title>Examduler | (ing) Studios Trusted Tester Program</title>
            </head>
            <body>
                <h1>Welcome to the Trusted Tester Program for Examduler!</h1>
                <p>You have successfully signed up to be a trusted tester. Please click the button below to acknowledge and redirect to login.</p>
                <button id="redirect-button"></button>
            </body>
            <style>
                body {
                    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                }
            </style>
            <script>
            document.getElementById('redirect-button').addEventListener('click', () => {
                document.location.href = '${process.env.CLIENT_URL}/login';
            });
            </script>
        </html>
    `);
});