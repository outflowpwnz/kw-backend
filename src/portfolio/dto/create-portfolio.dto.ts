// src/portfolio/dto/create-portfolio.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, Matches, MaxLength } from 'class-validator';

export class CreatePortfolioDto {
  @ApiProperty({ description: 'Название кейса', example: 'Свадьба Ивана и Марии' })
  @IsNotEmpty()
  @IsString()
  @MaxLength(255)
  title: string;

  @ApiProperty({ description: 'URL фотографии', example: '/uploads/photo.jpg' })
  @IsNotEmpty()
  @IsString()
  @MaxLength(500)
  @Matches(/^(https?:\/\/.+|\/\S+)$/, {
    message: 'photoUrl должен быть корректным URL (например /uploads/photo.jpg или https://example.com/photo.jpg)',
  })
  photoUrl: string;

  @ApiProperty({ description: 'Описание кейса', example: 'Свадьба Ивана и Марии, загородная усадьба' })
  @IsNotEmpty()
  @IsString()
  description: string;
}
