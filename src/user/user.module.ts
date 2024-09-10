import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { TypeORMError } from 'typeorm';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { UserRepository } from './repo/user.repository';

@Module({
  imports: [TypeOrmModule.forFeature([User,UserRepository])],
  controllers: [UserController],
  providers: [UserService, UserRepository],
  exports:[UserService, UserRepository]
})
export class UserModule {}
