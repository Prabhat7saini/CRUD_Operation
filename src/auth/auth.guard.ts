// auth.guard.ts
import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Reflector } from '@nestjs/core';
import { Request } from 'express';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AuthGuard implements CanActivate {
    constructor(private jwtService: JwtService, private reflector: Reflector,private config:ConfigService) { }

    canActivate(context: ExecutionContext): boolean {
        const JWT_SECRET = this.config.get<string>("JWT_SECRET")
        // console.log(JWT_SECRET,"JWT_SECRET")
        const request: Request = context.switchToHttp().getRequest();
        const token = request.headers.authorization?.split(' ')[1];
        console.log(token,"token");
        if (!token) return false;


        try {
            // console.log(`token ${token}`)
            const payload = this.jwtService.verify(token, { secret:JWT_SECRET});
            // console.log(`payload ${payload.id}`)
            request.user = payload;
            return true;
        } catch (error) {
            console.error('Token verification error:', error.message);
            return false;
        }
    }
}
