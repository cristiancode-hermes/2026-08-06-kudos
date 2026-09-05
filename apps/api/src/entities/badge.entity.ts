import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity('badges')
export class Badge {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true, length: 50 })
  key: string;

  @Column({ length: 100 })
  name: string;

  @Column({ length: 255 })
  description: string;

  @Column({ length: 10, name: 'icon_emoji' })
  iconEmoji: string;

  @Column({ length: 30, name: 'criteria_type' })
  criteriaType: 'received_count' | 'given_count' | 'category_received';

  @Column({ name: 'criteria_target', type: 'int' })
  criteriaTarget: number;

  @Column({ length: 50, name: 'criteria_category', nullable: true })
  criteriaCategory: string | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
