// src/express.d.ts
import * as express from 'express';
import { JwtPayload } from './auth/interface/JwtPayload.interface';

declare global {
    namespace Express {
        interface Request {
            user?: JwtPayload; // Replace `any` with the type of your user object if known
        }
    }
}
