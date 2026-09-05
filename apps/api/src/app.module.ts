import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from './config.module';
import { AuthModule } from './auth/auth.module';
import { KudosModule } from './kudos/kudos.module';
import { BadgesModule } from './badges/badges.module';
import { LeaderboardModule } from './leaderboard/leaderboard.module';
import { TeamModule } from './team/team.module';
import { TrendsModule } from './trends/trends.module';
import { AdminModule } from './admin/admin.module';
import { UsersModule } from './users/users.module';
import { SeedModule } from './seed/seed.module';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: () => ({
        type: 'better-sqlite3',
        database: 'data/kudos.db',
        entities: [__dirname + '/entities/*.entity{.ts,.js}'],
        synchronize: true,
      }),
    }),
    AuthModule,
    KudosModule,
    BadgesModule,
    LeaderboardModule,
    TeamModule,
    TrendsModule,
    AdminModule,
    UsersModule,
    SeedModule,
  ],
})
export class AppModule {}
