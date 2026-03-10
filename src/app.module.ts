// src/app.module.ts
import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ServeStaticModule } from '@nestjs/serve-static';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { TypeOrmModule } from '@nestjs/typeorm';
import { join } from 'path';
import { ApplicationsModule } from './applications/applications.module';
import { AuthModule } from './auth/auth.module';
import jwtConfig from './config/jwt.config';
import { FaqModule } from './faq/faq.module';
import { PackagesModule } from './packages/packages.module';
import { PortfolioModule } from './portfolio/portfolio.module';
import { ReviewsModule } from './reviews/reviews.module';
import { SettingsModule } from './settings/settings.module';
import { TeamModule } from './team/team.module';
import { UploadModule } from './upload/upload.module';
import { UsersModule } from './users/users.module';

/**
 * Validates required environment variables at startup.
 * Throws on missing secrets so the app never starts in a broken state.
 */
function validateEnv(config: Record<string, unknown>): Record<string, unknown> {
  const required = ['DATABASE_URL', 'JWT_SECRET', 'JWT_REFRESH_SECRET'];
  const missing = required.filter((key) => !config[key]);
  if (missing.length > 0) {
    throw new Error(
      `Missing required environment variables: ${missing.join(', ')}. ` +
        'Check your .env file.',
    );
  }
  return config;
}

@Module({
  imports: [
    // ── Configuration ──────────────────────────────────────
    ConfigModule.forRoot({
      isGlobal: true,
      load: [jwtConfig],
      envFilePath: '.env',
      validate: validateEnv,
    }),

    // ── Rate limiting ──────────────────────────────────────
    // Global default: 100 requests per 60 seconds.
    // Per-route overrides are applied via @Throttle() decorator.
    ThrottlerModule.forRoot([
      {
        ttl: 60_000, // milliseconds
        limit: 100,
      },
    ]),

    // ── Database ───────────────────────────────────────────
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        url: configService.get<string>('DATABASE_URL'),
        entities: [join(__dirname, '**', '*.entity{.ts,.js}')],
        synchronize: true,
        logging: process.env.NODE_ENV === 'development',
        ssl:
          process.env.DATABASE_SSL === 'true'
            ? { rejectUnauthorized: false }
            : false,
      }),
    }),

    // ── Static files (uploads) ─────────────────────────────
    ServeStaticModule.forRoot({
      rootPath: join(process.cwd(), 'uploads'),
      serveRoot: '/uploads',
      serveStaticOptions: {
        index: false,
      },
    }),

    // ── Feature modules ────────────────────────────────────
    UsersModule,
    AuthModule,
    ApplicationsModule,
    PackagesModule,
    PortfolioModule,
    TeamModule,
    SettingsModule,
    FaqModule,
    ReviewsModule,
    UploadModule,
  ],
  providers: [
    // Apply ThrottlerGuard globally to all routes.
    // Individual routes can override limits with @Throttle().
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}
