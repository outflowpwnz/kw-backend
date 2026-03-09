// src/portfolio/dto/order-portfolio.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty } from 'class-validator';

export enum OrderDirection {
  UP = 'up',
  DOWN = 'down',
}

export class OrderPortfolioDto {
  @ApiProperty({ enum: OrderDirection, description: 'Направление перемещения', example: 'up' })
  @IsNotEmpty()
  @IsEnum(OrderDirection)
  direction: OrderDirection;
}
