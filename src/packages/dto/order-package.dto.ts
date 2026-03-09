// src/packages/dto/order-package.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import { IsEnum } from 'class-validator';

export class OrderPackageDto {
  @ApiProperty({ enum: ['up', 'down'] })
  @IsEnum(['up', 'down'])
  direction: 'up' | 'down';
}
