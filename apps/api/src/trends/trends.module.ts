import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Kudos } from '../entities';
import { AuthModule } from '../auth/auth.module';
import { TrendsService } from './trends.service';
import { TrendsController } from './trends.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Kudos]), AuthModule],
  controllers: [TrendsController],
  providers: [TrendsService],
})
export class TrendsModule {}
