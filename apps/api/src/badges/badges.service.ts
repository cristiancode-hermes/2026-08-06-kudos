import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Badge, UserBadge, User, Kudos } from '../entities';

@Injectable()
export class BadgeService {
  constructor(
    @InjectRepository(Badge)
    private badgeRepo: Repository<Badge>,
    @InjectRepository(UserBadge)
    private userBadgeRepo: Repository<UserBadge>,
    @InjectRepository(Kudos)
    private kudosRepo: Repository<Kudos>,
  ) {}

  async checkBadges(userId: string): Promise<UserBadge[]> {
    const allBadges = await this.badgeRepo.find();
    const earnedBadges = await this.userBadgeRepo.find({ where: { userId } });
    const earnedKeys = new Set(earnedBadges.map(ub => ub.badgeId));
    const newBadges: UserBadge[] = [];

    const receivedCount = await this.kudosRepo.count({ where: { recipientId: userId, isHidden: false } });
    const givenCount = await this.kudosRepo.count({ where: { senderId: userId } });

    for (const badge of allBadges) {
      if (earnedKeys.has(badge.id)) continue;

      let progress = 0;
      if (badge.criteriaType === 'received_count') {
        progress = receivedCount;
      } else if (badge.criteriaType === 'given_count') {
        progress = givenCount;
      } else if (badge.criteriaType === 'category_received') {
        const catWhere: any = { recipientId: userId, isHidden: false };
        if (badge.criteriaCategory) catWhere.category = badge.criteriaCategory;
        progress = await this.kudosRepo.count({ where: catWhere });
      }

      if (progress >= badge.criteriaTarget) {
        const ub = this.userBadgeRepo.create({ userId, badgeId: badge.id } as any);
        const saved = await this.userBadgeRepo.save(ub) as any;
        newBadges.push(saved);
      }
    }

    return newBadges;
  }

  async getAllBadges(userId: string) {
    const allBadges = await this.badgeRepo.find({ order: { criteriaTarget: 'ASC' } });
    const earnedBadges = await this.userBadgeRepo.find({
      where: { userId },
      relations: { badge: true },
    });
    const earnedMap = new Map(earnedBadges.map(ub => [ub.badgeId, ub]));

    const receivedCount = await this.kudosRepo.count({ where: { recipientId: userId, isHidden: false } });
    const givenCount = await this.kudosRepo.count({ where: { senderId: userId } });

    return allBadges.map(badge => {
      let progress = 0;
      let earned = false;

      if (earnedMap.has(badge.id)) {
        earned = true;
        progress = badge.criteriaTarget;
      } else {
        if (badge.criteriaType === 'received_count') progress = Math.min(receivedCount, badge.criteriaTarget);
        else if (badge.criteriaType === 'given_count') progress = Math.min(givenCount, badge.criteriaTarget);
        // For category badges, we don't pre-calculate progress (expensive)
      }

      return {
        ...badge,
        progress,
        earned,
        earnedAt: earnedMap.get(badge.id)?.earnedAt || null,
      };
    });
  }

  async getUserBadges(userId: string) {
    return this.userBadgeRepo.find({
      where: { userId },
      relations: { badge: true },
      order: { earnedAt: 'DESC' },
    });
  }
}
