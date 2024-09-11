import { Test, TestingModule } from '@nestjs/testing';
import { UserService } from './user.service'; 
import { UserRepository } from './repo/user.repository'; 
import { BadRequestException, ConflictException, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto'; 
import { UpdateUserDto } from './dto/update-user.dto'; 

describe('UserService', () => {
  let service: UserService;
  let repository: UserRepository;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        {
          provide: UserRepository,
          useValue: {
            createUser: jest.fn(),
            findUser: jest.fn(),
            updateUser: jest.fn(),
            save: jest.fn(),
            getUserById: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<UserService>(UserService);
    repository = module.get<UserRepository>(UserRepository);
  });

  describe('create', () => {
    it('should create a user successfully', async () => {
      const createUserDto: CreateUserDto = { firstName: 'John', lastName: 'Smith', age: '25', password: 'P1R2w3', email: 'john@example.com' };
      const user = { id: 1, ...createUserDto };
      repository.CreateUser = jest.fn().mockResolvedValue(user);
      repository.findUser = jest.fn().mockResolvedValue(null); // Ensure no existing user

      expect(await service.create(createUserDto)).toEqual({
        message: `User created successfully`,
        statusCode: 201,
        success: true,
      });
    });

    it('should throw ConflictException if user already exists', async () => {
      const createUserDto: CreateUserDto = { firstName: 'John', lastName: 'Smith', age: '25', password: 'P1R2w3', email: 'john@example.com' };
      repository.findUser = jest.fn().mockResolvedValue({ id: 1, ...createUserDto });

      await expect(service.create(createUserDto)).rejects.toThrow(ConflictException);
    });

    it('should throw InternalServerErrorException on error', async () => {
      repository.findUser = jest.fn().mockResolvedValue(null);
      repository.CreateUser = jest.fn().mockRejectedValue('Database error');

      await expect(service.create({ firstName: 'John', lastName: 'Smith', age: '25', password: 'P1R2w3', email: 'john@example.com' })).rejects.toThrow(InternalServerErrorException);
    });
  });

  describe('updateUserDetails', () => {
    it('should throw BadRequestException if id is missing', async () => {
      await expect(service.UpdateUserDetails({ user: { id: null } } as any, {} as UpdateUserDto)).rejects.toThrow(BadRequestException);
    });

    it('should throw NotFoundException if user is not found', async () => {
      repository.updateUser = jest.fn().mockResolvedValue(null);
      repository.findUser = jest.fn().mockResolvedValue(null);

      await expect(service.UpdateUserDetails({ user: { id: 1 } } as any, {} as UpdateUserDto)).rejects.toThrow(NotFoundException);
    });

    it('should throw InternalServerErrorException on error', async () => {
      repository.findUser = jest.fn().mockResolvedValue({ id: 1 });
      repository.updateUser = jest.fn().mockRejectedValue(new Error('Database error'));

      await expect(service.UpdateUserDetails({ user: { id: 1 } } as any, {} as UpdateUserDto)).rejects.toThrow(InternalServerErrorException);
    });

    it('should return updated user details successfully', async () => {
      const updateUserDto: UpdateUserDto = { firstName: 'Jane' };
      const updatedUser = { id: 1, ...updateUserDto, password: 'hashedPassword' };
      repository.updateUser = jest.fn().mockResolvedValue(updatedUser);
      repository.findUser = jest.fn().mockResolvedValue(updatedUser);

      expect(await service.UpdateUserDetails({ user: { id: 1 } } as any, updateUserDto)).toEqual({
        user: { id: 1, firstName: 'Jane' },
        message: 'User updated successfully',
        statusCode: 200,
        success: true,
      });
    });
  });

  describe('softDeleteUser', () => {
    it('should throw NotFoundException if user is not found', async () => {
      repository.findUser = jest.fn().mockResolvedValue(null);

      await expect(service.softDeleteUser({ user: { id: 1 } } as any)).rejects.toThrow(NotFoundException);
    });

    it('should throw InternalServerErrorException on error', async () => {
      repository.findUser = jest.fn().mockResolvedValue({ id: 1 });
      repository.save = jest.fn().mockRejectedValue(new Error('Database error'));

      await expect(service.softDeleteUser({ user: { id: 1 } } as any)).rejects.toThrow(InternalServerErrorException);
    });

    it('should successfully soft delete a user', async () => {
      const user = { id: 1, deletedAt: null };
      repository.findUser = jest.fn().mockResolvedValue(user);
      repository.save = jest.fn().mockResolvedValue({ ...user, deletedAt: new Date() });

      expect(await service.softDeleteUser({ user: { id: 1 } } as any)).toEqual({
        message: 'User successfully deleted',
        statusCode: 200,
        success: true,
      });
    });
  });

  describe('getUser', () => {
    it('should return an error response if user is not found', async () => {
      repository.getUserById = jest.fn().mockResolvedValue(null);

      const response = await service.getUser(1);

      expect(response).toEqual({
        user: null,
        message: 'User with id 1 not found',
        statusCode: 404,
        success: false
      });
    });

    it('should return an error response on unexpected error', async () => {
      repository.getUserById = jest.fn().mockRejectedValue(new Error('Database error'));

      const response = await service.getUser(1);

      expect(response).toEqual({
        user: null,
        message: 'An error occurred: Database error',
        statusCode: 500,
        success: false
      });
    });

    it('should return user details successfully', async () => {
      const user = { id: 1, firstName: 'John' };
      repository.getUserById = jest.fn().mockResolvedValue(user);

      const response = await service.getUser(1);

      expect(response).toEqual({
        user,
        message: 'User successfully fetched',
        statusCode: 200,
        success: true
      });
    });
  });
});
