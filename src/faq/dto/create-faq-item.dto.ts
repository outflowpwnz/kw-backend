// src/faq/dto/create-faq-item.dto.ts
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateFaqItemDto {
  @ApiProperty({ description: 'Вопрос', example: 'За сколько времени нужно обращаться к организатору?' })
  @IsNotEmpty()
  @IsString()
  question: string;

  @ApiProperty({ description: 'Ответ', example: 'Рекомендуем начать планирование за 9–12 месяцев до свадьбы.' })
  @IsNotEmpty()
  @IsString()
  answer: string;

  @ApiPropertyOptional({ description: 'Активен ли элемент', default: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
