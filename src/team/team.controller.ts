// src/team/team.controller.ts
import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
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

  @Put('admin/team/:id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Обновить участника команды (admin)' })
  @ApiResponse({ status: 200, description: 'Участник обновлён' })
  @ApiResponse({ status: 404, description: 'Участник не найден' })
  @ApiResponse({ status: 401, description: 'Не авторизован' })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateTeamMemberDto,
  ): Promise<TeamMember> {
    return this.teamService.update(id, dto);
  }
}
