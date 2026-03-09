// src/portfolio/dto/update-portfolio.dto.ts
import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, Matches, MaxLength } from 'class-validator';

export class UpdatePortfolioDto {
  @ApiPropertyOptional({ description: 'Название кейса', example: 'Свадьба Ивана и Марии' })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  title?: string;

  @ApiPropertyOptional({ description: 'URL фотографии', example: '/uploads/new-photo.jpg' })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  @Matches(/^(https?:\/\/.+|\/\S+)$/, {
    message: 'photoUrl должен быть корректным URL (например /uploads/photo.jpg или https://example.com/photo.jpg)',
  })
  photoUrl?: string;

  @ApiPropertyOptional({ description: 'Описание кейса', example: 'Обновлённое описание' })
  @IsOptional()
  @IsString()
  description?: string;
}
