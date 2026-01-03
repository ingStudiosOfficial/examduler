import { MongoClient, Db } from "mongodb";
import * as dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import path from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config({
    path: path.join(__dirname, '../../.env'),
});

const mongoUri = process.env.MONGODB_URI;

if (!mongoUri) process.exit(1);

const client: MongoClient = new MongoClient(mongoUri);
let database: Db;

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


connectToMongo().then(() => {
    database.collection('users').createIndex({ email: 1 }, { unique: true });
    console.log('Successfully ran migration script.');
    process.exit(0);
});