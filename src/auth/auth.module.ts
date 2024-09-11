import { forwardRef, Module, Logger } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { UserModule } from 'src/user/user.module';
import { AuthGuard } from './auth.guard';

@Module({
  imports: [
    UserModule,
    JwtModule.registerAsync({
      useFactory: async (configService: ConfigService) => {
        const logger = new Logger('JwtModule'); // Create a Logger instance

        const secret = configService.get<string>('JWT_SECRET');
        logger.debug(`JWT Secret: ${secret}`); // Log the JWT secret (for debugging)

        return {
          secret,
        };
      },
      inject: [ConfigService],
    }),
  ],
  providers: [AuthService, AuthGuard],
  controllers: [AuthController],
  exports: [AuthGuard],
})
export class AuthModule { }
