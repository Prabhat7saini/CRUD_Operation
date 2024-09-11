import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import * as cookieParser from 'cookie-parser';
import { AuthGuard } from './auth/auth.guard';


async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true, // Automatically remove properties not defined in DTO
    forbidNonWhitelisted: true, // Throw error if non-whitelisted properties are provided
    transform: true, // Automatically transform payloads to DTO instances
  }));
  
  // app.useGlobalGuards(new AuthGuard());
  // app.useGlobalGuards(new AuthGuard()); // Global AuthGuar
  app.use(cookieParser());
  await app.listen(3000);
  
}
bootstrap();
