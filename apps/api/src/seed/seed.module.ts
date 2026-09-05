import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User, Team, Kudos, KudosLike, Badge, UserBadge } from '../entities';
import { SeedService } from './seed.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, Team, Kudos, KudosLike, Badge, UserBadge]),
  ],
  providers: [SeedService],
})
export class SeedModule {}
