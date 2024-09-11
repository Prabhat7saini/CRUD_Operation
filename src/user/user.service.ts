import { BadRequestException, ConflictException, Injectable, InternalServerErrorException, Logger, NotFoundException, Param, Req } from '@nestjs/common';
import { CreateUserDto, getUserResponse } from './dto/create-user.dto';
import { UserRepository } from './repo/user.repository';
import { UpdateUserDto, UpdateUserResponse } from './dto/update-user.dto';
import { User } from './entities/user.entity';
import { ApiResponce } from 'src/utils/Api_Responce.dto';
import { CustomRequest } from './interface/user.interface';




@Injectable()
export class UserService {
  private readonly logger = new Logger(UserService.name);
  constructor(
    private readonly userRepository: UserRepository
  ) { }


  async create(createUserDto: CreateUserDto): Promise<ApiResponce> {
    
    try {
      const email = createUserDto.email;

      const existUser = await this.userRepository.findUser(email ? { email } : {});


      if (existUser) {
        throw new ConflictException('User with this email already exists');
      }

      await this.userRepository.CreateUser(createUserDto);
      return {
        message: `User created successfully`,
        statusCode: 201,
        success: true,
      };


    } catch (error) {
      if (error instanceof ConflictException) {
        throw error;
      }
      throw new InternalServerErrorException('An unexpected error occurred. Please try again later.', error.message);
    }
  }

 
  async UpdateUserDetails(@Req() req: CustomRequest, updateUserDto: UpdateUserDto): Promise<UpdateUserResponse> {
    try {
      const id = +req.user.id;

      if (!id) {
        throw new BadRequestException('Id is required');
      }

      const user = await this.userRepository.findUser({ id });
      if (!user) {
        throw new NotFoundException('User not found');
      }

      const updatedUser = await this.userRepository.updateUser(id, updateUserDto);
      const { password: _, ...userWithoutPassword } = updatedUser;
      delete userWithoutPassword.refreshToken;
      delete userWithoutPassword.deletedAt;

      return {
        user: userWithoutPassword,
        message: 'User updated successfully',
        statusCode: 200,
        success: true,
      };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      } else if (error instanceof BadRequestException) {
        throw error;
      } else {
        throw new InternalServerErrorException('An unexpected error occurred while updating the user');
      }

    }
  }


 
  async softDeleteUser(@Req() req: CustomRequest): Promise<ApiResponce> {
    try {
      const id = +req.user.id;
      const user = await this.userRepository.findUser({ id });

      if (!user) {
        throw new NotFoundException(`User with ID ${id} not found`);
      }

      user.deletedAt = new Date();
      await this.userRepository.save(user);

      return {
        message: 'User successfully deleted',
        statusCode: 200,
        success: true,
      };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException('An unexpected error occurred while deleting the user');
    }
  }

  async getUser(id: number): Promise<getUserResponse> {
    try {

      const user = await this.userRepository.getUserById(id);


      if (!user) {
        return {
          user: null,
          message: `User with id ${id} not found`,
          statusCode: 404,
          success: false
        };
      }


      return {
        user,
        message: `User successfully fetched`,
        statusCode: 200,
        success: true
      };

    } catch (error) {

      return {
        user: null,
        message: `An error occurred: ${error.message}`,
        statusCode: 500,
        success: false
      };
    }
  }

}