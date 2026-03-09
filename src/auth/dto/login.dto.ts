// src/auth/dto/login.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class LoginDto {
  @ApiProperty({ description: 'Логин администратора', example: 'admin' })
  @IsNotEmpty()
  @IsString()
  @MaxLength(100)
  login: string;

  @ApiProperty({ description: 'Пароль', example: 'changeme123' })
  @IsNotEmpty()
  @IsString()
  @MaxLength(255)
  password: string;
}
