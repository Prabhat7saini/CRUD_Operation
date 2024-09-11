import { IsOptional, IsString, IsNumberString } from 'class-validator';

import { ApiResponce } from 'src/utils/Api_Responce.dto';

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
