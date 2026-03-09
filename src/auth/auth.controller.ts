// src/auth/auth.controller.ts
import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Res,
  UseGuards,
} from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import {
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { Response } from 'express';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { JwtRefreshGuard } from '../common/guards/jwt-refresh.guard';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { JwtPayload } from './interfaces/jwt-payload.interface';

@ApiTags('Auth')
@Controller('api/v1/auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @Throttle({ default: { ttl: 60_000, limit: 5 } })
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Вход в систему', description: 'Устанавливает httpOnly cookies: access_token (15 мин) и refresh_token (30 дней)' })
  @ApiResponse({ status: 200, description: 'Успешный вход' })
  @ApiResponse({ status: 401, description: 'Неверный логин или пароль' })
  @ApiResponse({ status: 429, description: 'Слишком много запросов' })
  async login(
    @Body() dto: LoginDto,
    @Res({ passthrough: true }) response: Response,
  ): Promise<{ message: string; user: { id: string; login: string; name: string; role: string } }> {
    return this.authService.login(dto.login, dto.password, response);
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Текущий пользователь' })
  @ApiResponse({ status: 200, description: 'Данные текущего пользователя' })
  @ApiResponse({ status: 401, description: 'Не авторизован' })
  me(@CurrentUser() user: JwtPayload): { id: string; login: string; name: string; role: string } {
    return { id: user.sub, login: user.login, name: user.name, role: user.role };
  }

  @Post('logout')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Выход из системы', description: 'Очищает cookies access_token и refresh_token' })
  @ApiResponse({ status: 200, description: 'Успешный выход' })
  logout(@Res({ passthrough: true }) response: Response): { message: string } {
    return this.authService.logout(response);
  }

  @Post('refresh')
  @UseGuards(JwtRefreshGuard)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Обновление access-токена', description: 'Использует refresh_token из cookie для выдачи нового access_token' })
  @ApiResponse({ status: 200, description: 'Токен обновлён' })
  @ApiResponse({ status: 401, description: 'Refresh-токен недействителен или истёк' })
  async refresh(
    @CurrentUser() user: JwtPayload,
    @Res({ passthrough: true }) response: Response,
  ): Promise<{ message: string }> {
    return this.authService.refresh(user, response);
  }
}
