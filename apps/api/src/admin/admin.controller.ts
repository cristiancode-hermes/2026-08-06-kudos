import { Controller, Get, Patch, Param, Query, UseGuards } from '@nestjs/common';
import { AdminService } from './admin.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { AdminGuard } from '../auth/roles.guard';
import { CurrentUser } from '../auth/current-user.decorator';
import { User } from '../entities';

@Controller('admin')
@UseGuards(JwtAuthGuard, AdminGuard)
export class AdminController {
  constructor(private adminService: AdminService) {}

  @Get('kudos')
  getAllKudos(@Query('page') page?: number, @Query('limit') limit?: number) {
    return this.adminService.getAllKudos(page, limit);
  }

  @Patch('kudos/:id/hide')
  hideKudos(@Param('id') id: string, @CurrentUser() user: User) {
    return this.adminService.hideKudos(id, user.id);
  }

  @Patch('kudos/:id/restore')
  restoreKudos(@Param('id') id: string) {
    return this.adminService.restoreKudos(id);
  }

  @Get('kudos/hidden')
  getHiddenKudos(@Query('page') page?: number, @Query('limit') limit?: number) {
    return this.adminService.getHiddenKudos(page, limit);
  }
}
