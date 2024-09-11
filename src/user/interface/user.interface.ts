import { Request } from "express";
import { JwtPayload } from "src/auth/interface/JwtPayload.interface";


export interface ICreateUserDto {
    firstName: string;
    lastName: string;
    age: string;
    email: string;
    password: string;
    refreshToken?: string;
}


export interface IUpdateUserDto{
    firstName?: string;
    lastName?: string;
    age?: string;
    refreshToken?: string;
}


export interface CustomRequest extends Request {
    user?: JwtPayload
};