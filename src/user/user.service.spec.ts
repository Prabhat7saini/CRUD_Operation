import { Test, TestingModule } from '@nestjs/testing';
import { UserService } from './user.service'; // Adjust path as necessary
import { UserRepository } from './repo/user.repository'; // Adjust path as necessary
import { BadRequestException, NotFoundException, InternalServerErrorException } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto'; // Adjust path as necessary
import { UpdateUserDto } from './dto/update-user.dto'; // Adjust path as necessary

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
            deleteUser: jest.fn(),
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
      const createUserDto: CreateUserDto = { firstName: 'John', lastName:"Smith" ,age:"25",password:"P1R2w3",email:"john@example.com"};
      const user = { id: 1, ...createUserDto };
      repository.CreateUser = jest.fn().mockResolvedValue(user);
      expect(await service.create(createUserDto)).toEqual(user);
    });

    it('should throw InternalServerErrorException on error', async () => {
      repository.CreateUser = jest.fn().mockRejectedValue(new Error('Database error'));
      await expect(service.create({ firstName: 'John', lastName: "Smith", age: "25", password: "P1R2w3", email: "john@example.com" })).rejects.toThrow(InternalServerErrorException);
    });
  });

  describe('updateUserDetails', () => {
    it('should throw BadRequestException if id is missing', async () => {
      await expect(service.UpdateUserDetails(null, {} as UpdateUserDto)).rejects.toThrow(BadRequestException);
    });

    it('should throw NotFoundException if user is not found', async () => {
      repository.findUser = jest.fn().mockResolvedValue(null);
      await expect(service.UpdateUserDetails(1, {} as UpdateUserDto)).rejects.toThrow(NotFoundException);
    });

    it('should throw InternalServerErrorException on error', async () => {
      repository.findUser = jest.fn().mockRejectedValue(new Error('Database error'));
      await expect(service.UpdateUserDetails(1, {} as UpdateUserDto)).rejects.toThrow(InternalServerErrorException);
    });
  });

  describe('softDeleteUser', () => {
    it('should throw NotFoundException if user is not found', async () => {
      repository.findUser = jest.fn().mockResolvedValue(null);
      await expect(service.softDeleteUser(1)).rejects.toThrow(NotFoundException);
    });

    it('should throw InternalServerErrorException on error', async () => {
      repository.findUser = jest.fn().mockRejectedValue(new Error('Database error'));
      await expect(service.softDeleteUser(1)).rejects.toThrow(InternalServerErrorException);
    });
  });

  describe('getUser', () => {
    it('should throw NotFoundException if user is not found', async () => {
      repository.getUserById = jest.fn().mockResolvedValue(null);
      await expect(service.getUser(1)).rejects.toThrow(NotFoundException);
    });

    it('should throw InternalServerErrorException on error', async () => {
      repository.getUserById = jest.fn().mockRejectedValue(new Error('Database error'));
      await expect(service.getUser(1)).rejects.toThrow(InternalServerErrorException);
    });
  });
});
