import { IsEmail, IsNotEmpty, IsString, IsNumberString } from 'class-validator';
import { Expose } from 'class-transformer';
import { ICreateUserDto } from '../interface/user.interface';

export class CreateUserDto implements ICreateUserDto {
    @IsString({ message: 'First name must be a string' })
    @IsNotEmpty({ message: 'First name is required' })
    firstName: string;

    @IsString({ message: 'Last name must be a string' })
    @IsNotEmpty({ message: 'Last name is required' })
    lastName: string;

    @IsNotEmpty({ message: 'Age is required' })
    @IsNumberString({}, { message: 'Age must be a number' })
    age: string;

    @IsEmail({}, { message: 'Email must be a valid email' })
    @IsNotEmpty({ message: 'Email is required' })
    email: string;

    @IsString({ message: 'Password must be a string' })
    @IsNotEmpty({ message: 'Password is required' })
    password: string;
}



export class ApiResponce {
    message: string;
    statusCode: number;
    success: boolean;
}
