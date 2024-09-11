import { Body, Controller, Delete, Get, Param, Patch, Post, Req, UseGuards } from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto, getUserResponse } from './dto/create-user.dto';
import { UpdateUserDto, UpdateUserResponse } from './dto/update-user.dto';
import { ApiResponce } from 'src/utils/Api_Responce.dto';
import { AuthGuard } from 'src/auth/auth.guard'
import { CustomRequest } from './interface/user.interface';
@Controller(`/user`)

export class UserController {
  constructor(private readonly userService: UserService) { }
  @Post(`/create`)
  async createUser(@Body() createUserDto: CreateUserDto): Promise<ApiResponce> {
    return this.userService.create(createUserDto);
  }
  @UseGuards(AuthGuard)
  @Patch()
  async UpdateUserDetails(@Req() req: CustomRequest, @Body() userUpdateDto: UpdateUserDto): Promise<UpdateUserResponse> {
    return await this.userService.UpdateUserDetails(req, userUpdateDto)
  }


  @UseGuards(AuthGuard)
  @Delete(`/delete`)
  async DeteleUser(@Req() req: CustomRequest): Promise<ApiResponce> {

    return await this.userService.softDeleteUser(req);
  }



  @Get(`/:id`)
  async getUsers(@Param() param: { id: number }): Promise<getUserResponse> {
    const { id } = param;
    return this.userService.getUser(id);
  }
}
