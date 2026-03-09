// src/faq/dto/update-faq-item.dto.ts
import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsOptional, IsString } from 'class-validator';

export class UpdateFaqItemDto {
  @ApiPropertyOptional({ description: 'Вопрос', example: 'За сколько времени нужно обращаться к организатору?' })
  @IsOptional()
  @IsString()
  question?: string;

  @ApiPropertyOptional({ description: 'Ответ', example: 'Рекомендуем начать планирование за 9–12 месяцев до свадьбы.' })
  @IsOptional()
  @IsString()
  answer?: string;

  @ApiPropertyOptional({ description: 'Активен ли элемент' })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
