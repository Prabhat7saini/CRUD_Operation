import { BadRequestException, ConflictException, Injectable, InternalServerErrorException, Logger, NotFoundException, Param } from '@nestjs/common';
import { ApiResponce, CreateUserDto } from './dto/create-user.dto';
import { UserRepository } from './repo/user.repository';
import { UpdateUserDto, UpdateUserResponse } from './dto/update-user.dto';


@Injectable()

@Injectable()
export class UserService {
  private readonly logger = new Logger(UserService.name);
  constructor(
    private readonly userRepository: UserRepository
  ) { }


  async create(createUserDto: CreateUserDto): Promise<ApiResponce> {
    console.log(`creating`)
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

  async UpdateUserDetails(@Param() id: number, updateUserDto: UpdateUserDto): Promise<UpdateUserResponse> {

    try {

      if (!id) {
        throw new BadRequestException('Id is required');
      }
      const updatedUser = await this.userRepository.updateUser(id, updateUserDto);
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
        throw new NotFoundException(`User with id ${id} not found`);
      }
      else {
        console.log(error.message);
        throw new InternalServerErrorException('An unexpected error occurred while updating the user');
      }
    }

  }



  async softDeleteUser(id: number): Promise<ApiResponce> {
    try {

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

        throw error;
      }

      
      console.error('Unexpected error occurred while deleting user:', error);
      throw new InternalServerErrorException('An unexpected error occurred');
    }
    }
  }



