import type { NextFunction } from "express";
import type { UsersCollection, CredsCollection } from "../types/mongodb.js";
import type { Request, Response } from "express";
import jwt from 'jsonwebtoken';
import { ObjectId } from "mongodb";
import { createGoogleStrategy } from '../auth/strategies.js';
import passport from 'passport';

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
    let name: string;
    name = `${firstName || ''} ${middleName || ''} ${lastName || ''}`;

    if (name === '') {
        throw new Error('Name is empty.');
    }

    return name;
}

export function authenticateToken() {
    return async (req: Request, res: Response, next: NextFunction) => {
        console.log('Attempting to authenticate user...');

        const collection = req.db.collection('usersCollection');
        
        const jwtSecretKey = process.env.JWT_SECRET_KEY;
        if (!jwtSecretKey) {
            console.error('JWT secret key not found.');
            return;
        }

        const token = req.cookies.auth_token;

        if (!token) {
            return res.status(401).json({ message: 'Access token required.' });
        }

        jwt.verify(token, jwtSecretKey, async (err: any, decoded: any) => {
            if (err) {
                return res.status(403).json({ message: 'Invalid or expired token.' });
            }

            if (!decoded) {
                console.error('Decoded missing.');
                return;
            }

            console.log('User authenticated:', decoded);

            try {
                console.log('Decoded user ID:', decoded.id);

                const userFromDatabase = await collection.findOne({ 
                    '_id': new ObjectId(decoded.id)
                });

                console.log('User from database:', userFromDatabase);

                if (!userFromDatabase || userFromDatabase.tokenVersion !== decoded.tokenVersion) {
                    return res.status(401).json({ message: 'Token is no longer valid.' });
                }

                req.user = decoded;
                next();
            } catch (error) {
                console.error('Error fetching user:', error);
                res.status(500).json({ message: 'Internal server error.' });
                return;
            }
        });
    };
}

export function setupPassport(usersCollection: UsersCollection, credsCollection: CredsCollection) {
    passport.use(createGoogleStrategy(usersCollection, credsCollection));
}