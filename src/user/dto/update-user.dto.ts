import { IsOptional, IsString, IsNumberString } from 'class-validator';
import { PartialType } from '@nestjs/mapped-types';
import { ApiResponce, CreateUserDto } from './create-user.dto';
import { IUpdateUserDto } from '../interface/user.interface';

export class UpdateUserDto{
  @IsOptional()
  @IsString({ message: 'First name must be a string' })
  firstName?: string;

  @IsOptional()
  @IsString({ message: 'Last name must be a string' })
  lastName?: string;

  @IsOptional()
  @IsNumberString({}, { message: 'Age must be a number' })
  age?: string;
}

export class UpdateUserResponse extends ApiResponce {
  user: UpdateUserDto;
}
