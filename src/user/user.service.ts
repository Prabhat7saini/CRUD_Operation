import { BadRequestException, ConflictException, Injectable, InternalServerErrorException, Logger, NotFoundException, Req } from '@nestjs/common';
import { CreateUserDto, getUserResponse } from './dto/create-user.dto';
import { UserRepository } from './repo/user.repository';
import { UpdateUserDto, UpdateUserResponse } from './dto/update-user.dto';
import { ApiResponce } from '../utils/Api_Responce.dto';
import { CustomRequest } from './interface/user.interface';
import { ERROR_MESSAGES, SUCCESS_MESSAGES } from '../utils/constants/message';
import { ResponseService } from '../utils/ResponseService';


@Injectable()
export class UserService {
  private readonly logger = new Logger(UserService.name);
  constructor(
    private readonly userRepository: UserRepository,
    private readonly responceService: ResponseService
  ) { }

  async create(createUserDto: CreateUserDto): Promise<ApiResponce> {
    try {
      const email = createUserDto.email;
      const existUser = await this.userRepository.findUser({ email });

      if (existUser) {
        return this.responceService.error(ERROR_MESSAGES.USER_ALREADY_EXISTS, 409)
      }

      await this.userRepository.CreateUser(createUserDto);
      return this.responceService.success( SUCCESS_MESSAGES.USER_CREATED_SUCCESSFULLY,201)

    } catch (error) {
      return this.responceService.error(ERROR_MESSAGES.UNEXPECTED_ERROR, 500)

    }
  }

  async UpdateUserDetails(@Req() req: CustomRequest, updateUserDto: UpdateUserDto): Promise<UpdateUserResponse> {
    try {
      const id = +req.user.id;

      if (!id) {
        return this.responceService.error(ERROR_MESSAGES.ID_REQUIRED)

      }

      const user = await this.userRepository.findUser({ id });
      if (!user) {
        return this.responceService.error(ERROR_MESSAGES.USER_NOT_FOUND, 404);

      }

      const updatedUser = await this.userRepository.updateUser(id, updateUserDto);
      const { password: _, ...userWithoutPassword } = updatedUser;
      delete userWithoutPassword.refreshToken;
      delete userWithoutPassword.deletedAt;

      return this.responceService.success(SUCCESS_MESSAGES.USER_UPDATED_SUCCESSFULLY, 201,userWithoutPassword)
    } catch (error) {
      return this.responceService.error(ERROR_MESSAGES.USER_UPDATE_FAILED, 500)

    }
  }

  async softDeleteUser(@Req() req: CustomRequest): Promise<ApiResponce> {
    try {
      const id = +req.user.id;
      const result = await this.userRepository.softDeleteUser(id);
      if (!result) {
        return this.responceService.error(ERROR_MESSAGES.USER_DELETION_FAILED,500)
      }
      return this.responceService.success(SUCCESS_MESSAGES.USER_DELETED_SUCCESSFULLY);
    } catch (error) {
      console.error('Error during soft delete:', error);
      return this.responceService.error(ERROR_MESSAGES.USER_DELETION_FAILED, 500);
    }
  }



  async getUser(id: number): Promise<getUserResponse> {
    try {
      const user = await this.userRepository.getUserById(id);

      if (!user) {
        return this.responceService.error(ERROR_MESSAGES.USER_NOT_FOUND_BY_ID(id), 404);
      }
      return this.responceService.success(SUCCESS_MESSAGES.USER_FETCHED_SUCCESSFULLY, 200,user)

    } catch (error) {
      return this.responceService.error(ERROR_MESSAGES.USER_FETCH_FAILED, 500)
    }
  }
}
