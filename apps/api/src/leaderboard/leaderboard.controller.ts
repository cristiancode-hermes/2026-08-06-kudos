import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { LeaderboardService } from './leaderboard.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../auth/current-user.decorator';
import { User } from '../entities';

@Controller('leaderboard')
@UseGuards(JwtAuthGuard)
export class LeaderboardController {
  constructor(private leaderboardService: LeaderboardService) {}

  @Get('received')
  getTopReceived(@CurrentUser() user: User, @Query('period') period = 'week') {
    return this.leaderboardService.getTopReceived(user.teamId, period);
  }

  @Get('given')
  getTopGiven(@CurrentUser() user: User, @Query('period') period = 'week') {
    return this.leaderboardService.getTopGiven(user.teamId, period);
  }
}
