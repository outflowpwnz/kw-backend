// src/reviews/reviews.controller.ts
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
import { CreateReviewDto } from './dto/create-review.dto';
import { OrderReviewDto } from './dto/order-review.dto';
import { UpdateReviewDto } from './dto/update-review.dto';
import { Review } from './entities/review.entity';
import { ReviewsService } from './reviews.service';

@ApiTags('Reviews')
@Controller('api/v1')
export class ReviewsController {
  constructor(private readonly reviewsService: ReviewsService) {}

  // ──────────────────────────────────────────────
  // PUBLIC
  // ──────────────────────────────────────────────

  @Get('reviews')
  @ApiOperation({ summary: 'Список активных отзывов (публичный)', description: 'Возвращает только активные отзывы, отсортированные по sort_order.' })
  @ApiResponse({ status: 200, description: 'Список отзывов', type: [Review] })
  async findAllActive(): Promise<Review[]> {
    return this.reviewsService.findAllActive();
  }

  // ──────────────────────────────────────────────
  // ADMIN
  // ──────────────────────────────────────────────

  @Get('admin/reviews')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Список всех отзывов включая неактивные (admin)' })
  @ApiResponse({ status: 200, description: 'Список отзывов', type: [Review] })
  @ApiResponse({ status: 401, description: 'Не авторизован' })
  async findAll(): Promise<Review[]> {
    return this.reviewsService.findAll();
  }

  @Post('admin/reviews')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Создать отзыв (admin)' })
  @ApiResponse({ status: 201, description: 'Отзыв создан', type: Review })
  @ApiResponse({ status: 401, description: 'Не авторизован' })
  async create(@Body() dto: CreateReviewDto): Promise<Review> {
    return this.reviewsService.create(dto);
  }

  @Patch('admin/reviews/:id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Обновить отзыв (admin)' })
  @ApiResponse({ status: 200, description: 'Отзыв обновлён', type: Review })
  @ApiResponse({ status: 404, description: 'Отзыв не найден' })
  @ApiResponse({ status: 401, description: 'Не авторизован' })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateReviewDto,
  ): Promise<Review> {
    return this.reviewsService.update(id, dto);
  }

  @Patch('admin/reviews/:id/order')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Изменить порядок отзыва (admin)', description: 'Меняет местами sort_order с соседним элементом.' })
  @ApiResponse({ status: 200, description: 'Порядок изменён, возвращает обновлённый список', type: [Review] })
  @ApiResponse({ status: 409, description: 'Отзыв уже на границе списка' })
  @ApiResponse({ status: 404, description: 'Отзыв не найден' })
  @ApiResponse({ status: 401, description: 'Не авторизован' })
  async reorder(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: OrderReviewDto,
  ): Promise<Review[]> {
    return this.reviewsService.reorder(id, dto);
  }

  @Delete('admin/reviews/:id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Удалить отзыв (admin)' })
  @ApiResponse({ status: 204, description: 'Отзыв удалён' })
  @ApiResponse({ status: 404, description: 'Отзыв не найден' })
  @ApiResponse({ status: 401, description: 'Не авторизован' })
  async remove(@Param('id', ParseUUIDPipe) id: string): Promise<void> {
    return this.reviewsService.remove(id);
  }
}
