import { forwardRef, Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { UserRepository } from './repo/user.repository';
import { JwtService } from '@nestjs/jwt';
import { ResponseService } from 'src/utils/ResponseService';

@Module({
  imports: [TypeOrmModule.forFeature([User, UserRepository])],
  controllers: [UserController],
  providers: [UserService, UserRepository, JwtService, ResponseService],
  exports: [UserService, UserRepository, JwtService, ResponseService]
})
export class UserModule {}
