import { Router, type Request, type Response } from "express";
import { authenticateToken } from "../utils/auth_utils.js";

export const sessionRouter = Router();

sessionRouter.get('/verify/', authenticateToken(), (req: Request, res: Response) => {
    console.log('User authenticated.');
    res.status(200).json({
        message: 'Successfully authenticated user.',
    });
});