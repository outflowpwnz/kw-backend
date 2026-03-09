// src/reviews/dto/update-review.dto.ts
import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsOptional, IsString } from 'class-validator';

export class UpdateReviewDto {
  @ApiPropertyOptional({ description: 'Текст отзыва', example: 'Ну вы прямо настоящие свадебные феечки 🧚‍♀️' })
  @IsOptional()
  @IsString()
  text?: string;

  @ApiPropertyOptional({ description: 'Активен ли отзыв' })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
