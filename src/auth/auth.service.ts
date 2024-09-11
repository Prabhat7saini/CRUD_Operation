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


    async Login(res: Response, loginDto: loginDto): Promise<loginRespone> {
        try {
            const { email, password } = loginDto;

            // Find user by email
            const user = await this.userRepository.findUser({ email });

            // Check if user exists
            if (!user) {
                throw new Error(`User not found with email: ${loginDto.email}`);
            }

            // Compare passwords
            const isPasswordValid = await bcrypt.compare(password, user.password);
            if (!isPasswordValid) {
                throw new Error('Invalid credentials');
            }

            // Clean up user object
            delete user.deletedAt;
            delete user.password;
            delete user.refreshToken;

            // Generate tokens
            const accessToken = await this.generateToken({ id: user.id }, '60m');
            const refreshToken = await this.generateToken({ id: user.id }, '1d');

            // Set cookies
            res.cookie('access_token', accessToken, {
                httpOnly: true,
                maxAge: 60 * 60 * 1000, // 1 hour
            });

            res.cookie('refresh_token', refreshToken, {
                httpOnly: true,
                maxAge: 24 * 60 * 60 * 1000, // 1 day
            });

            // Return successful response
            return {
                user,
                accessToken,
                refreshToken,
                message: 'User Login Successfully',
                statusCode: 200,
                success: true
            };

        } catch (error) {
            // Handle errors
            console.error('Login error:', error.message);

            // Depending on your application's error handling strategy,
            // you might want to return a standardized error response
            return {
                
                message: error.message || 'An unexpected error occurred',
                statusCode: 500, // or another appropriate status code
                success: false
            };
        }
    }
    async generateToken(payload: any, expiresIn: string): Promise<string> {
        try {
            // Generate the token asynchronously
            return await this.jwt.signAsync(payload, {
                secret: this.config.get<string>('JWT_SECRET'),
                expiresIn: expiresIn,
            });
        } catch (error) {
            // Handle the error (log it, rethrow it, or handle it as needed)
            console.error('Token generation error:', error.message);

            // Rethrow the error or return a fallback value if appropriate
            throw new Error('Failed to generate token');
        }
    }
}
