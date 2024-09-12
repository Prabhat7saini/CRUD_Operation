import { Test, TestingModule } from '@nestjs/testing';
import { UserService } from './user.service';
import { UserRepository } from './repo/user.repository';
import { ResponseService } from '../utils/ResponseService';
import { CreateUserDto, getUserResponse } from './dto/create-user.dto';
import { UpdateUserDto, UpdateUserResponse } from './dto/update-user.dto';
import { ERROR_MESSAGES, SUCCESS_MESSAGES } from '../utils/constants/message';

describe('UserService', () => {
  let service: UserService;
  let userRepository: UserRepository;
  let responseService: ResponseService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        {
          provide: UserRepository,
          useValue: {
            findUser: jest.fn(),
            CreateUser: jest.fn(),
            updateUser: jest.fn(),
            softDeleteUser: jest.fn(),
            getUserById: jest.fn(),
          },
        },
        {
          provide: ResponseService,
          useValue: {
            success: jest.fn(),
            error: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<UserService>(UserService);
    userRepository = module.get<UserRepository>(UserRepository);
    responseService = module.get<ResponseService>(ResponseService);
  });

  describe('create', () => {
    it('should create a user successfully', async () => {
      const createUserDto: CreateUserDto = { email: 'test@example.com', firstName: 'Test User', lastName: "Test Lst", age: "19", password: 'P1R2a3#4' };

      jest.spyOn(userRepository, 'findUser').mockResolvedValue(null);  // No existing user
      jest.spyOn(userRepository, 'CreateUser').mockResolvedValue(undefined);  // User created
      jest.spyOn(responseService, 'success').mockReturnValue({
        statusCode: 201,
        message: SUCCESS_MESSAGES.USER_CREATED_SUCCESSFULLY,
        success: true,
      });

      const result = await service.create(createUserDto);
      expect(result).toEqual({
        statusCode: 201,
        message: SUCCESS_MESSAGES.USER_CREATED_SUCCESSFULLY,
        success: true,
      });
    });

    it('should return error if user already exists', async () => {
      const createUserDto: CreateUserDto = { email: 'test@example.com', firstName: 'Test User', lastName: "Test Lst", age: "19", password: 'P1R2a3#4' };

      jest.spyOn(userRepository, 'findUser').mockResolvedValue({
        id: 1,
        email: 'test@example.com',
        firstName: 'Test User',
        lastName: "Test Lst",
        age: "19",
        password: 'P1R2a3#4',
        refreshToken: "wr",
      });  // User already exists
      jest.spyOn(responseService, 'error').mockReturnValue({
        statusCode: 409,
        message: ERROR_MESSAGES.USER_ALREADY_EXISTS,
        success: false,
      });

      const result = await service.create(createUserDto);
      expect(result).toEqual({
        statusCode: 409,
        message: ERROR_MESSAGES.USER_ALREADY_EXISTS,
        success: false,
      });
    });
    it('should return error if an unexpected exception occurs during user creation', async () => {
      const createUserDto: CreateUserDto = { email: 'test@example.com', firstName: 'Test User', lastName: "Test Lst", age: "19", password: 'P1R2a3#4' };

      jest.spyOn(userRepository, 'findUser').mockResolvedValue(null); // No existing user
      jest.spyOn(userRepository, 'CreateUser').mockRejectedValue(new Error('Unexpected error')); // Simulate unexpected error
      jest.spyOn(responseService, 'error').mockReturnValue({
        statusCode: 500,
        message: ERROR_MESSAGES.UNEXPECTED_ERROR,
        success: false,
      });

      const result = await service.create(createUserDto);
      expect(result).toEqual({
        statusCode: 500,
        message: ERROR_MESSAGES.UNEXPECTED_ERROR,
        success: false,
      });
    });
    it('should hash the password before saving the user', async () => {
      const createUserDto: CreateUserDto = { email: 'test@example.com', firstName: 'Test User', lastName: 'Test Lst', age: '19', password: 'P1R2a3#4' };

      jest.spyOn(userRepository, 'findUser').mockResolvedValue(null); // No existing user
      jest.spyOn(userRepository, 'CreateUser').mockImplementation((dto) => {
        // Validate that password is not in plaintext
        expect(dto.password).not.toBe('P1R2a3#4');
        return Promise.resolve();
      });
      jest.spyOn(responseService, 'success').mockReturnValue({
        statusCode: 201,
        message: SUCCESS_MESSAGES.USER_CREATED_SUCCESSFULLY,
        success: true,
      });

      await service.create(createUserDto);
    });

    it('should handle failure of ResponseService during user creation', async () => {
      const createUserDto: CreateUserDto = { email: 'test@example.com', firstName: 'Test User', lastName: 'Test Lst', age: '19', password: 'P1R2a3#4' };

      jest.spyOn(userRepository, 'findUser').mockResolvedValue(null); // No existing user
      jest.spyOn(userRepository, 'CreateUser').mockResolvedValue(undefined); // User created
      jest.spyOn(responseService, 'success').mockImplementation(() => { throw new Error('ResponseService failure'); });

      try {
        await service.create(createUserDto);
      } catch (e) {
        expect(e.message).toBe('ResponseService failure');
      }
    });
    it('should return error if UserRepository throws an exception during creation', async () => {
      const createUserDto: CreateUserDto = { email: 'test@example.com', firstName: 'Test User', lastName: 'Test Lst', age: '19', password: 'P1R2a3#4' };

      jest.spyOn(userRepository, 'findUser').mockResolvedValue(null); // No existing user
      jest.spyOn(userRepository, 'CreateUser').mockRejectedValue(new Error('Database error')); // Simulate database error
      jest.spyOn(responseService, 'error').mockReturnValue({
        statusCode: 500,
        message: ERROR_MESSAGES.UNEXPECTED_ERROR,
        success: false,
      });

      const result = await service.create(createUserDto);
      expect(result).toEqual({
        statusCode: 500,
        message: ERROR_MESSAGES.UNEXPECTED_ERROR,
        success: false,
      });
    });

  });

  describe('updateUserDetails', () => {
    it('should update user details successfully', async () => {
      const updateUserDto: UpdateUserDto = { firstName: 'Updated Name' };
      const req = { user: { id: 1 } } as any;

      // Mock the user found with all required properties
      jest.spyOn(userRepository, 'findUser').mockResolvedValue({
        id: 1,
        email: 'test@example.com',
        firstName: 'Original Name',
        lastName: 'Last Name',
        age: '23',
        refreshToken: 'ad',
        password: 'test',
      });  // User found

      // Mock the updated user with all required properties
      jest.spyOn(userRepository, 'updateUser').mockResolvedValue({
        id: 1,
        email: 'test@example.com',
        firstName: 'Updated Name', // Ensure this property is not optional in the mocked response
        lastName: 'Last Name',
        age: '23',
        refreshToken: 'token',
        password: 'hashedPassword',
        deletedAt: null,
      });  // User updated

      jest.spyOn(responseService, 'success').mockReturnValue({
        statusCode: 200,
        message: SUCCESS_MESSAGES.USER_UPDATED_SUCCESSFULLY,
        data: { id: 1, name: 'Updated Name' },
        success: true,
      });

      const result = await service.UpdateUserDetails(req, updateUserDto);
      expect(result).toEqual({
        statusCode: 200,
        message: SUCCESS_MESSAGES.USER_UPDATED_SUCCESSFULLY,
        data: { id: 1, name: 'Updated Name' },
        success: true,
      });
    });

    it('should return error if user not found', async () => {
      const updateUserDto: UpdateUserDto = { firstName: 'Updated Name' };
      const req = { user: { id: 1 } } as any;

      jest.spyOn(userRepository, 'findUser').mockResolvedValue(null);  // User not found
      jest.spyOn(responseService, 'error').mockReturnValue({
        statusCode: 404,
        message: ERROR_MESSAGES.USER_NOT_FOUND,
        success: false,
      });

      const result = await service.UpdateUserDetails(req, updateUserDto);
      expect(result).toEqual({
        statusCode: 404,
        message: ERROR_MESSAGES.USER_NOT_FOUND,
        success: false,
      });
    });
    it('should return error if an unexpected exception occurs during user update', async () => {
      const updateUserDto: UpdateUserDto = { firstName: 'Updated Name' };
      const req = { user: { id: 1 } } as any;

      jest.spyOn(userRepository, 'findUser').mockResolvedValue({
        id: 1,
        email: 'test@example.com',
        firstName: 'Original Name',
        lastName: 'Last Name',
        age: '23',
        refreshToken: 'ad',
        password: 'test',
      }); // User found
      jest.spyOn(userRepository, 'updateUser').mockRejectedValue(new Error('Unexpected error')); // Simulate unexpected error
      jest.spyOn(responseService, 'error').mockReturnValue({
        statusCode: 500,
        message: ERROR_MESSAGES.USER_UPDATE_FAILED,
        success: false,
      });

      const result = await service.UpdateUserDetails(req, updateUserDto);
      expect(result).toEqual({
        statusCode: 500,
        message: ERROR_MESSAGES.USER_UPDATE_FAILED,
        success: false,
      });
    });

  });

  describe('softDeleteUser', () => {
    it('should soft delete a user successfully', async () => {
      const req = { user: { id: 1 } } as any;

      jest.spyOn(userRepository, 'softDeleteUser').mockResolvedValue(true);  // Successful deletion
      jest.spyOn(responseService, 'success').mockReturnValue({
        statusCode: 200,
        message: SUCCESS_MESSAGES.USER_DELETED_SUCCESSFULLY,
        success: true,
      });

      const result = await service.softDeleteUser(req);
      expect(result).toEqual({
        statusCode: 200,
        message: SUCCESS_MESSAGES.USER_DELETED_SUCCESSFULLY,
        success: true,
      });
    });

    it('should return error if deletion fails', async () => {
      const req = { user: { id: 1 } } as any;

      jest.spyOn(userRepository, 'softDeleteUser').mockResolvedValue(false);  // Deletion failed
      jest.spyOn(responseService, 'error').mockReturnValue({
        statusCode: 500,
        message: ERROR_MESSAGES.USER_DELETION_FAILED,
        success: false,
      });

      const result = await service.softDeleteUser(req);
      expect(result).toEqual({
        statusCode: 500,
        message: ERROR_MESSAGES.USER_DELETION_FAILED,
        success: false,
      });
    });
    it('should return error if user is not found during soft delete', async () => {
      const req = { user: { id: 1 } } as any;

      jest.spyOn(userRepository, 'softDeleteUser').mockResolvedValue(false); // Deletion failed
      jest.spyOn(responseService, 'error').mockReturnValue({
        statusCode: 500,
        message: ERROR_MESSAGES.USER_DELETION_FAILED,
        success: false,
      });

      const result = await service.softDeleteUser(req);
      expect(result).toEqual({
        statusCode: 500,
        message: ERROR_MESSAGES.USER_DELETION_FAILED,
        success: false,
      });
    });

  });

  describe('getUser', () => {
    it('should return a user successfully', async () => {
      const userId = 1;
      const mockUser = {
        id: 1,
        email: 'test@example.com',
        firstName: 'Test User',
        lastName: 'Test Lst',
        age: '19',
        password: 'P1R2a3#4',
        refreshToken: 'token',
      };

      jest.spyOn(userRepository, 'getUserById').mockResolvedValue(mockUser);  // User found
      jest.spyOn(responseService, 'success').mockReturnValue({
        statusCode: 200,
        message: SUCCESS_MESSAGES.USER_FETCHED_SUCCESSFULLY,
        data: mockUser,
        success: true,
      });

      const result = await service.getUser(userId);
      expect(result).toEqual({
        statusCode: 200,
        message: SUCCESS_MESSAGES.USER_FETCHED_SUCCESSFULLY,
        data: mockUser,
        success: true,
      });
    });

    it('should return an error if user is not found', async () => {
      const userId = 1;

      jest.spyOn(userRepository, 'getUserById').mockResolvedValue(null);  // User not found
      jest.spyOn(responseService, 'error').mockReturnValue({
        statusCode: 404,
        message: ERROR_MESSAGES.USER_NOT_FOUND_BY_ID(userId),
        success: false,
      });

      const result = await service.getUser(userId);
      expect(result).toEqual({
        statusCode: 404,
        message: ERROR_MESSAGES.USER_NOT_FOUND_BY_ID(userId),
        success: false,
      });
    });

    it('should return an error if there is an exception', async () => {
      const userId = 1;

      jest.spyOn(userRepository, 'getUserById').mockRejectedValue(new Error('Database error'));  // Error during fetch
      jest.spyOn(responseService, 'error').mockReturnValue({
        statusCode: 500,
        message: ERROR_MESSAGES.USER_FETCH_FAILED,
        success: false,
      });

      const result = await service.getUser(userId);
      expect(result).toEqual({
        statusCode: 500,
        message: ERROR_MESSAGES.USER_FETCH_FAILED,
        success: false,
      });
    });
    it('should return error if an unexpected exception occurs during user retrieval', async () => {
      const userId = 1;

      jest.spyOn(userRepository, 'getUserById').mockRejectedValue(new Error('Database error')); 
      jest.spyOn(responseService, 'error').mockReturnValue({
        statusCode: 500,
        message: ERROR_MESSAGES.USER_FETCH_FAILED,
        success: false,
      });

      const result = await service.getUser(userId);
      expect(result).toEqual({
        statusCode: 500,
        message: ERROR_MESSAGES.USER_FETCH_FAILED,
        success: false,
      });
    });

  });
});
