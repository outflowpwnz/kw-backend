// src/portfolio/portfolio.controller.ts
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
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CreatePortfolioDto } from './dto/create-portfolio.dto';
import { OrderPortfolioDto } from './dto/order-portfolio.dto';
import { UpdatePortfolioDto } from './dto/update-portfolio.dto';
import { PortfolioCase } from './entities/portfolio-case.entity';
import { PortfolioService } from './portfolio.service';

@ApiTags('Portfolio')
@Controller('api/v1')
export class PortfolioController {
  constructor(private readonly portfolioService: PortfolioService) {}

  // ──────────────────────────────────────────────
  // PUBLIC
  // ──────────────────────────────────────────────

  @Get('portfolio')
  @ApiOperation({ summary: 'Список кейсов портфолио (публичный)' })
  @ApiResponse({ status: 200, description: 'Список кейсов' })
  async findAll(): Promise<PortfolioCase[]> {
    return this.portfolioService.findAll();
  }

  // ──────────────────────────────────────────────
  // ADMIN
  // ──────────────────────────────────────────────

  @Get('admin/portfolio')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Список кейсов (admin)' })
  @ApiResponse({ status: 200, description: 'Список кейсов' })
  @ApiResponse({ status: 401, description: 'Не авторизован' })
  async findAllAdmin(): Promise<PortfolioCase[]> {
    return this.portfolioService.findAll();
  }

  @Post('admin/portfolio')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Добавить кейс в портфолио (admin)' })
  @ApiResponse({ status: 201, description: 'Кейс добавлен' })
  @ApiResponse({ status: 401, description: 'Не авторизован' })
  async create(@Body() dto: CreatePortfolioDto): Promise<PortfolioCase> {
    return this.portfolioService.create(dto);
  }

  @Patch('admin/portfolio/:id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Обновить кейс (admin)' })
  @ApiResponse({ status: 200, description: 'Кейс обновлён' })
  @ApiResponse({ status: 404, description: 'Кейс не найден' })
  @ApiResponse({ status: 401, description: 'Не авторизован' })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdatePortfolioDto,
  ): Promise<PortfolioCase> {
    return this.portfolioService.update(id, dto);
  }

  @Patch('admin/portfolio/:id/order')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Изменить порядок кейса (admin)', description: 'Меняет местами sort_order с соседним элементом' })
  @ApiResponse({ status: 200, description: 'Порядок изменён, возвращает обновлённый список' })
  @ApiResponse({ status: 409, description: 'Кейс уже на границе списка' })
  @ApiResponse({ status: 404, description: 'Кейс не найден' })
  @ApiResponse({ status: 401, description: 'Не авторизован' })
  async reorder(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: OrderPortfolioDto,
  ): Promise<PortfolioCase[]> {
    return this.portfolioService.reorder(id, dto);
  }

  @Delete('admin/portfolio/:id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Удалить кейс (admin)' })
  @ApiResponse({ status: 204, description: 'Кейс удалён' })
  @ApiResponse({ status: 404, description: 'Кейс не найден' })
  @ApiResponse({ status: 401, description: 'Не авторизован' })
  async remove(@Param('id', ParseUUIDPipe) id: string): Promise<void> {
    return this.portfolioService.remove(id);
  }
}
