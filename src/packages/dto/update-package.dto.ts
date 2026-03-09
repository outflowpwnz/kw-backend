// src/packages/dto/update-package.dto.ts
import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, MaxLength } from 'class-validator';

export class UpdatePackageDto {
  @ApiPropertyOptional({ description: 'Название пакета', example: 'Полная организация' })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  name?: string;

  @ApiPropertyOptional({ description: 'Краткое описание для карточки', example: 'Всё под ключ' })
  @IsOptional()
  @IsString()
  shortDescription?: string;

  @ApiPropertyOptional({ description: 'Полное описание', example: 'Мы берём на себя полную ответственность...' })
  @IsOptional()
  @IsString()
  fullDescription?: string;

  @ApiPropertyOptional({ description: 'Цена (текстовое поле)', example: 'от 150 000 руб.' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  price?: string;
}
