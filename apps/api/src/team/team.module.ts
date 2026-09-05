import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Team, User } from '../entities';
import { AuthModule } from '../auth/auth.module';
import { TeamService } from './team.service';
import { TeamController } from './team.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Team, User]), AuthModule],
  controllers: [TeamController],
  providers: [TeamService],
})
export class TeamModule {}
