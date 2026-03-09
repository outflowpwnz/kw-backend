// src/faq/faq.controller.ts
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
import { CreateFaqItemDto } from './dto/create-faq-item.dto';
import { OrderFaqItemDto } from './dto/order-faq-item.dto';
import { UpdateFaqItemDto } from './dto/update-faq-item.dto';
import { FaqItem } from './entities/faq-item.entity';
import { FaqService } from './faq.service';

@ApiTags('FAQ')
@Controller('api/v1')
export class FaqController {
  constructor(private readonly faqService: FaqService) {}

  // ──────────────────────────────────────────────
  // PUBLIC
  // ──────────────────────────────────────────────

  @Get('faq')
  @ApiOperation({ summary: 'Список активных FAQ (публичный)', description: 'Возвращает только активные элементы, отсортированные по sort_order.' })
  @ApiResponse({ status: 200, description: 'Список FAQ', type: [FaqItem] })
  async findAllActive(): Promise<FaqItem[]> {
    return this.faqService.findAllActive();
  }

  // ──────────────────────────────────────────────
  // ADMIN
  // ──────────────────────────────────────────────

  @Get('admin/faq')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Список всех FAQ включая неактивные (admin)' })
  @ApiResponse({ status: 200, description: 'Список FAQ', type: [FaqItem] })
  @ApiResponse({ status: 401, description: 'Не авторизован' })
  async findAll(): Promise<FaqItem[]> {
    return this.faqService.findAll();
  }

  @Post('admin/faq')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Создать FAQ-элемент (admin)' })
  @ApiResponse({ status: 201, description: 'FAQ-элемент создан', type: FaqItem })
  @ApiResponse({ status: 401, description: 'Не авторизован' })
  async create(@Body() dto: CreateFaqItemDto): Promise<FaqItem> {
    return this.faqService.create(dto);
  }

  @Patch('admin/faq/:id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Обновить FAQ-элемент (admin)' })
  @ApiResponse({ status: 200, description: 'FAQ-элемент обновлён', type: FaqItem })
  @ApiResponse({ status: 404, description: 'FAQ-элемент не найден' })
  @ApiResponse({ status: 401, description: 'Не авторизован' })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateFaqItemDto,
  ): Promise<FaqItem> {
    return this.faqService.update(id, dto);
  }

  @Patch('admin/faq/:id/order')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Изменить порядок FAQ-элемента (admin)', description: 'Меняет местами sort_order с соседним элементом.' })
  @ApiResponse({ status: 200, description: 'Порядок изменён, возвращает обновлённый список', type: [FaqItem] })
  @ApiResponse({ status: 409, description: 'FAQ-элемент уже на границе списка' })
  @ApiResponse({ status: 404, description: 'FAQ-элемент не найден' })
  @ApiResponse({ status: 401, description: 'Не авторизован' })
  async reorder(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: OrderFaqItemDto,
  ): Promise<FaqItem[]> {
    return this.faqService.reorder(id, dto);
  }

  @Delete('admin/faq/:id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Удалить FAQ-элемент (admin)' })
  @ApiResponse({ status: 204, description: 'FAQ-элемент удалён' })
  @ApiResponse({ status: 404, description: 'FAQ-элемент не найден' })
  @ApiResponse({ status: 401, description: 'Не авторизован' })
  async remove(@Param('id', ParseUUIDPipe) id: string): Promise<void> {
    return this.faqService.remove(id);
  }
}
