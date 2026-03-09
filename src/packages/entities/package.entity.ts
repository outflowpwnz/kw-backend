// src/packages/entities/package.entity.ts
import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('packages')
export class Package {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Column({ name: 'short_description', type: 'text' })
  shortDescription: string;

  @Column({ name: 'full_description', type: 'text' })
  fullDescription: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  price: string | null;

  @Column({ name: 'sort_order', type: 'integer' })
  sortOrder: number;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt: Date;
}
