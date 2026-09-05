import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Team, User } from '../entities';

@Injectable()
export class TeamService {
  constructor(
    @InjectRepository(Team)
    private teamRepo: Repository<Team>,
    @InjectRepository(User)
    private userRepo: Repository<User>,
  ) {}

  async getTeam(teamId: string) {
    const team = await this.teamRepo.findOne({
      where: { id: teamId },
      relations: { members: true, admin: true },
    });
    if (!team) throw new NotFoundException('Team not found');
    return { team, members: team.members };
  }

  async updateTeam(teamId: string, userId: string, dto: { name?: string }) {
    const team = await this.teamRepo.findOne({ where: { id: teamId } });
    if (!team) throw new NotFoundException('Team not found');
    if (team.adminId !== userId) throw new ForbiddenException('Only admin can update team');

    if (dto.name) team.name = dto.name;
    return this.teamRepo.save(team);
  }

  async regenerateCode(teamId: string, userId: string) {
    const team = await this.teamRepo.findOne({ where: { id: teamId } });
    if (!team) throw new NotFoundException('Team not found');
    if (team.adminId !== userId) throw new ForbiddenException('Only admin can regenerate code');

    team.inviteCode = await this.generateCode();
    await this.teamRepo.save(team) as any;
    return { inviteCode: team.inviteCode };
  }

  async removeMember(teamId: string, adminId: string, memberUserId: string) {
    const team = await this.teamRepo.findOne({ where: { id: teamId } });
    if (!team) throw new NotFoundException('Team not found');
    if (team.adminId !== adminId) throw new ForbiddenException('Only admin can remove members');

    const member = await this.userRepo.findOne({ where: { id: memberUserId, teamId } });
    if (!member) throw new NotFoundException('Member not found');

    if (member.id === adminId) throw new BadRequestException('Cannot remove yourself as admin');
    await this.userRepo.remove(member);
    return { message: 'Member removed' };
  }

  async transferAdmin(teamId: string, currentAdminId: string, newAdminId: string) {
    const team = await this.teamRepo.findOne({ where: { id: teamId } });
    if (!team) throw new NotFoundException('Team not found');
    if (team.adminId !== currentAdminId) throw new ForbiddenException('Only admin can transfer admin');

    const newAdmin = await this.userRepo.findOne({ where: { id: newAdminId, teamId } });
    if (!newAdmin) throw new NotFoundException('User not in team');

    team.adminId = newAdminId;
    await this.teamRepo.save(team) as any;

    const oldAdmin = await this.userRepo.findOne({ where: { id: currentAdminId } });
    if (oldAdmin) {
      oldAdmin.role = 'member';
      await this.userRepo.save(oldAdmin) as any;
    }
    newAdmin.role = 'admin';
    await this.userRepo.save(newAdmin) as any;

    return { message: 'Admin transferred' };
  }

  async validateCode(code: string) {
    const team = await this.teamRepo.findOne({ where: { inviteCode: code } });
    if (!team) return { valid: false };
    return { valid: true, teamName: team.name };
  }

  private async generateCode(): Promise<string> {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let code = '';
    for (let i = 0; i < 6; i++) code += chars[Math.floor(Math.random() * chars.length)];
    return code;
  }
}
