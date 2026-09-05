import { Controller, Post, Get, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { KudosService } from './kudos.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../auth/current-user.decorator';
import { User } from '../entities';

@Controller('kudos')
@UseGuards(JwtAuthGuard)
export class KudosController {
  constructor(private kudosService: KudosService) {}

  @Post()
  create(@CurrentUser() user: User, @Body() dto: { recipientId: string; category: string; message: string }) {
    return this.kudosService.create(user.id, dto);
  }

  @Get()
  findAll(@CurrentUser() user: User, @Query('page') page?: number, @Query('limit') limit?: number, @Query('category') category?: string) {
    return this.kudosService.findAll(user.teamId, { page, limit, category });
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.kudosService.findOne(id);
  }

  @Post(':id/like')
  toggleLike(@Param('id') id: string, @CurrentUser() user: User) {
    return this.kudosService.toggleLike(id, user.id);
  }

  @Delete(':id')
  delete(@Param('id') id: string, @CurrentUser() user: User) {
    return this.kudosService.delete(id, user.id);
  }
}
