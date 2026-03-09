// src/team/dto/create-team-member.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import { IsString, MaxLength } from 'class-validator';

export class CreateTeamMemberDto {
  @ApiProperty({ description: 'Имя участника', example: 'Екатерина Карпенко' })
  @IsString()
  @MaxLength(255)
  name: string;

  @ApiProperty({ description: 'Описание / должность', example: 'Основатель и ведущий организатор' })
  @IsString()
  description: string;

  @ApiProperty({ description: 'URL фотографии участника', example: '/uploads/photo.jpg' })
  @IsString()
  @MaxLength(500)
  photoUrl: string;
}
