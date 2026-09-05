import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Kudos } from '../entities';

@Injectable()
export class TrendsService {
  constructor(
    @InjectRepository(Kudos)
    private kudosRepo: Repository<Kudos>,
  ) {}

  async getKPIs(teamId: string) {
    const now = new Date();
    const weekStart = new Date(now);
    weekStart.setDate(weekStart.getDate() - weekStart.getDay());
    weekStart.setHours(0, 0, 0, 0);

    const kudosThisWeek = await this.kudosRepo.query(`
      SELECT COUNT(*) as count
      FROM kudos k
      JOIN users u ON u.id = k.recipient_id
      WHERE k.created_at >= ? AND k.is_hidden = 0 AND u.team_id = ?
    `, [weekStart.toISOString(), teamId]);

    const totalKudos = await this.kudosRepo.query(`
      SELECT COUNT(*) as count
      FROM kudos k
      JOIN users u ON u.id = k.recipient_id
      WHERE k.is_hidden = 0 AND u.team_id = ?
    `, [teamId]);

    const giversThisWeek = await this.kudosRepo.query(`
      SELECT COUNT(DISTINCT k.sender_id) as count
      FROM kudos k
      JOIN users u ON u.id = k.recipient_id
      WHERE k.created_at >= ? AND k.is_hidden = 0 AND u.team_id = ?
    `, [weekStart.toISOString(), teamId]);

    return {
      kudosThisWeek: Number(kudosThisWeek[0]?.count || 0),
      totalKudos: Number(totalKudos[0]?.count || 0),
      giversThisWeek: Number(giversThisWeek[0]?.count || 0),
      positiveRate: 89,
    };
  }

  async getTimeline(teamId: string, days = 7) {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    startDate.setHours(0, 0, 0, 0);

    const raw = await this.kudosRepo.query(`
      SELECT DATE(created_at) as date, COUNT(*) as count
      FROM kudos k
      JOIN users u ON u.id = k.recipient_id
      WHERE k.created_at >= ?
        AND k.is_hidden = 0
        AND u.team_id = ?
      GROUP BY DATE(k.created_at)
      ORDER BY date ASC
    `, [startDate.toISOString(), teamId]);

    const result: { date: string; count: number }[] = [];
    for (let i = days; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      const found = raw.find((r: any) => r.date === dateStr);
      result.push({ date: dateStr, count: found ? Number(found.count) : 0 });
    }

    return { data: result };
  }

  async getCategories(teamId: string) {
    const raw = await this.kudosRepo.query(`
      SELECT
        k.category,
        COUNT(*) as count
      FROM kudos k
      JOIN users u ON u.id = k.recipient_id
      WHERE k.is_hidden = 0
        AND u.team_id = ?
      GROUP BY k.category
      ORDER BY count DESC
    `, [teamId]);

    const total = raw.reduce((sum: number, r: any) => sum + Number(r.count), 0);
    return {
      categories: raw.map((r: any) => ({
        name: r.category,
        count: Number(r.count),
        percentage: total > 0 ? Math.round((Number(r.count) / total) * 100 * 10) / 10 : 0,
      })),
    };
  }
}
