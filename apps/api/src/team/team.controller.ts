import { Controller, Get, Put, Post, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { TeamService } from './team.service';
import { JwtAuthGuard, Public } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../auth/current-user.decorator';
import { User } from '../entities';

@Controller('team')
export class TeamController {
  constructor(private teamService: TeamService) {}

  @UseGuards(JwtAuthGuard)
  @Get()
  getTeam(@CurrentUser() user: User) {
    return this.teamService.getTeam(user.teamId);
  }

  @UseGuards(JwtAuthGuard)
  @Put()
  updateTeam(@CurrentUser() user: User, @Body() dto: { name?: string }) {
    return this.teamService.updateTeam(user.teamId, user.id, dto);
  }

  @UseGuards(JwtAuthGuard)
  @Post('regenerate-code')
  regenerateCode(@CurrentUser() user: User) {
    return this.teamService.regenerateCode(user.teamId, user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Delete('members/:userId')
  removeMember(@CurrentUser() user: User, @Param('userId') memberId: string) {
    return this.teamService.removeMember(user.teamId, user.id, memberId);
  }

  @UseGuards(JwtAuthGuard)
  @Post('transfer-admin')
  transferAdmin(@CurrentUser() user: User, @Body() dto: { newAdminId: string }) {
    return this.teamService.transferAdmin(user.teamId, user.id, dto.newAdminId);
  }

  @Public()
  @Get('validate-code')
  validateCode(@Query('code') code: string) {
    return this.teamService.validateCode(code);
  }
}
