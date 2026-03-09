// src/team/dto/update-team-member.dto.ts
import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsInt, IsOptional, IsString, IsUrl, MaxLength, Min } from 'class-validator';

export class UpdateTeamMemberDto {
  @ApiPropertyOptional({ description: 'URL фотографии участника', example: '/uploads/photo.jpg' })
  @IsOptional()
  @IsUrl(
    { require_tld: false, allow_protocol_relative_urls: false },
    { message: 'photoUrl должен быть корректным URL (например /uploads/photo.jpg или https://example.com/photo.jpg)' },
  )
  @MaxLength(500)
  photoUrl?: string;

  @ApiPropertyOptional({ description: 'Имя участника', example: 'Екатерина Карпенко' })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  name?: string;

  @ApiPropertyOptional({ description: 'Описание / должность', example: 'Основатель и ведущий организатор' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ description: 'Порядок сортировки', example: 1 })
  @IsOptional()
  @IsInt()
  @Min(0)
  sortOrder?: number;
}
