// src/settings/dto/update-settings.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsObject } from 'class-validator';
import { SettingKey } from '../entities/site-setting.entity';

export class UpdateSettingsDto {
  @ApiProperty({
    description:
      'Объект ключ-значение с настройками. Допускаются только зарезервированные ключи. Все значения должны быть строками.',
    example: {
      stat_weddings_count: '150',
      stat_years_experience: '7',
      phone: '+7 999 123-45-67',
    },
  })
  @IsObject()
  @Transform(({ value }: { value: unknown }) => {
    // Ensure all values are strings; coerce if possible, reject if not an object.
    if (typeof value !== 'object' || value === null || Array.isArray(value)) {
      return value; // Let @IsObject() handle the rejection.
    }
    const coerced: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(value as Record<string, unknown>)) {
      if (typeof v !== 'string') {
        // Throw a descriptive error that ValidationPipe will surface.
        throw new Error(
          `Значение для ключа "${k}" должно быть строкой, получено: ${typeof v}`,
        );
      }
      coerced[k] = v;
    }
    return coerced;
  })
  settings: Partial<Record<SettingKey, string>>;
}
