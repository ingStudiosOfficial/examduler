import type { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { ObjectId } from 'mongodb';
import type { Role } from '../types/user.js';

export function authenticateToken() {
    return async (req: Request, res: Response, next: NextFunction) => {
        console.log('Attempting to authenticate user...');

        const collection = req.db.collection('users');

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
                return res.status(401).json({ message: 'Invalid or expired token.' });
            }

            if (!decoded) {
                console.error('Decoded missing.');
                return res.status(401).json({
                    message: 'Error while decoding JWT',
                });
            }

            console.log('User authenticated:', decoded);

            try {
                console.log('Decoded user ID:', decoded.id);

                const userFromDatabase = await collection.findOne({
                    _id: new ObjectId(decoded.id),
                });

                console.log('User from database:', userFromDatabase);
                console.log('Decoded:', decoded);

                if (!userFromDatabase || userFromDatabase.tokenVersion !== decoded.tokenVersion) {
                    return res.status(401).json({ message: 'Token is no longer valid.' });
                }

                req.user = decoded;
                next();
            } catch (error) {
                console.error('Error fetching user:', error);
                return res.status(500).json({ message: 'An internal server error occurred.' });
            }
        });
    };
}

function getRoleLevel(role: Role): number {
    let roleLevel: number;

    switch (role) {
        case 'student':
            roleLevel = 0;
            break;
        case 'teacher':
            roleLevel = 1;
            break;
        case 'admin':
            roleLevel = 2;
            break;
        default:
            throw new Error(`Invalid role: '${role}'`);
    }

    return roleLevel;
}

export function verifyRole(role: Role) {
    return async (req: Request, res: Response, next: NextFunction) => {
        if (!req.user?.role) {
            return res.status(401).json({
                message: 'Role not provided',
            });
        }

        let requestRoleLevel: number;
        let userRoleLevel: number;

        try {
            requestRoleLevel = getRoleLevel(role);
            userRoleLevel = getRoleLevel(req.user.role as Role);
        } catch (error) {
            console.error('Error while getting role level:', error);
            return res.status(500).json({
                message: 'An internal server error occurred during role lookup.',
            });
        }

        if (userRoleLevel < requestRoleLevel) {
            return res.status(403).json({
                message: `Access denied, insufficient permissions.`,
            });
        }
    };
}
