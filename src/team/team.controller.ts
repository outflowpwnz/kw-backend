// src/team/team.controller.ts
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
import { CreateTeamMemberDto } from './dto/create-team-member.dto';
import { OrderTeamMemberDto } from './dto/order-team-member.dto';
import { UpdateTeamMemberDto } from './dto/update-team-member.dto';
import { TeamMember } from './entities/team-member.entity';
import { TeamService } from './team.service';

@ApiTags('Team')
@Controller('api/v1')
export class TeamController {
  constructor(private readonly teamService: TeamService) {}

  // ──────────────────────────────────────────────
  // PUBLIC
  // ──────────────────────────────────────────────

  @Get('team')
  @ApiOperation({ summary: 'Список участников команды (публичный)' })
  @ApiResponse({ status: 200, description: 'Список участников' })
  async findAll(): Promise<TeamMember[]> {
    return this.teamService.findAll();
  }

  // ──────────────────────────────────────────────
  // ADMIN
  // ──────────────────────────────────────────────

  @Get('admin/team')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Список участников команды (admin)' })
  @ApiResponse({ status: 200, description: 'Список участников' })
  @ApiResponse({ status: 401, description: 'Не авторизован' })
  async findAllAdmin(): Promise<TeamMember[]> {
    return this.teamService.findAll();
  }

  @Get('admin/team/:id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Получить участника команды по ID (admin)' })
  @ApiResponse({ status: 200, description: 'Участник найден' })
  @ApiResponse({ status: 404, description: 'Участник не найден' })
  @ApiResponse({ status: 401, description: 'Не авторизован' })
  async findOne(@Param('id', ParseUUIDPipe) id: string): Promise<TeamMember> {
    return this.teamService.findOne(id);
  }

  @Patch('admin/team/:id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Обновить участника команды (admin) — PATCH' })
  @ApiResponse({ status: 200, description: 'Участник обновлён' })
  @ApiResponse({ status: 404, description: 'Участник не найден' })
  @ApiResponse({ status: 401, description: 'Не авторизован' })
  async patch(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateTeamMemberDto,
  ): Promise<TeamMember> {
    return this.teamService.update(id, dto);
  }

  @Post('admin/team')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Создать участника команды (admin)' })
  @ApiResponse({ status: 201, description: 'Участник создан', type: TeamMember })
  @ApiResponse({ status: 401, description: 'Не авторизован' })
  async create(@Body() dto: CreateTeamMemberDto): Promise<TeamMember> {
    return this.teamService.create(dto);
  }

  @Patch('admin/team/:id/order')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Изменить порядок участника (admin)', description: 'Меняет местами sort_order с соседним элементом.' })
  @ApiResponse({ status: 200, description: 'Порядок изменён, возвращает обновлённый список', type: [TeamMember] })
  @ApiResponse({ status: 409, description: 'Участник уже на границе списка' })
  @ApiResponse({ status: 404, description: 'Участник не найден' })
  @ApiResponse({ status: 401, description: 'Не авторизован' })
  async reorder(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: OrderTeamMemberDto,
  ): Promise<TeamMember[]> {
    return this.teamService.reorder(id, dto);
  }

  @Delete('admin/team/:id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Удалить участника команды (admin)' })
  @ApiResponse({ status: 204, description: 'Участник удалён' })
  @ApiResponse({ status: 404, description: 'Участник не найден' })
  @ApiResponse({ status: 401, description: 'Не авторизован' })
  async remove(@Param('id', ParseUUIDPipe) id: string): Promise<void> {
    return this.teamService.remove(id);
  }
}
