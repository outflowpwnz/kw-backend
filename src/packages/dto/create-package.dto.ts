// src/packages/dto/create-package.dto.ts
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, MaxLength } from 'class-validator';

export class CreatePackageDto {
  @ApiProperty({ description: 'Название пакета', example: 'Полная организация' })
  @IsString()
  @MaxLength(255)
  name: string;

  @ApiProperty({ description: 'Краткое описание для карточки', example: 'Всё под ключ' })
  @IsString()
  shortDescription: string;

  @ApiProperty({ description: 'Полное описание' })
  @IsString()
  fullDescription: string;

  @ApiPropertyOptional({ description: 'Цена (текстовое поле)', example: 'от 150 000 руб.' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  price?: string;
}
