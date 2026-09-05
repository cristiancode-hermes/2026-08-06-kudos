import { Injectable, BadRequestException, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { User, Team } from '../entities';
import { RegisterDto, LoginDto, UpdateProfileDto } from './dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private userRepo: Repository<User>,
    @InjectRepository(Team)
    private teamRepo: Repository<Team>,
    private jwtService: JwtService,
  ) {}

  async register(dto: RegisterDto) {
    const existing = await this.userRepo.findOne({ where: { email: dto.email } });
    if (existing) throw new BadRequestException('Email already registered');

    let team: Team;
    let role = 'member';

    if (dto.inviteCode) {
      team = await this.teamRepo.findOne({ where: { inviteCode: dto.inviteCode } }) as Team;
      if (!team) throw new BadRequestException('Invalid invite code');
    } else if (dto.teamName) {
      const existingTeam = await this.teamRepo.findOne({ where: { name: dto.teamName } });
      if (existingTeam) throw new BadRequestException('Team name taken');

      const code = await this.generateInviteCode();
      const newTeam = this.teamRepo.create({ name: dto.teamName, inviteCode: code, adminId: 'pending' } as any);
      team = await this.teamRepo.save(newTeam) as unknown as Team;
      role = 'admin';
    } else {
      throw new BadRequestException('Provide invite code or team name');
    }

    const passwordHash = await bcrypt.hash(dto.password, 10);
    const userEntity = this.userRepo.create({
      name: dto.name,
      email: dto.email,
      passwordHash,
      role,
      teamId: team.id,
    } as any);
    const saved = await this.userRepo.save(userEntity) as unknown as User;

    if (role === 'admin') {
      team.adminId = saved.id;
      await this.teamRepo.save(team) as unknown as Team;
    }

    const token = this.jwtService.sign({
      sub: saved.id,
      email: saved.email,
      role: saved.role,
      teamId: saved.teamId,
    });

    return { user: this.sanitizeUser(saved), token };
  }

  async login(dto: LoginDto) {
    const user = await this.userRepo.findOne({ where: { email: dto.email } });
    if (!user) throw new UnauthorizedException('Invalid email or password');

    const valid = await bcrypt.compare(dto.password, user.passwordHash);
    if (!valid) throw new UnauthorizedException('Invalid email or password');

    const token = this.jwtService.sign({
      sub: user.id,
      email: user.email,
      role: user.role,
      teamId: user.teamId,
    });

    return { user: this.sanitizeUser(user), token };
  }

  async getMe(userId: string) {
    const user = await this.userRepo.findOne({ where: { id: userId }, relations: { team: true } });
    if (!user) throw new UnauthorizedException();
    return { user: { ...this.sanitizeUser(user), team: user.team ? { id: user.team.id, name: user.team.name } : null } };
  }

  async updateProfile(userId: string, dto: UpdateProfileDto) {
    const user = await this.userRepo.findOne({ where: { id: userId } });
    if (!user) throw new UnauthorizedException();
    if (dto.name) user.name = dto.name;
    if (dto.avatarUrl !== undefined) user.avatarUrl = dto.avatarUrl;
    const saved = await this.userRepo.save(user) as unknown as User;
    return { user: this.sanitizeUser(saved) };
  }

  private sanitizeUser(user: User) {
    const { passwordHash, ...rest } = user;
    return rest;
  }

  private async generateInviteCode(): Promise<string> {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let code = '';
    for (let i = 0; i < 6; i++) code += chars[Math.floor(Math.random() * chars.length)];
    return code;
  }
}
