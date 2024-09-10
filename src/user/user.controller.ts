import { Body, Controller, Delete, Param, Patch, Post } from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto, ApiResponce } from './dto/create-user.dto';
import { UpdateUserDto, UpdateUserResponse } from './dto/update-user.dto';
import { IUpdateUserDto } from './interface/user.interface';

@Controller(`/user`)
export class UserController {
  constructor(private readonly userService: UserService) {}
@Post(`/create`)
async createUser(@Body() createUserDto: CreateUserDto): Promise<ApiResponce>{
  return this.userService.create(createUserDto);
}

@Patch(`/:id`)
async UpdateUserDetails(@Param() param:{id:number}, @Body() userUpdateDto: UpdateUserDto):Promise<UpdateUserResponse> { 
  
  const {id} = param;

return await this.userService.UpdateUserDetails(id, userUpdateDto)

}


@Delete(`/:id/delete`)
async DeteleUser(@Param() param:{id:number}):Promise<ApiResponce>{
  const {id}=param;
  return await this.userService.softDeleteUser(id);
}
}
