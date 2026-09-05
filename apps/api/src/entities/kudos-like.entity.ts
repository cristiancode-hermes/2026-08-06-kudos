import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn, Unique } from 'typeorm';
import { Kudos } from './kudos.entity';
import { User } from './user.entity';

@Entity('kudos_likes')
@Unique(['kudosId', 'userId'])
export class KudosLike {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Kudos, (k) => k.likes)
  @JoinColumn({ name: 'kudos_id' })
  kudos: Kudos;

  @Column({ name: 'kudos_id' })
  kudosId: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ name: 'user_id' })
  userId: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
