import { Repository } from 'typeorm';
import { User } from '../entities/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateUserDto } from '../dto/create-user.dto';
import * as bcrypt from 'bcryptjs';
import { UpdateUserDto, UpdateUserResponse } from '../dto/update-user.dto';

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
            throw new Error('Either email or id is required');
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
                throw new Error('An error occurred while retrieving the user');
            } else {

                console.error('Unexpected error:', error);
                throw new Error('An unexpected error occurred while retrieving the user');
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


            console.log('User created successfully:', user);
        } catch (error) {

            if (error.code === '23505') {
                throw new Error('A user with this email already exists');
            }
            else {

                console.error('An unexpected error occurred:', error);
                throw new Error('An unexpected error occurred while creating the user');
            }
        }
    }
    async updateUser(id: number, updateUserDto: UpdateUserDto): Promise<User> {
        if (!id) {
            throw new Error('Id is required');
        }
        const user = await this.findUser({ id });
        if (!user) {
            throw new Error(`User with id ${id} not found`);
        }


        try {
            await this.userRepository.update(id, updateUserDto);


            const updatedUser = await this.findUser({ id });
            if (!updatedUser) {
                throw new Error('Failed to retrieve the updated user');
            }
            return updatedUser;
        } catch (error) {

            throw new Error('An unexpected error occurred while updating the user');

        }
    }
    async getUserById(id:number): Promise<User> {
        try {
            const user = await this.findUser({id});
            delete user.refreshToken;
            delete user.password
            delete user.deletedAt
            return user;
        } catch (error) {
            console.error('Error fetching users:', error);
            throw new Error('Unable to fetch users at the moment. Please try again later.');

        }
    }

}
