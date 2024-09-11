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
    // console.log(`creating`)
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

      this.logger.error('Unexpected error occurred while creating user', error.stack);
      throw new InternalServerErrorException('An unexpected error occurred. Please try again later.', error.message);
    }
  }

  async UpdateUserDetails(@Req() req: CustomRequest, updateUserDto: UpdateUserDto): Promise<UpdateUserResponse> {
    try {
      const id = req.user.id

      if (!id) {
        throw new BadRequestException('Id is required');
      }
      const updatedUser = await this.userRepository.updateUser(+id, updateUserDto);
      const { password: _, ...userWithoutPassword } = updatedUser;
      delete userWithoutPassword.refreshToken;
      delete userWithoutPassword.deletedAt
      // console.log(`user with out password${userWithoutPassword}`);
      return {
        user: userWithoutPassword,
        message: 'User updated successfully',
        statusCode: 200,
        success: true,
      };

    } catch (error) {
      if (error.message.includes('not found')) {
        throw new NotFoundException(`User  not found`);
      }
      else {
        // console.log(error.message);
        throw new InternalServerErrorException('An unexpected error occurred while updating the user');
      }
    }

  }



  async softDeleteUser(@Req() req: CustomRequest): Promise<ApiResponce> {
    try {
      const id = +req.user.id;
      const user = await this.userRepository.findUser({ id });

      // Check if user exists
      if (!user) {
        throw new NotFoundException(`User with ID ${id} not found`);
      }

      // Perform soft delete by setting deletedAt timestamp
      user.deletedAt = new Date();

      // Save the updated user
      await this.userRepository.save(user);

      return {
        message: 'User successfully deleted',
        statusCode: 200,
        success: true,
      };
    } catch (error) {

      if (error instanceof NotFoundException || error instanceof BadRequestException) {
        console.log(error.message, "cehek")
        throw error;
      }


      console.error('Unexpected error occurred while deleting user:', error.message);
      throw new InternalServerErrorException('An unexpected error occurred');
    }
  }

  async getUser(id: number): Promise<getUserResponse> {
    // console.log(id,`id`)
    const user = await this.userRepository.getUserById(id);
    return { user, message: `User successfully Fetch`, statusCode: 200, success: true };

  }
}