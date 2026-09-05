import { Injectable, BadRequestException, ForbiddenException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, MoreThan } from 'typeorm';
import { Kudos, User, KudosLike } from '../entities';
import { BadgeService } from '../badges/badges.service';

@Injectable()
export class KudosService {
  constructor(
    @InjectRepository(Kudos)
    private kudosRepo: Repository<Kudos>,
    @InjectRepository(User)
    private userRepo: Repository<User>,
    @InjectRepository(KudosLike)
    private likeRepo: Repository<KudosLike>,
    private badgeService: BadgeService,
  ) {}

  async create(senderId: string, dto: { recipientId: string; category: string; message: string }) {
    if (senderId === dto.recipientId) {
      throw new BadRequestException('Cannot send kudos to yourself');
    }

    if (dto.message.length < 10 || dto.message.length > 500) {
      throw new BadRequestException('Message must be between 10 and 500 characters');
    }

    const validCategories = ['thanks', 'great_work', 'helping_hand', 'leadership', 'innovation'];
    if (!validCategories.includes(dto.category)) {
      throw new BadRequestException('Invalid category');
    }

    // Rate limit: max 10 kudos per day
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayCount = await this.kudosRepo.count({
      where: {
        senderId,
        createdAt: MoreThan(today),
      },
    });
    if (todayCount >= 10) {
      throw new BadRequestException('Rate limit exceeded: max 10 kudos per day');
    }

    // Duplicate check: same recipient within 1 hour
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
    const recent = await this.kudosRepo.findOne({
      where: {
        senderId,
        recipientId: dto.recipientId,
        createdAt: MoreThan(oneHourAgo),
      },
    });
    if (recent) {
      throw new BadRequestException('Already sent kudos to this person within the last hour');
    }

    const recipient = await this.userRepo.findOne({ where: { id: dto.recipientId } });
    if (!recipient) throw new NotFoundException('Recipient not found');

    const kudos = this.kudosRepo.create({
      senderId,
      recipientId: dto.recipientId,
      category: dto.category,
      message: dto.message,
    } as any);
    const saved = await this.kudosRepo.save(kudos) as any;

    // Check badges for sender and recipient
    const newBadges = await this.badgeService.checkBadges(senderId);
    const recipientNewBadges = await this.badgeService.checkBadges(dto.recipientId);

    return {
      kudos: await this.findOne(saved.id),
      newBadges: [...newBadges, ...recipientNewBadges],
    };
  }

  async findAll(teamId: string, query: { page?: number; limit?: number; category?: string }) {
    const page = query.page || 1;
    const limit = query.limit || 20;
    const where: any = { isHidden: false };
    if (query.category) where.category = query.category;

    const [kudos, total] = await this.kudosRepo.findAndCount({
      where,
      relations: { sender: true, recipient: true, likes: true },
      order: { createdAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });

    const teamKudos = kudos.filter(k => k.sender && k.sender.teamId === teamId);

    return {
      data: teamKudos.map(k => ({
        ...k,
        likeCount: k.likes?.length || 0,
      })),
      total,
      page,
      limit,
    };
  }

  async findOne(id: string) {
    const kudos = await this.kudosRepo.findOne({
      where: { id },
      relations: { sender: true, recipient: true, likes: true },
    });
    if (!kudos) throw new NotFoundException('Kudos not found');
    return {
      ...kudos,
      likeCount: kudos.likes?.length || 0,
    };
  }

  async toggleLike(kudosId: string, userId: string) {
    const kudos = await this.kudosRepo.findOne({ where: { id: kudosId } });
    if (!kudos) throw new NotFoundException('Kudos not found');

    if (kudos.senderId === userId) {
      throw new BadRequestException('Cannot like your own kudos');
    }

    const existing = await this.likeRepo.findOne({ where: { kudosId, userId } });
    if (existing) {
      await this.likeRepo.remove(existing);
      return { liked: false };
    } else {
      await this.likeRepo.save(this.likeRepo.create({ kudosId, userId } as any));
      return { liked: true };
    }
  }

  async delete(kudosId: string, userId: string) {
    const kudos = await this.kudosRepo.findOne({ where: { id: kudosId } });
    if (!kudos) throw new NotFoundException('Kudos not found');
    if (kudos.senderId !== userId) throw new ForbiddenException('Can only delete own kudos');

    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    if (kudos.createdAt < twentyFourHoursAgo) {
      throw new BadRequestException('Can only delete kudos within 24 hours');
    }

    await this.kudosRepo.remove(kudos);
    return { message: 'Kudos deleted' };
  }
}
