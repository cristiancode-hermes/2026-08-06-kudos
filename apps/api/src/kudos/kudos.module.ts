import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Kudos, User, Badge, UserBadge, KudosLike } from '../entities';
import { AuthModule } from '../auth/auth.module';
import { KudosService } from './kudos.service';
import { KudosController } from './kudos.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([Kudos, User, Badge, UserBadge, KudosLike]),
    AuthModule,
  ],
  controllers: [KudosController],
  providers: [KudosService],
  exports: [KudosService],
})
export class KudosModule {}
