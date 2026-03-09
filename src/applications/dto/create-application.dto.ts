// src/applications/dto/create-application.dto.ts
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import {
  IsBoolean,
  IsDateString,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  Min,
} from 'class-validator';

export class CreateApplicationDto {
  @ApiPropertyOptional({ description: 'Источник (UTM или название пакета)', example: 'organizatsiya' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  source?: string;

  @ApiPropertyOptional({ description: 'Имена пары', example: 'Иван и Мария' })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  coupleName?: string;

  @ApiProperty({ description: 'Instagram аккаунт', example: '@ivan_maria_wedding' })
  @IsNotEmpty()
  @IsString()
  @MaxLength(255)
  instagram: string;

  @ApiProperty({ description: 'Контактный телефон или мессенджер', example: '+7 999 123-45-67' })
  @IsNotEmpty()
  @IsString()
  @MaxLength(255)
  contact: string;

  @ApiPropertyOptional({ description: 'Дата свадьбы', example: '2025-09-15' })
  @IsOptional()
  @IsDateString()
  weddingDate?: string;

  @ApiPropertyOptional({ description: 'Количество гостей', example: 80 })
  @IsOptional()
  @IsInt()
  @Min(0)
  @Transform(({ value }: { value: unknown }) => (value !== undefined && value !== null ? Number(value) : value))
  guestsCount?: number;

  @ApiPropertyOptional({ description: 'Бюджет', example: 'от 500 000 руб.' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  budget?: string;

  @ApiPropertyOptional({ description: 'Пожелания по площадке', example: 'Загородная усадьба' })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  venuePreferences?: string;

  @ApiPropertyOptional({ description: 'Выездная церемония', example: true })
  @IsOptional()
  @IsBoolean()
  hasCeremony?: boolean;

  @ApiPropertyOptional({ description: 'Прогулка / фотосессия', example: true })
  @IsOptional()
  @IsBoolean()
  hasWalk?: boolean;

  @ApiPropertyOptional({ description: 'Фуршет', example: false })
  @IsOptional()
  @IsBoolean()
  hasBuffet?: boolean;

  @ApiPropertyOptional({ description: 'Стилист', example: 'нужен' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  stylistService?: string;

  @ApiPropertyOptional({ description: 'Фотограф', example: 'есть свой' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  photographerService?: string;

  @ApiPropertyOptional({ description: 'Видеограф', example: 'нужен' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  videographerService?: string;

  @ApiPropertyOptional({ description: 'Ведущий', example: 'нужен' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  hostService?: string;

  @ApiPropertyOptional({ description: 'Вечерние развлечения', example: 'Живая музыка, фокусник' })
  @IsOptional()
  @IsString()
  eveningEntertainment?: string;

  @ApiPropertyOptional({ description: 'Декор и флористика', example: 'Нежные тона, много цветов' })
  @IsOptional()
  @IsString()
  decor?: string;

  @ApiPropertyOptional({ description: 'Видение свадьбы', example: 'Камерная, в кругу близких' })
  @IsOptional()
  @IsString()
  vision?: string;

  @ApiPropertyOptional({ description: 'Чего точно не хотим', example: 'Громкую музыку, пьяных гостей' })
  @IsOptional()
  @IsString()
  noGo?: string;

  @ApiPropertyOptional({ description: 'Впечатление от других свадеб', example: 'Видели в Instagram' })
  @IsOptional()
  @IsString()
  otherWeddingsFeedback?: string;

  @ApiPropertyOptional({ description: 'Как нашли нас', example: 'Instagram' })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  howFound?: string;

  @ApiPropertyOptional({ description: 'Удобное время для встречи', example: 'Будни после 18:00' })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  preferredMeetingTime?: string;
}
