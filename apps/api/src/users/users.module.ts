import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User, Kudos, UserBadge, Badge } from '../entities';
import { AuthModule } from '../auth/auth.module';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';

@Module({
  imports: [TypeOrmModule.forFeature([User, Kudos, UserBadge, Badge]), AuthModule],
  controllers: [UsersController],
  providers: [UsersService],
})
export class UsersModule {}
