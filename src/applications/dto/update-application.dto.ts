// src/applications/dto/update-application.dto.ts
import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsUUID } from 'class-validator';
import { ApplicationStatus } from '../entities/application.entity';

export class UpdateApplicationDto {
  @ApiPropertyOptional({
    enum: ApplicationStatus,
    description: 'Статус заявки',
    example: ApplicationStatus.IN_PROGRESS,
  })
  @IsOptional()
  @IsEnum(ApplicationStatus)
  status?: ApplicationStatus;

  @ApiPropertyOptional({ description: 'ID администратора, ответственного за заявку', example: '550e8400-e29b-41d4-a716-446655440000' })
  @IsOptional()
  @IsUUID()
  assignedToId?: string;
}
