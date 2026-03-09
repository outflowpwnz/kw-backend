// src/main.ts
import { ClassSerializerInterceptor, Logger, ValidationPipe } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import * as cookieParser from 'cookie-parser';
import helmet from 'helmet';
import { AppModule } from './app.module';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { TransformInterceptor } from './common/interceptors/transform.interceptor';

async function bootstrap(): Promise<void> {
  const logger = new Logger('Bootstrap');
  const app = await NestFactory.create(AppModule);

  // ── Security ────────────────────────────────────────────
  app.use(
    helmet({
      crossOriginResourcePolicy: { policy: 'cross-origin' }, // Allow uploads to be served cross-origin
    }),
  );

  // ── CORS ────────────────────────────────────────────────
  const frontendUrl = process.env.FRONTEND_URL ?? 'http://localhost:3000';
  const adminUrl = process.env.ADMIN_URL ?? 'http://localhost:3001';
  app.enableCors({
    origin: [frontendUrl, adminUrl, 'http://localhost:3000', 'http://localhost:3001'],
    credentials: true, // Required for cookies
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  });

  // ── Cookie parsing ──────────────────────────────────────
  app.use(cookieParser());

  // ── Global pipes ────────────────────────────────────────
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: false,
      },
    }),
  );

  // ── Global filters ──────────────────────────────────────
  app.useGlobalFilters(new HttpExceptionFilter());

  // ── Global interceptors ─────────────────────────────────
  // ClassSerializerInterceptor must be registered first so @Exclude() on entities works.
  app.useGlobalInterceptors(
    new ClassSerializerInterceptor(app.get(Reflector)),
    new TransformInterceptor(),
  );

  // ── Swagger ─────────────────────────────────────────────
  if (process.env.NODE_ENV !== 'production') {
    const config = new DocumentBuilder()
      .setTitle('Karpenko Wedding API')
      .setDescription('REST API для свадебного агентства "Ателье событий Екатерины Карпенко"')
      .setVersion('1.0')
      .addBearerAuth(
        {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'Access-токен из cookie access_token. В Swagger вставьте токен вручную.',
        },
        'BearerAuth',
      )
      .addCookieAuth('access_token', {
        type: 'apiKey',
        in: 'cookie',
        name: 'access_token',
      })
      .addTag('Auth', 'Аутентификация (login / logout / refresh)')
      .addTag('Applications', 'Анкеты (публичная подача + admin-управление)')
      .addTag('Packages', 'Пакеты услуг')
      .addTag('Portfolio', 'Портфолио кейсы')
      .addTag('Team', 'Команда')
      .addTag('Settings', 'Настройки сайта')
      .addTag('Upload', 'Загрузка файлов')
      .build();

    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('api/docs', app, document, {
      swaggerOptions: {
        persistAuthorization: true,
      },
    });

    logger.log('Swagger UI available at /api/docs');
  }

  // ── Start ────────────────────────────────────────────────
  const port = parseInt(process.env.PORT ?? '4000', 10);
  await app.listen(port);
  logger.log(`Application running on port ${port}`);
  logger.log(`Environment: ${process.env.NODE_ENV ?? 'development'}`);
}

bootstrap().catch((error: unknown) => {
  const logger = new Logger('Bootstrap');
  logger.error('Failed to start application', error instanceof Error ? error.stack : String(error));
  process.exit(1);
});
