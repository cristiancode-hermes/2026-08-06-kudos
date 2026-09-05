import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../auth/current-user.decorator';
import { User } from '../entities';

@Controller('users')
@UseGuards(JwtAuthGuard)
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Get('search')
  search(@CurrentUser() user: User, @Query('q') q: string) {
    return this.usersService.search(user.teamId, q);
  }

  @Get(':id')
  getProfile(@Param('id') id: string) {
    return this.usersService.getProfile(id);
  }

  @Get(':id/kudos')
  getUserKudos(@Param('id') id: string, @Query('page') page?: number, @Query('limit') limit?: number) {
    return this.usersService.getUserKudos(id, page, limit);
  }
}
