// src/reviews/dto/order-review.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty } from 'class-validator';

export enum ReviewOrderDirection {
  UP = 'up',
  DOWN = 'down',
}

export class OrderReviewDto {
  @ApiProperty({ enum: ReviewOrderDirection, description: 'Направление перемещения', example: 'up' })
  @IsNotEmpty()
  @IsEnum(ReviewOrderDirection)
  direction: ReviewOrderDirection;
}
