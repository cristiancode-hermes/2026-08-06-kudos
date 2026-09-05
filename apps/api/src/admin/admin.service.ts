import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Kudos } from '../entities';

@Injectable()
export class AdminService {
  constructor(
    @InjectRepository(Kudos)
    private kudosRepo: Repository<Kudos>,
  ) {}

  async getAllKudos(page = 1, limit = 20) {
    const [kudos, total] = await this.kudosRepo.findAndCount({
      relations: { sender: true, recipient: true, likes: true },
      order: { createdAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });

    return {
      data: kudos.map(k => ({ ...k, likeCount: k.likes?.length || 0 })),
      total,
      page,
      limit,
    };
  }

  async hideKudos(kudosId: string, adminId: string) {
    const kudos = await this.kudosRepo.findOne({ where: { id: kudosId } });
    if (!kudos) throw new NotFoundException('Kudos not found');

    kudos.isHidden = true;
    kudos.hiddenAt = new Date();
    kudos.hiddenByUserId = adminId;
    return this.kudosRepo.save(kudos);
  }

  async restoreKudos(kudosId: string) {
    const kudos = await this.kudosRepo.findOne({ where: { id: kudosId } });
    if (!kudos) throw new NotFoundException('Kudos not found');

    kudos.isHidden = false;
    kudos.hiddenAt = null;
    kudos.hiddenByUserId = null;
    return this.kudosRepo.save(kudos);
  }

  async getHiddenKudos(page = 1, limit = 20) {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const [kudos, total] = await this.kudosRepo.findAndCount({
      where: { isHidden: true },
      relations: { sender: true, recipient: true },
      order: { hiddenAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });

    return { data: kudos, total, page, limit };
  }
}
