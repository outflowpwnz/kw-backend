// src/settings/settings.service.ts
import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  RESERVED_SETTING_KEYS,
  SettingKey,
  SettingValueMap,
  SiteSetting,
} from './entities/site-setting.entity';

/**
 * Partial map of all typed setting values.
 * All keys are public — no private settings exist in this module.
 */
export type SettingsMap = Partial<SettingValueMap>;

@Injectable()
export class SettingsService {
  constructor(
    @InjectRepository(SiteSetting)
    private readonly settingsRepository: Repository<SiteSetting>,
  ) {}

  /**
   * Returns all settings as a typed key-value map. For admin use only.
   */
  async findAll(): Promise<SettingsMap> {
    const settings = await this.settingsRepository.find();
    return this.toMap(settings);
  }

  /**
   * Returns all reserved settings as a typed key-value map.
   * All reserved keys are safe to expose publicly.
   */
  async getPublicSettings(): Promise<SettingsMap> {
    const settings = await this.settingsRepository.find({
      where: RESERVED_SETTING_KEYS.map((key) => ({ key })),
    });
    return this.toMap(settings);
  }

  /**
   * Bulk upsert settings. Validates that all keys belong to the reserved set.
   */
  async updateMany(input: Partial<Record<SettingKey, string>>): Promise<SettingsMap> {
    const invalidKeys = Object.keys(input).filter(
      (key) => !RESERVED_SETTING_KEYS.includes(key as (typeof RESERVED_SETTING_KEYS)[number]),
    );

    if (invalidKeys.length > 0) {
      throw new BadRequestException(
        `Недопустимые ключи настроек: ${invalidKeys.join(', ')}. Разрешены только зарезервированные ключи.`,
      );
    }

    const existingSettings = await this.settingsRepository.find();
    const existingMap = new Map(existingSettings.map((s) => [s.key, s]));

    const toSave: SiteSetting[] = [];

    for (const [key, value] of Object.entries(input)) {
      const existing = existingMap.get(key);
      if (existing) {
        existing.value = String(value);
        toSave.push(existing);
      } else {
        const newSetting = this.settingsRepository.create({ key, value: String(value) });
        toSave.push(newSetting);
      }
    }

    await this.settingsRepository.save(toSave);
    return this.findAll();
  }

  private toMap(settings: SiteSetting[]): SettingsMap {
    return settings.reduce<SettingsMap>((acc, setting) => {
      (acc as Record<string, string>)[setting.key] = setting.value;
      return acc;
    }, {});
  }
}
