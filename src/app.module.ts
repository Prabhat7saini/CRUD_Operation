import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { UserModule } from './user/user.module';
import { DatabaseModule } from './Database/database.module';
import { AuthModule } from './auth/auth.module';
@Module({
  imports: [ConfigModule.forRoot({
        isGlobal: true,
        envFilePath: ".local.env",
      }),
    DatabaseModule,
    UserModule,
    AuthModule,
    
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {

}
