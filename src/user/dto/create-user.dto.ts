import { IsEmail, IsNotEmpty, IsString, IsNumberString } from 'class-validator';
import { ICreateUserDto } from '../interface/user.interface';
import { User } from '../entities/user.entity';
import { IsPasswordComplex } from '../../utils/is-password-complex.decorator';
import { ApiResponce } from 'src/utils/Api_Responce.dto';


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
    @IsPasswordComplex({ message: 'Password must contain at least one uppercase letter, one lowercase letter, one number, one special character, and be at least 8 characters long' })
    password: string;
}



export class getUserResponse extends ApiResponce {
    user: User;

}
