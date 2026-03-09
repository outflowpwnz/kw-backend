// src/config/jwt.config.ts
import { registerAs } from '@nestjs/config';

export interface JwtConfig {
  secret: string;
  refreshSecret: string;
  accessExpiresIn: string;
  refreshExpiresIn: string;
}

export default registerAs(
  'jwt',
  (): JwtConfig => ({
    secret: process.env.JWT_SECRET ?? '',
    refreshSecret: process.env.JWT_REFRESH_SECRET ?? '',
    accessExpiresIn: '15m',
    refreshExpiresIn: '30d',
  }),
);
