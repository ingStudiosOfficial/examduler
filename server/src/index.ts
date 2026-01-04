import express, { type NextFunction, type Request, type Response } from 'express';
import session from 'express-session';
import cors from 'cors';
import path from 'path';
import { Db, MongoClient } from 'mongodb';
import cookieParser from 'cookie-parser';
import passport from 'passport';
import * as dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

import { authRouter } from './routes/oauth.js';
import { sessionRouter } from './routes/session.js';
import { userRouter } from './routes/user.js';
import { examRouter } from './routes/exam.js';
import { examsRouter } from './routes/exams.js';
import { orgRouter } from './routes/org.js';
import { orgsRouter } from './routes/orgs.js';
import { publicRouter } from './routes/public.js';

import { setupPassport } from './utils/auth_utils.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config({
    path: path.join(__dirname, '../.env'),
});

const mongoURI = process.env.MONGODB_URI;
if (!mongoURI) {
    console.error('MongoDB URI not found:', mongoURI);
    process.exit(1);
}

const client: MongoClient = new MongoClient(mongoURI);
let database: Db;

const app = express();
app.set('trust proxy', 1);
app.use(
    cors({
        origin: process.env.CLIENT_URL,
        credentials: true,
        methods: ['GET', 'POST', 'PATCH'],
    }),
);
app.use(cookieParser());
app.use(express.json());
if (!process.env.SESSION_SECRET) {
    console.error('Session secret missing.');
    process.exit(1);
}
app.use(
    session({
        secret: process.env.SESSION_SECRET,
        resave: false,
        saveUninitialized: true,
        cookie: { secure: process.env.NODE_ENV === 'production' },
    }),
);
app.use(passport.initialize());
app.use((req: Request, res: Response, next: NextFunction) => {
    req.db = database;
    next();
});

app.use('/api/oauth2/', authRouter);
app.use('/api/session/', sessionRouter);
app.use('/api/user/', userRouter);
app.use('/api/exam/', examRouter);
app.use('/api/exams/', examsRouter);
app.use('/api/organization/', orgRouter);
app.use('/api/organizations/', orgsRouter);
app.use('/api/public/', publicRouter);

async function connectToMongo() {
    try {
        await client.connect();
        database = client.db(process.env.DB_NAME);
        console.log('Successfully connected to MongoDB.');
    } catch (error) {
        console.error('Error while connecting to MongoDB:', error);
        process.exit(1);
    }
}

async function startServer() {
    await connectToMongo();
    setupPassport(database.collection('users'), database.collection('creds'));
    app.listen(Number(process.env.PORT), () => {
        console.log('Server started successfully!');
    });
}

startServer();
