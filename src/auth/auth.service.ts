// src/auth/auth.service.ts
import {
  Injectable,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { Response } from 'express';
import { UsersService } from '../users/users.service';
import { JwtPayload } from './interfaces/jwt-payload.interface';

const ACCESS_TOKEN_COOKIE = 'access_token';
const REFRESH_TOKEN_COOKIE = 'refresh_token';

// 15 minutes in seconds
const ACCESS_TOKEN_TTL_SECONDS = 15 * 60;
// 30 days in seconds
const REFRESH_TOKEN_TTL_SECONDS = 30 * 24 * 60 * 60;

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async login(
    login: string,
    password: string,
    response: Response,
  ): Promise<{ message: string; user: { id: string; login: string; name: string; role: string } }> {
    const user = await this.usersService.findByLogin(login);

    if (!user) {
      throw new UnauthorizedException('Неверный логин или пароль');
    }

    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Неверный логин или пароль');
    }

    const payload: JwtPayload = {
      sub: user.id,
      login: user.login,
      name: user.name,
      role: user.role,
    };

    const accessToken = this.signAccessToken(payload);
    const refreshToken = this.signRefreshToken(payload);

    this.setTokenCookies(response, accessToken, refreshToken);

    this.logger.log(`User ${user.login} logged in`);

    return {
      message: 'Вход выполнен успешно',
      user: {
        id: user.id,
        login: user.login,
        name: user.name,
        role: user.role,
      },
    };
  }

  async refresh(
    payload: JwtPayload,
    response: Response,
  ): Promise<{ message: string }> {
    // Verify user still exists
    const user = await this.usersService.findById(payload.sub);
    if (!user) {
      throw new UnauthorizedException('Пользователь не найден');
    }

    const newPayload: JwtPayload = {
      sub: user.id,
      login: user.login,
      name: user.name,
      role: user.role,
    };

    const accessToken = this.signAccessToken(newPayload);
    const refreshToken = this.signRefreshToken(newPayload);

    this.setTokenCookies(response, accessToken, refreshToken);

    return { message: 'Токен обновлён' };
  }

  logout(response: Response): { message: string } {
    response.clearCookie(ACCESS_TOKEN_COOKIE, this.getCookieOptions());
    response.clearCookie(REFRESH_TOKEN_COOKIE, this.getCookieOptions());
    return { message: 'Выход выполнен успешно' };
  }

  private signAccessToken(payload: JwtPayload): string {
    const secret = this.configService.get<string>('jwt.secret');
    return this.jwtService.sign(payload, {
      secret,
      expiresIn: ACCESS_TOKEN_TTL_SECONDS,
    });
  }

  private signRefreshToken(payload: JwtPayload): string {
    const secret = this.configService.get<string>('jwt.refreshSecret');
    return this.jwtService.sign(payload, {
      secret,
      expiresIn: REFRESH_TOKEN_TTL_SECONDS,
    });
  }

  private setTokenCookies(
    response: Response,
    accessToken: string,
    refreshToken: string,
  ): void {
    const baseOptions = this.getCookieOptions();

    response.cookie(ACCESS_TOKEN_COOKIE, accessToken, {
      ...baseOptions,
      maxAge: ACCESS_TOKEN_TTL_SECONDS * 1000,
    });

    response.cookie(REFRESH_TOKEN_COOKIE, refreshToken, {
      ...baseOptions,
      maxAge: REFRESH_TOKEN_TTL_SECONDS * 1000,
    });
  }

  private getCookieOptions(): {
    httpOnly: boolean;
    sameSite: 'lax';
    secure: boolean;
    path: string;
    domain?: string;
  } {
    const options: {
      httpOnly: boolean;
      sameSite: 'lax';
      secure: boolean;
      path: string;
      domain?: string;
    } = {
      httpOnly: true,
      sameSite: 'lax',
      secure: false,
      path: '/',
    };

    const domain = process.env.COOKIE_DOMAIN;
    if (domain) {
      options.domain = domain;
    }

    return options;
  }
}
