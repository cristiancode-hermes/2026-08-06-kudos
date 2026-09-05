import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, OneToMany, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { Team } from './team.entity';
import { Kudos } from './kudos.entity';
import { UserBadge } from './user-badge.entity';
import { KudosLike } from './kudos-like.entity';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 100 })
  name: string;

  @Column({ unique: true, length: 255 })
  email: string;

  @Column({ name: 'password_hash', length: 255 })
  passwordHash: string;

  @Column({ name: 'avatar_url', length: 500, nullable: true })
  avatarUrl: string | null;

  @Column({ type: 'varchar', length: 10, default: 'member' })
  role: 'member' | 'admin';

  @ManyToOne(() => Team, (team) => team.members)
  @JoinColumn({ name: 'team_id' })
  team: Team;

  @Column({ name: 'team_id' })
  teamId: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @OneToMany(() => Kudos, (k) => k.sender)
  sentKudos: Kudos[];

  @OneToMany(() => Kudos, (k) => k.recipient)
  receivedKudos: Kudos[];

  @OneToMany(() => UserBadge, (ub) => ub.user)
  badges: UserBadge[];

  @OneToMany(() => KudosLike, (kl) => kl.user)
  likes: KudosLike[];
}
