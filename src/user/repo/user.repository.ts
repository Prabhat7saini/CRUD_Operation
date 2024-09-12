import { Repository } from 'typeorm';
import { User } from '../entities/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateUserDto } from '../dto/create-user.dto';
import * as bcrypt from 'bcryptjs';
import { UpdateUserDto } from '../dto/update-user.dto';
import { ERROR_MESSAGES, SUCCESS_MESSAGES } from '../../utils/constants/message'; 

export class UserRepository extends Repository<User> {
    private readonly saltRounds = 10;

    constructor(
        @InjectRepository(User)
        private userRepository: Repository<User>,
    ) {
        super(
            userRepository.target,
            userRepository.manager,
            userRepository.queryRunner,
        );
    }

    async findUser({ email, id }: { email?: string, id?: number }): Promise<User | null> {
        if (!email && !id) {

            throw new Error(ERROR_MESSAGES.REQUIRED_ID_OR_EMAIL);
        }

        const query: { where: { email?: string, id?: number } } = { where: {} };

        if (email) {
            query.where.email = email;
        }
        if (id) {
            query.where.id = id;
        }

        try {
            const user = await this.userRepository.findOne(query);
            return user || null;
        } catch (error) {
            if (error.code) {
                console.error('Database error:', error);
                throw new Error(ERROR_MESSAGES.DATABASE_ERROR);
            } else {
                console.error('Unexpected error:', error);
                throw new Error(ERROR_MESSAGES.UNEXPECTED_ERROR);
            }
        }
    }

    async CreateUser(createUserDto: CreateUserDto): Promise<void> {
        try {
            const hashPassword = await bcrypt.hash(createUserDto.password, this.saltRounds);
            const user = this.userRepository.create({
                ...createUserDto,
                password: hashPassword
            });

            await this.userRepository.save(user);

            console.log(SUCCESS_MESSAGES.USER_CREATED_SUCCESSFULLY);
        } catch (error) {
            if (error.code === '23505') {
                throw new Error(ERROR_MESSAGES.USER_ALREADY_EXISTS);
            } else {
                console.error('An unexpected error occurred:', error);
                throw new Error(ERROR_MESSAGES.USER_CREATION_FAILED);
            }
        }
    }

    async updateUser(id: number, updateUserDto: UpdateUserDto): Promise<User> {
        if (!id) {
            throw new Error(ERROR_MESSAGES.REQUIRED_ID_OR_EMAIL);
        }
        const user = await this.findUser({ id });
        if (!user) {
            throw new Error(ERROR_MESSAGES.USER_NOT_FOUND);
        }

        try {
            await this.userRepository.update(id, updateUserDto);

            const updatedUser = await this.findUser({ id });
            if (!updatedUser) {
                throw new Error(ERROR_MESSAGES.UNEXPECTED_ERROR);
            }
            return updatedUser;
        } catch (error) {
            throw new Error(ERROR_MESSAGES.USER_UPDATE_FAILED);
        }
    }

    async getUserById(id: number): Promise<User> {
        try {
            const user = await this.findUser({ id });
            if (user) {
                delete user.refreshToken;
                delete user.password;
                delete user.deletedAt;
            }
            return user;
        } catch (error) {
            console.error('Error fetching users:', error);
            throw new Error(ERROR_MESSAGES.USER_FETCH_FAILED);
        }
    }

    async softDeleteUser(id: number): Promise<Boolean> {
        try {
            const result = await this.userRepository.createQueryBuilder()
                .update(User) 
                .set({ deletedAt: new Date() })
                .where('id = :id AND deletedAt IS NULL', { id })
                .execute();

            if (result.affected === 0) {
                // No rows affected means the user was not found or was already deleted
                console.warn(`User with ID ${id} not found or already deleted.`);
                return false;
            }

            return true;
        } catch (error) {
            // Log the error for debugging purposes
            console.error('Error during soft delete operation:', error);

            // Optionally, you can handle different error cases and throw custom errors or handle them as needed
            // throw new Error('Failed to delete user due to an unexpected error');

            return false; // Indicate failure due to an unexpected error
        }
    }
}
