// src/applications/applications.controller.ts
import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
  Res,
  UseGuards,
} from '@nestjs/common';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { JwtPayload } from '../auth/interfaces/jwt-payload.interface';
import { Throttle } from '@nestjs/throttler';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { Response } from 'express';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { ApplicationsService, PaginatedResult } from './applications.service';
import { CreateApplicationDto } from './dto/create-application.dto';
import { FilterApplicationDto } from './dto/filter-application.dto';
import { UpdateApplicationDto } from './dto/update-application.dto';
import { Application, ApplicationStatus } from './entities/application.entity';

@ApiTags('Applications')
@Controller()
export class ApplicationsController {
  constructor(private readonly applicationsService: ApplicationsService) {}

  // ──────────────────────────────────────────────
  // PUBLIC
  // ──────────────────────────────────────────────

  @Post('api/v1/applications')
  @Throttle({ default: { ttl: 60_000, limit: 10 } })
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Отправить анкету (публичный endpoint)' })
  @ApiResponse({ status: 201, description: 'Анкета успешно создана' })
  @ApiResponse({ status: 400, description: 'Ошибка валидации' })
  @ApiResponse({ status: 429, description: 'Слишком много запросов' })
  async create(@Body() dto: CreateApplicationDto): Promise<Application> {
    return this.applicationsService.create(dto);
  }

  // ──────────────────────────────────────────────
  // ADMIN
  // ──────────────────────────────────────────────

  @Get('api/v1/admin/applications')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Список заявок с фильтрацией и пагинацией' })
  @ApiQuery({ name: 'status', enum: ApplicationStatus, required: false })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'dateFrom', required: false, type: String })
  @ApiQuery({ name: 'dateTo', required: false, type: String })
  @ApiResponse({ status: 200, description: 'Список заявок' })
  @ApiResponse({ status: 401, description: 'Не авторизован' })
  async findAll(@Query() filter: FilterApplicationDto): Promise<PaginatedResult<Application>> {
    return this.applicationsService.findAll(filter);
  }

  @Get('api/v1/admin/applications/export')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Экспорт заявок в CSV' })
  @ApiResponse({ status: 200, description: 'CSV файл' })
  @ApiResponse({ status: 401, description: 'Не авторизован' })
  async exportCsv(@Query() filter: FilterApplicationDto, @Res() res: Response): Promise<void> {
    const csv = await this.applicationsService.exportToCsv(filter);
    const filename = `applications_${new Date().toISOString().split('T')[0]}.csv`;

    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.send(csv);
  }

  @Get('api/v1/admin/applications/:id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Получить заявку по ID' })
  @ApiResponse({ status: 200, description: 'Заявка найдена' })
  @ApiResponse({ status: 404, description: 'Заявка не найдена' })
  @ApiResponse({ status: 401, description: 'Не авторизован' })
  async findOne(@Param('id', ParseUUIDPipe) id: string): Promise<Application> {
    return this.applicationsService.findOne(id);
  }

  @Patch('api/v1/admin/applications/:id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Обновить статус / ответственного по заявке' })
  @ApiResponse({ status: 200, description: 'Заявка обновлена' })
  @ApiResponse({ status: 404, description: 'Заявка не найдена' })
  @ApiResponse({ status: 401, description: 'Не авторизован' })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateApplicationDto,
  ): Promise<Application> {
    return this.applicationsService.update(id, dto);
  }

  @Post('api/v1/admin/applications/:id/take')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Взять анкету в работу — назначить на себя и перевести в in_progress' })
  @ApiResponse({ status: 200, description: 'Анкета взята в работу' })
  @ApiResponse({ status: 400, description: 'Анкета уже закрыта' })
  @ApiResponse({ status: 404, description: 'Заявка не найдена' })
  @ApiResponse({ status: 401, description: 'Не авторизован' })
  async take(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() currentUser: JwtPayload,
  ): Promise<Application> {
    return this.applicationsService.takeApplication(id, currentUser.sub);
  }

  @Post('api/v1/admin/applications/:id/close')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Отметить анкету отработанной — перевести в closed и проставить completedAt' })
  @ApiResponse({ status: 200, description: 'Анкета закрыта' })
  @ApiResponse({ status: 400, description: 'Анкета уже закрыта' })
  @ApiResponse({ status: 404, description: 'Заявка не найдена' })
  @ApiResponse({ status: 401, description: 'Не авторизован' })
  async close(@Param('id', ParseUUIDPipe) id: string): Promise<Application> {
    return this.applicationsService.closeApplication(id);
  }

  @Delete('api/v1/admin/applications/:id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Удалить заявку' })
  @ApiResponse({ status: 204, description: 'Заявка удалена' })
  @ApiResponse({ status: 404, description: 'Заявка не найдена' })
  @ApiResponse({ status: 401, description: 'Не авторизован' })
  async remove(@Param('id', ParseUUIDPipe) id: string): Promise<void> {
    return this.applicationsService.remove(id);
  }
}
