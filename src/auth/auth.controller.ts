import { Body, Controller, Post, Res } from '@nestjs/common';
import { AuthService } from './auth.service';
import { loginDto, loginRespone } from './dto/login.dot';
import { Response } from 'express';

@Controller('auth')
export class AuthController {
    constructor(private readonly authService:AuthService){}

    @Post()
    async login(@Res({ passthrough: true }) res: Response ,@Body() loginDto:loginDto):Promise<loginRespone>{
        return this.authService.Login(res,loginDto);
    }
}
