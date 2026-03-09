// src/applications/dto/filter-application.dto.ts
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsDateString, IsEnum, IsInt, IsOptional, Max, Min } from 'class-validator';
import { ApplicationStatus } from '../entities/application.entity';

export class FilterApplicationDto {
  @ApiPropertyOptional({ enum: ApplicationStatus, description: 'Фильтр по статусу' })
  @IsOptional()
  @IsEnum(ApplicationStatus)
  status?: ApplicationStatus;

  @ApiPropertyOptional({ description: 'Страница (от 1)', example: 1 })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Transform(({ value }: { value: unknown }) => (value ? Number(value) : 1))
  page?: number = 1;

  @ApiPropertyOptional({ description: 'Количество на странице (max 100)', example: 20 })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(100)
  @Transform(({ value }: { value: unknown }) => (value ? Number(value) : 20))
  limit?: number = 20;

  @ApiPropertyOptional({ description: 'Дата от (ISO 8601)', example: '2025-01-01' })
  @IsOptional()
  @IsDateString()
  dateFrom?: string;

  @ApiPropertyOptional({ description: 'Дата до (ISO 8601)', example: '2025-12-31' })
  @IsOptional()
  @IsDateString()
  dateTo?: string;
}
