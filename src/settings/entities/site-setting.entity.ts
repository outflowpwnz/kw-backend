// src/settings/entities/site-setting.entity.ts
import {
  Column,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

/**
 * All reserved setting keys.
 * PUT /admin/settings returns 400 if a key outside this set is submitted.
 * FAQ and reviews are managed via their own dedicated modules.
 */
export const RESERVED_SETTING_KEYS = [
  'stat_weddings_count',
  'stat_years_experience',
  'stat_team_size',
  'stat_rating',
  'phone',
  'instagram_url',
  'vk_url',
  'telegram_url',
  'countdown_next_wedding_date',
  'countdown_total_weddings',
] as const;

export type SettingKey = (typeof RESERVED_SETTING_KEYS)[number];

/**
 * Typed value map for all reserved setting keys.
 * Provides compile-time safety when reading/writing individual settings.
 */
export type SettingValueMap = {
  stat_weddings_count: string;
  stat_years_experience: string;
  stat_team_size: string;
  stat_rating: string;
  phone: string;
  instagram_url: string;
  vk_url: string;
  telegram_url: string;
  /** ISO 8601 datetime string, e.g. "2025-09-15T18:00:00Z" */
  countdown_next_wedding_date: string;
  /** Numeric string, e.g. "150" */
  countdown_total_weddings: string;
};

@Entity('site_settings')
export class SiteSetting {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 100, unique: true })
  key: string;

  @Column({ type: 'text' })
  value: string;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt: Date;
}
