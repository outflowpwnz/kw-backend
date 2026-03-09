// src/settings/settings.controller.ts
import { Body, Controller, Get, Put, UseGuards } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { UpdateSettingsDto } from './dto/update-settings.dto';
import { SettingsService, SettingsMap } from './settings.service';

@ApiTags('Settings')
@Controller('api/v1')
export class SettingsController {
  constructor(private readonly settingsService: SettingsService) {}

  // ──────────────────────────────────────────────
  // PUBLIC
  // ──────────────────────────────────────────────

  @Get('settings')
  @ApiOperation({ summary: 'Публичные настройки сайта (ключ-значение)', description: 'Возвращает только whitelisted ключи. Приватные настройки скрыты.' })
  @ApiResponse({ status: 200, description: 'Публичные настройки' })
  async getPublicSettings(): Promise<SettingsMap> {
    return this.settingsService.getPublicSettings();
  }

  // ──────────────────────────────────────────────
  // ADMIN
  // ──────────────────────────────────────────────

  @Get('admin/settings')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Получить все настройки (admin)' })
  @ApiResponse({ status: 200, description: 'Все настройки' })
  @ApiResponse({ status: 401, description: 'Не авторизован' })
  async findAllAdmin(): Promise<SettingsMap> {
    return this.settingsService.findAll();
  }

  @Put('admin/settings')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Массовое обновление настроек (admin)',
    description:
      'Принимает объект ключ-значение. Возвращает 400 если переданы ключи вне белого списка.',
  })
  @ApiResponse({ status: 200, description: 'Настройки обновлены' })
  @ApiResponse({ status: 400, description: 'Недопустимые ключи настроек' })
  @ApiResponse({ status: 401, description: 'Не авторизован' })
  async updateMany(@Body() dto: UpdateSettingsDto): Promise<SettingsMap> {
    return this.settingsService.updateMany(dto.settings);
  }
}
