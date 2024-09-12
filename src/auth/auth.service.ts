import { Injectable, Res } from '@nestjs/common';
import { UserRepository } from 'src/user/repo/user.repository';
import { loginDto, loginRespone } from './dto/login.dot';
import * as bcrypt from "bcryptjs"
import { JwtService } from '@nestjs/jwt';
import { Response } from 'express';
import { ConfigService } from '@nestjs/config';
import { ERROR_MESSAGES, SUCCESS_MESSAGES } from 'src/utils/constants/message';
import { ResponseService } from 'src/utils/ResponseService';

@Injectable()
export class AuthService {
    constructor(private userRepository: UserRepository, private readonly jwt: JwtService, private readonly config: ConfigService,
        private readonly responceService: ResponseService
    ) { }


    async Login(res: Response, loginDto: loginDto): Promise<loginRespone> {
        try {
            const { email, password } = loginDto;


            const user = await this.userRepository.findUser({ email });


            if (!user) {
                return this.responceService.error(ERROR_MESSAGES.USER_NOT_FOUND, 404);
            }


            const isPasswordValid = await bcrypt.compare(password, user.password);
            if (!isPasswordValid) {
                this.responceService.error(ERROR_MESSAGES.INVALID_CREDENTIALS)
                throw new Error();
            }


            delete user.deletedAt;
            delete user.password;
            delete user.refreshToken;


            const accessToken = await this.generateToken({ id: user.id }, '60m');
            const refreshToken = await this.generateToken({ id: user.id }, '1d');


            res.cookie('access_token', accessToken, {
                httpOnly: true,
                maxAge: 60 * 60 * 1000,
            });

            res.cookie('refresh_token', refreshToken, {
                httpOnly: true,
                maxAge: 24 * 60 * 60 * 1000,
            });

            const ResoData = {
                user,
                accessToken, refreshToken
            }
            return this.responceService.success(SUCCESS_MESSAGES.USER_LOGIN_SUCCESSFULLY, 200, ResoData)

        } catch (error) {
            console.error('Login error:', error.message);
            return this.responceService.error(error.message || ERROR_MESSAGES.UNEXPECTED_ERROR, 500)

        }
    }
    async generateToken(payload: any, expiresIn: string): Promise<string> {
        try {
            return await this.jwt.signAsync(payload, {
                secret: this.config.get<string>('JWT_SECRET'),
                expiresIn: expiresIn,
            });
        } catch (error) {

            console.error('Token generation error:', error.message);
            throw new Error('Failed to generate token');
        }
    }
}
