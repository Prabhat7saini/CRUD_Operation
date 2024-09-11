import { Test, TestingModule } from '@nestjs/testing';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { CreateUserDto, ApiResponce, getUserResponse } from './dto/create-user.dto';
import { UpdateUserDto, UpdateUserResponse } from './dto/update-user.dto';
import { User } from './entities/user.entity'; // Assuming the User entity is imported from this path

describe('UserController', () => {
  let controller: UserController;
  let service: UserService;

  // Mocking UserService
  const mockUserService = {
    create: jest.fn(),
    UpdateUserDetails: jest.fn(),
    softDeleteUser: jest.fn(),
    getUser: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserController],
      providers: [
        { provide: UserService, useValue: mockUserService },
      ],
    }).compile();

    controller = module.get<UserController>(UserController);
    service = module.get<UserService>(UserService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('createUser', () => {
    it('should create a user', async () => {
      const createUserDto: CreateUserDto = {
        firstName: 'John',
        lastName: 'Doe',
        age: '30',
        email: 'john.doe@example.com',
        password: 'Password123!',
      };

      const result: ApiResponce = {
        message: 'User created successfully',
        statusCode: 201,
        success: true,
      };

      mockUserService.create.mockResolvedValue(result);

      expect(await controller.createUser(createUserDto)).toEqual(result);
      expect(mockUserService.create).toHaveBeenCalledWith(createUserDto);
    });
  });

  describe('UpdateUserDetails', () => {
    it('should update user details', async () => {
      const id = 1;
      const updateUserDto: UpdateUserDto = {
        firstName: 'Jane',
        lastName: 'Doe',
        age: '29',
      };

      const result: UpdateUserResponse = {
        message: 'User updated successfully',
        statusCode: 200,
        success: true,
        user: updateUserDto,
      };

      mockUserService.UpdateUserDetails.mockResolvedValue(result);

      expect(await controller.UpdateUserDetails({ id }, updateUserDto)).toEqual(result);
      expect(mockUserService.UpdateUserDetails).toHaveBeenCalledWith(id, updateUserDto);
    });
  });

  describe('DeteleUser', () => {
    it('should delete a user', async () => {
      const id = 1;
      const result: ApiResponce = {
        message: 'User deleted successfully',
        statusCode: 200,
        success: true,
      };

      mockUserService.softDeleteUser.mockResolvedValue(result);

      expect(await controller.DeteleUser({ id })).toEqual(result);
      expect(mockUserService.softDeleteUser).toHaveBeenCalledWith(id);
    });
  });

  describe('getUsers', () => {
    it('should get user details', async () => {
      const id = 1;
      const user: User = {
        id,
        firstName: 'John',
        lastName: 'Doe',
        age: '30',
        email: 'john.doe@example.com',
        password: 'Password123!',
        refreshToken:"rtygvuy7tygvhuhuhuhyughuhygyvgyugvvgvguygvuy"
      };

      const result: getUserResponse = {
        message: 'User found',
        statusCode: 200,
        success: true,
        user,
      };

      mockUserService.getUser.mockResolvedValue(result);

      expect(await controller.getUsers({ id })).toEqual(result);
      expect(mockUserService.getUser).toHaveBeenCalledWith(id);
    });
  });
});
