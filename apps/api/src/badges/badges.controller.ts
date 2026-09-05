import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { BadgeService } from './badges.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../auth/current-user.decorator';
import { User } from '../entities';

@Controller('badges')
@UseGuards(JwtAuthGuard)
export class BadgesController {
  constructor(private badgeService: BadgeService) {}

  @Get()
  getAll(@CurrentUser() user: User) {
    return this.badgeService.getAllBadges(user.id);
  }

  @Get('user/:userId')
  getUserBadges(@Param('userId') userId: string) {
    return this.badgeService.getUserBadges(userId);
  }
}
