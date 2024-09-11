import { Injectable, Res } from '@nestjs/common';
import { UserRepository } from 'src/user/repo/user.repository';
import { loginDto, loginRespone } from './dto/login.dot';
import * as bcrypt from "bcryptjs"
import { JwtService } from '@nestjs/jwt';
import { Response } from 'express';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AuthService {
    constructor(private userRepository: UserRepository, private readonly jwt: JwtService,private readonly config:ConfigService) { }


    async Login(res:Response,loginDto: loginDto): Promise<loginRespone> {
        const { email, password } = loginDto;
        const user = await this.userRepository.findUser({ email });

        if (!user) {
            throw new Error(`User not found with email: ${loginDto.email}`);
        }
        if (! await bcrypt.compare(password, user.password)) {
            throw new Error('Invalid credentials');
        }

        delete user.deletedAt;
        delete user.password;
        delete user.refreshToken

        const accessToken = await this.generateToken({ id: user.id }, '60m');
        const refreshToken = await this.generateToken({ id: user.id }, "1d");
        res.cookie('access_token', accessToken, {
            httpOnly: true,
            maxAge: 60 * 60 * 1000, 
        });

        res.cookie('refresh_token', refreshToken, {
            httpOnly: true,
            maxAge: 24 * 60 * 60 * 1000, 
        });

        return{
            user,
            accessToken,
            refreshToken,
            message:"User Login Successfully",
            statusCode: 200,
            success:true

        }
    }


    async generateToken(payload: any, expiresIn: string): Promise<string> {
        return this.jwt.signAsync(payload, {
            secret: this.config.get<string>("JWT_SECRET"),
            expiresIn: expiresIn,
        });
    }
}
