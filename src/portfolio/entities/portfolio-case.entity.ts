// src/portfolio/entities/portfolio-case.entity.ts
import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('portfolio_cases')
export class PortfolioCase {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 255 })
  title: string;

  @Column({ name: 'photo_url', type: 'varchar', length: 500 })
  photoUrl: string;

  @Column({ type: 'text' })
  description: string;

  @Column({ name: 'sort_order', type: 'integer', unique: true })
  sortOrder: number;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt: Date;
}
