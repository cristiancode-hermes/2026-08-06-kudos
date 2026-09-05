import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Kudos } from '../entities';

@Injectable()
export class LeaderboardService {
  constructor(
    @InjectRepository(Kudos)
    private kudosRepo: Repository<Kudos>,
  ) {}

  async getTopReceived(teamId: string, period: string) {
    const dateFilter = this.getDateFilter(period);

    const raw = await this.kudosRepo.query(`
      SELECT
        u.id, u.name, u.avatar_url,
        COUNT(k.id) as kudos_received
      FROM users u
      JOIN kudos k ON k.recipient_id = u.id
      WHERE k.created_at >= ?
        AND k.is_hidden = 0
        AND u.team_id = ?
      GROUP BY u.id, u.name, u.avatar_url
      ORDER BY kudos_received DESC
      LIMIT 10
    `, [dateFilter, teamId]);

    return raw;
  }

  async getTopGiven(teamId: string, period: string) {
    const dateFilter = this.getDateFilter(period);

    const raw = await this.kudosRepo.query(`
      SELECT
        u.id, u.name, u.avatar_url,
        COUNT(k.id) as kudos_given
      FROM users u
      JOIN kudos k ON k.sender_id = u.id
      WHERE k.created_at >= ?
        AND u.team_id = ?
      GROUP BY u.id, u.name, u.avatar_url
      ORDER BY kudos_given DESC
      LIMIT 10
    `, [dateFilter, teamId]);

    return raw;
  }

  private getDateFilter(period: string): string {
    const now = new Date();
    if (period === 'week') {
      const d = new Date(now);
      d.setDate(d.getDate() - d.getDay());
      d.setHours(0, 0, 0, 0);
      return d.toISOString();
    } else if (period === 'month') {
      const d = new Date(now.getFullYear(), now.getMonth(), 1);
      return d.toISOString();
    }
    // all time
    return '1970-01-01';
  }
}
