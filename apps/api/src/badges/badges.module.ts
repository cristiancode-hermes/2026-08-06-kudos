import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Badge, UserBadge, User, Kudos } from '../entities';
import { AuthModule } from '../auth/auth.module';
import { BadgeService } from './badges.service';
import { BadgesController } from './badges.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Badge, UserBadge, User, Kudos]), AuthModule],
  controllers: [BadgesController],
  providers: [BadgeService],
  exports: [BadgeService],
})
export class BadgesModule {}
