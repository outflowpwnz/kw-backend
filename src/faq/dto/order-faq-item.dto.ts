// src/faq/dto/order-faq-item.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty } from 'class-validator';

export enum FaqOrderDirection {
  UP = 'up',
  DOWN = 'down',
}

export class OrderFaqItemDto {
  @ApiProperty({ enum: FaqOrderDirection, description: 'Направление перемещения', example: 'up' })
  @IsNotEmpty()
  @IsEnum(FaqOrderDirection)
  direction: FaqOrderDirection;
}
