import { Strategy as GoogleStrategy } from 'passport-google-oidc';
import jwt from 'jsonwebtoken';
import path from 'path';
import * as dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import type { ObjectId } from 'mongodb';
import type { Profile } from 'passport';
import type { CredsCollection, UnverifiedUsersCollection, UsersCollection } from '../types/mongodb.js';
import { constructName, getDomain } from '../utils/user_utils.js';
import type { IUser } from '../interfaces/User.js';
import type { IJWTPayload } from '../interfaces/JWTPayload.js';
import type { Role } from '../types/user.js';
import type { VerifyCallback } from 'passport-oauth2';
import { Strategy as GoogleOAuthStrategy } from 'passport-google-oauth20';
import { addDomainPrefix } from '../utils/org_utils.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config({
    path: path.join(__dirname, '../../.env'),
});

const googleClientId = process.env.GOOGLE_CLIENT_ID;
const googleClientSecret = process.env.GOOGLE_CLIENT_SECRET;

export function createGoogleStrategy(usersCollection: UsersCollection, credsCollection: CredsCollection, unverifiedUsersCollection: UnverifiedUsersCollection): GoogleOAuthStrategy {
    return new GoogleStrategy(
        {
            clientID: googleClientId,
            clientSecret: googleClientSecret,
            scope: ['profile', 'email'],
        },
        async function verify(issuer: string, profile: Profile, cb: VerifyCallback) {
            try {
                const credential = await credsCollection.findOne({
                    provider: issuer,
                    subject: profile.id,
                });

                if (!credential) {
                    if (!profile.emails?.[0]?.value) {
                        console.error('No email found from profile.');
                        return cb(new Error('No email found from profile.'));
                    }

                    const userEmail = profile.emails[0].value;
                    const userDomain = addDomainPrefix(getDomain(userEmail));
                    const userName: string = constructName(profile.name?.givenName, profile.name?.middleName, profile.name?.familyName);

                    const userExists = await usersCollection.findOne({ email: userEmail });

                    let userId: ObjectId;
                    let tokenVersion: number;
                    let role: Role;
                    let email: string;

                    if (!userExists) {
                        const unverifiedUser = await unverifiedUsersCollection.findOne({ email: userEmail });
                        if (unverifiedUser) {
                            await unverifiedUsersCollection.deleteOne({ email: userEmail });
                        }

                        const userDataToStore: IUser = {
                            email: userEmail,
                            domain: userDomain,
                            name: userName,
                            exams: unverifiedUser?.exams || [],
                            organizations: [],
                            role: 'admin',
                            tokenVersion: 0,
                        };

                        const result = await usersCollection.insertOne(userDataToStore);

                        if (!result.insertedId) {
                            return cb(new Error('Error while inserting user.'));
                        }

                        userId = result.insertedId;
                        tokenVersion = userDataToStore.tokenVersion;
                        role = userDataToStore.role;
                        email = userDataToStore.email;
                    } else {
                        userId = userExists._id;
                        tokenVersion = userExists.tokenVersion;
                        role = userExists.role;
                        email = userExists.email;
                    }

                    const credsResult = await credsCollection.insertOne({
                        userId: userId,
                        provider: issuer,
                        subject: profile.id,
                    });

                    if (!credsResult) {
                        return cb(new Error('Error while inserting credential.'));
                    }

                    let payload: IJWTPayload;

                    payload = {
                        id: userId.toString(),
                        tokenVersion: tokenVersion,
                        role: role,
                        email: email,
                    };

                    const jwtSecretKey: string | undefined = process.env.JWT_SECRET_KEY;
                    if (!jwtSecretKey) {
                        return cb(new Error('JWT secret key missing.'));
                    }

                    const DURATION_DAYS = 7;
                    const tokenExpiry = `${DURATION_DAYS}d`;

                    const token = jwt.sign(payload, jwtSecretKey, { expiresIn: tokenExpiry });

                    return cb(null, { token: token, id: payload.id, tokenVersion: payload.tokenVersion, role: payload.role, email: payload.email });
                }

                const fetchedUser = await usersCollection.findOne({ _id: credential.userId });

                if (!fetchedUser) {
                    return cb('User does not exist.');
                }

                const payload: IJWTPayload = {
                    id: fetchedUser._id.toString(),
                    tokenVersion: fetchedUser.tokenVersion,
                    role: fetchedUser.role,
                    email: fetchedUser.email,
                };

                const jwtSecretKey: string | undefined = process.env.JWT_SECRET_KEY;
                if (!jwtSecretKey) {
                    return cb(new Error('JWT secret key missing.'));
                }

                const DURATION_DAYS = 7;
                const tokenExpiry = `${DURATION_DAYS}d`;

                const token = jwt.sign(payload, jwtSecretKey, { expiresIn: tokenExpiry });

                return cb(null, { token: token, id: payload.id, tokenVersion: payload.tokenVersion, role: payload.role, email: payload.email });
            } catch (error) {
                console.error('Error while fetching Google OAuth:', error);
                return cb(error);
            }
        },
    );
}
