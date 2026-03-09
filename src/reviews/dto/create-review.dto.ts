// src/reviews/dto/create-review.dto.ts
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateReviewDto {
  @ApiProperty({ description: 'Текст отзыва', example: 'Ну вы прямо настоящие свадебные феечки 🧚‍♀️' })
  @IsNotEmpty()
  @IsString()
  text: string;

  @ApiPropertyOptional({ description: 'Активен ли отзыв', default: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
