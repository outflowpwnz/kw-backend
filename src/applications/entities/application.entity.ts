// src/applications/entities/application.entity.ts
import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';

export enum ApplicationStatus {
  NEW = 'new',
  IN_PROGRESS = 'in_progress',
  CLOSED = 'closed',
}

@Entity('applications')
@Index(['status'])
@Index(['createdAt'])
@Index(['assignedToId'])
export class Application {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  source: string | null;

  @Column({
    type: 'enum',
    enum: ApplicationStatus,
    default: ApplicationStatus.NEW,
  })
  status: ApplicationStatus;

  @Column({ name: 'assigned_to_id', type: 'uuid', nullable: true })
  assignedToId: string | null;

  @ManyToOne(() => User, (user) => user.applications, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'assigned_to_id' })
  assignedTo: User | null;

  @Column({ name: 'couple_name', type: 'varchar', length: 255, nullable: true })
  coupleName: string | null;

  @Column({ type: 'varchar', length: 255 })
  instagram: string;

  @Column({ type: 'varchar', length: 255 })
  contact: string;

  @Column({ name: 'wedding_date', type: 'date', nullable: true })
  weddingDate: string | null;

  @Column({ name: 'guests_count', type: 'integer', nullable: true })
  guestsCount: number | null;

  @Column({ type: 'varchar', length: 100, nullable: true })
  budget: string | null;

  @Column({ name: 'venue_preferences', type: 'varchar', length: 255, nullable: true })
  venuePreferences: string | null;

  @Column({ name: 'has_ceremony', type: 'boolean', nullable: true })
  hasCeremony: boolean | null;

  @Column({ name: 'has_walk', type: 'boolean', nullable: true })
  hasWalk: boolean | null;

  @Column({ name: 'has_buffet', type: 'boolean', nullable: true })
  hasBuffet: boolean | null;

  @Column({ name: 'stylist_service', type: 'varchar', length: 100, nullable: true })
  stylistService: string | null;

  @Column({ name: 'photographer_service', type: 'varchar', length: 100, nullable: true })
  photographerService: string | null;

  @Column({ name: 'videographer_service', type: 'varchar', length: 100, nullable: true })
  videographerService: string | null;

  @Column({ name: 'host_service', type: 'varchar', length: 100, nullable: true })
  hostService: string | null;

  @Column({ name: 'evening_entertainment', type: 'text', nullable: true })
  eveningEntertainment: string | null;

  @Column({ type: 'text', nullable: true })
  decor: string | null;

  @Column({ type: 'text', nullable: true })
  vision: string | null;

  @Column({ name: 'no_go', type: 'text', nullable: true })
  noGo: string | null;

  @Column({ name: 'other_weddings_feedback', type: 'text', nullable: true })
  otherWeddingsFeedback: string | null;

  @Column({ name: 'how_found', type: 'varchar', length: 255, nullable: true })
  howFound: string | null;

  @Column({ name: 'preferred_meeting_time', type: 'varchar', length: 255, nullable: true })
  preferredMeetingTime: string | null;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt: Date;

  @Column({ name: 'completed_at', type: 'timestamptz', nullable: true })
  completedAt: Date | null;
}
