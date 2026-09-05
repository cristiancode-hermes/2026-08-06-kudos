import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, OneToMany, CreateDateColumn } from 'typeorm';
import { User } from './user.entity';
import { KudosLike } from './kudos-like.entity';

@Entity('kudos')
export class Kudos {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'sender_id' })
  sender: User;

  @Column({ name: 'sender_id' })
  senderId: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'recipient_id' })
  recipient: User;

  @Column({ name: 'recipient_id' })
  recipientId: string;

  @Column({ type: 'varchar', length: 30 })
  category: string;

  @Column({ length: 500 })
  message: string;

  @Column({ name: 'is_hidden', default: false })
  isHidden: boolean;

  @Column({ name: 'hidden_at', nullable: true, type: 'datetime' })
  hiddenAt: Date | null;

  @Column({ name: 'hidden_by_user_id', nullable: true })
  hiddenByUserId: string | null;

  @OneToMany(() => KudosLike, (kl) => kl.kudos)
  likes: KudosLike[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
