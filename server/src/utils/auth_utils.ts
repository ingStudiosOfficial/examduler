import type { UsersCollection, CredsCollection, UnverifiedUsersCollection } from '../types/mongodb.js';
import { createGoogleStrategy } from '../auth/strategies.js';
import passport from 'passport';

export function setupPassport(usersCollection: UsersCollection, credsCollection: CredsCollection, unverifiedUsersCollection: UnverifiedUsersCollection) {
    passport.use(createGoogleStrategy(usersCollection, credsCollection, unverifiedUsersCollection));
}
