import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User, Kudos, UserBadge, Badge } from '../entities';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private userRepo: Repository<User>,
    @InjectRepository(Kudos)
    private kudosRepo: Repository<Kudos>,
    @InjectRepository(UserBadge)
    private userBadgeRepo: Repository<UserBadge>,
    @InjectRepository(Badge)
    private badgeRepo: Repository<Badge>,
  ) {}

  async getProfile(userId: string) {
    const user = await this.userRepo.findOne({ where: { id: userId }, relations: { team: true } });
    if (!user) throw new NotFoundException('User not found');

    const receivedCount = await this.kudosRepo.count({ where: { recipientId: userId, isHidden: false } });
    const givenCount = await this.kudosRepo.count({ where: { senderId: userId } });
    const badges = await this.userBadgeRepo.find({ where: { userId }, relations: { badge: true } });

    const { passwordHash, ...safeUser } = user;
    return {
      user: safeUser,
      stats: { receivedCount, givenCount },
      badges: badges.map(ub => ub.badge),
    };
  }

  async search(teamId: string, q: string) {
    const users = await this.userRepo.find({
      where: { teamId },
    });
    return users
      .filter(u => u.name.toLowerCase().includes(q.toLowerCase()))
      .map(u => ({ id: u.id, name: u.name, email: u.email, avatarUrl: u.avatarUrl, role: u.role }));
  }

  async getUserKudos(userId: string, page = 1, limit = 20) {
    const [kudos, total] = await this.kudosRepo.findAndCount({
      where: { recipientId: userId, isHidden: false },
      relations: { sender: true },
      order: { createdAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });

    return { kudos, total, page, limit };
  }
}
