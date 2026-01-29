import type { UsersCollection, CredsCollection } from '../types/mongodb.js';
import { createGoogleStrategy } from '../auth/strategies.js';
import passport from 'passport';

export function setupPassport(usersCollection: UsersCollection, credsCollection: CredsCollection) {
    passport.use(createGoogleStrategy(usersCollection, credsCollection));
}