import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true, // Automatically remove properties not defined in DTO
    forbidNonWhitelisted: true, // Throw error if non-whitelisted properties are provided
    transform: true, // Automatically transform payloads to DTO instances
  }));
  await app.listen(3000);
}
bootstrap();
