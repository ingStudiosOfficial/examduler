import express, { type Request, type Response } from "express";
import cors from "cors";
import path from "path";
import { MongoClient, ObjectId } from "mongodb";
import jwt from "jsonwebtoken";
import cookieParser from "cookie-parser";
import passport from "passport";
import * as dotenv from "dotenv";
import { fileURLToPath } from "url";
import { dirname } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({
  path: path.join(__dirname, "./.env"),
});

const app = express();
app.set("trust proxy", 1);
app.use(
  cors({
    origin: process.env.CLIENT_URL,
    credentials: true,
    methods: ["GET"],
  }),
);
app.use(cookieParser());
app.use(express.json());
app.use(passport.initialize());

app.listen(Number(process.env.PORT), () => {
  console.log("Server started successfully!");
});
