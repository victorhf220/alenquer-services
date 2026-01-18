import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { NestExpressApplication } from '@nestjs/platform-express';
import * as cookieParser from 'cookie-parser';
import * as cors from 'cors';
import { AllExceptionsFilter } from './common/filters/all-exceptions.filter';
import { TimeoutInterceptor } from './common/interceptors/timeout.interceptor';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  app.use(cookieParser());

  // CORS Configuration
  app.enableCors({
    origin: '*', // Adjust this as needed
    credentials: true,
  });

  // Global Validation Pipe
  app.useGlobalPipes(new ValidationPipe({
    transform: true,
    whitelist: true,
  }));

  // Global Filters
  app.useGlobalFilters(new AllExceptionsFilter());

  // Global Interceptors
  app.useGlobalInterceptors(new TimeoutInterceptor());

  await app.listen(3000);
  console.log('Application is running on: http://localhost:3000');
}

bootstrap();