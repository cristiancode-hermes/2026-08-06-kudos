import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { TrendsService } from './trends.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../auth/current-user.decorator';
import { User } from '../entities';

@Controller('trends')
@UseGuards(JwtAuthGuard)
export class TrendsController {
  constructor(private trendsService: TrendsService) {}

  @Get('kpis')
  getKPIs(@CurrentUser() user: User) {
    return this.trendsService.getKPIs(user.teamId);
  }

  @Get('timeline')
  getTimeline(@CurrentUser() user: User, @Query('days') days?: number) {
    return this.trendsService.getTimeline(user.teamId, days || 7);
  }

  @Get('categories')
  getCategories(@CurrentUser() user: User) {
    return this.trendsService.getCategories(user.teamId);
  }
}
