// src/packages/packages.controller.ts
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
  Put,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CreatePackageDto } from './dto/create-package.dto';
import { OrderPackageDto } from './dto/order-package.dto';
import { UpdatePackageDto } from './dto/update-package.dto';
import { Package } from './entities/package.entity';
import { PackagesService } from './packages.service';

@ApiTags('Packages')
@Controller('api/v1')
export class PackagesController {
  constructor(private readonly packagesService: PackagesService) {}

  // ──────────────────────────────────────────────
  // PUBLIC
  // ──────────────────────────────────────────────

  @Get('packages')
  @ApiOperation({ summary: 'Список пакетов (публичный)' })
  @ApiResponse({ status: 200, description: 'Список пакетов' })
  async findAll(): Promise<Package[]> {
    return this.packagesService.findAll();
  }

  // ──────────────────────────────────────────────
  // ADMIN
  // ──────────────────────────────────────────────

  @Get('admin/packages')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Список пакетов (admin)' })
  async findAllAdmin(): Promise<Package[]> {
    return this.packagesService.findAll();
  }

  @Post('admin/packages')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Создать пакет (admin)' })
  @ApiResponse({ status: 201, description: 'Пакет создан' })
  async create(@Body() dto: CreatePackageDto): Promise<Package> {
    return this.packagesService.create(dto);
  }

  @Get('admin/packages/:id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Получить пакет по ID (admin)' })
  async findOne(@Param('id', ParseUUIDPipe) id: string): Promise<Package> {
    return this.packagesService.findById(id);
  }

  @Put('admin/packages/:id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Обновить пакет (admin)' })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdatePackageDto,
  ): Promise<Package> {
    return this.packagesService.update(id, dto);
  }

  @Patch('admin/packages/:id/order')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Изменить порядок пакета (admin)' })
  @ApiResponse({ status: 200, description: 'Порядок изменён' })
  @ApiResponse({ status: 409, description: 'Уже на границе списка' })
  async reorder(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: OrderPackageDto,
  ): Promise<Package[]> {
    return this.packagesService.reorder(id, dto);
  }

  @Delete('admin/packages/:id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Удалить пакет (admin)' })
  async remove(@Param('id', ParseUUIDPipe) id: string): Promise<void> {
    return this.packagesService.remove(id);
  }
}
