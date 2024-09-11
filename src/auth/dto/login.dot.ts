import { IsEmail, IsNotEmpty, IsString } from "class-validator";
import { User } from "src/user/entities/user.entity";
import { ApiResponce } from "src/utils/Api_Responce.dto";

export class loginDto{
    @IsEmail()
    @IsString()
    @IsNotEmpty()
    email: string;

    @IsString()
    @IsNotEmpty()
    password: string;
}

export class loginRespone extends ApiResponce{
    user: User;
    accessToken: string;
    refreshToken: string;
}