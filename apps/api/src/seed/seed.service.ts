import { Injectable, OnApplicationBootstrap } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import { User, Team, Kudos, KudosLike, Badge, UserBadge } from '../entities';

@Injectable()
export class SeedService implements OnApplicationBootstrap {
  constructor(
    @InjectRepository(User) private userRepo: Repository<User>,
    @InjectRepository(Team) private teamRepo: Repository<Team>,
    @InjectRepository(Kudos) private kudosRepo: Repository<Kudos>,
    @InjectRepository(KudosLike) private likeRepo: Repository<KudosLike>,
    @InjectRepository(Badge) private badgeRepo: Repository<Badge>,
    @InjectRepository(UserBadge) private userBadgeRepo: Repository<UserBadge>,
  ) {}

  async onApplicationBootstrap() {
    const existing = await this.teamRepo.count();
    if (existing > 0) return;

    console.log('Seeding database...');

    // Create team
    const team = this.teamRepo.create({ name: 'Engineering', inviteCode: 'ENG-7X9K', adminId: 'seed-admin' } as any);
    const savedTeam = await this.teamRepo.save(team) as any;

    // Create users with stable UUIDs
    const passwordHash = await bcrypt.hash('password123', 10);
    const usersData = [
      { id: 'user-ana', name: 'Ana Torres', email: 'ana@example.com', role: 'admin' as const },
      { id: 'user-victor', name: 'Víctor Ruiz', email: 'victor@example.com', role: 'member' as const },
      { id: 'user-maria', name: 'Maria López', email: 'maria@example.com', role: 'member' as const },
      { id: 'user-alex', name: 'Alex Kim', email: 'alex@example.com', role: 'member' as const },
      { id: 'user-sara', name: 'Sara Chen', email: 'sara@example.com', role: 'member' as const },
      { id: 'user-carlos', name: 'Carlos Vega', email: 'carlos@example.com', role: 'member' as const },
    ];

    const users: User[] = [];
    for (const u of usersData) {
      const user = this.userRepo.create({
        id: u.id,
        name: u.name,
        email: u.email,
        passwordHash,
        role: u.role,
        teamId: savedTeam.id,
      } as any);
      users.push(await this.userRepo.save(user as any) as any);
    }

    // Set admin on team
    savedTeam.adminId = users[0].id;
    await this.teamRepo.save(savedTeam) as any;

    // Create badge definitions
    const badgesData = [
      { key: 'first_kudos', name: 'First Kudos!', description: 'Received your first kudos', iconEmoji: '🏆', criteriaType: 'received_count' as const, criteriaTarget: 1 },
      { key: 'double_digits', name: 'Double Digits', description: 'Received 10 kudos', iconEmoji: '💪', criteriaType: 'received_count' as const, criteriaTarget: 10 },
      { key: 'half_century', name: 'Half Century', description: 'Received 50 kudos', iconEmoji: '🌟', criteriaType: 'received_count' as const, criteriaTarget: 50 },
      { key: 'centurion', name: 'Centurion', description: 'Received 100 kudos', iconEmoji: '🏅', criteriaType: 'received_count' as const, criteriaTarget: 100 },
      { key: 'generous_spirit', name: 'Generous Spirit', description: 'Given 10 kudos', iconEmoji: '✨', criteriaType: 'given_count' as const, criteriaTarget: 10 },
      { key: 'heart_of_gold', name: 'Heart of Gold', description: 'Given 50 kudos', iconEmoji: '💝', criteriaType: 'given_count' as const, criteriaTarget: 50 },
      { key: 'helping_hand_badge', name: 'Helping Hand', description: 'Received 5 Helping Hand kudos', iconEmoji: '🤝', criteriaType: 'category_received' as const, criteriaTarget: 5, criteriaCategory: 'helping_hand' },
      { key: 'great_work_ace', name: 'Great Work Ace', description: 'Received 5 Great Work kudos', iconEmoji: '🎯', criteriaType: 'category_received' as const, criteriaTarget: 5, criteriaCategory: 'great_work' },
      { key: 'leader_of_leaders', name: 'Leader of Leaders', description: 'Received 5 Leadership kudos', iconEmoji: '👑', criteriaType: 'category_received' as const, criteriaTarget: 5, criteriaCategory: 'leadership' },
      { key: 'innovation_spark', name: 'Innovation Spark', description: 'Received 5 Innovation kudos', iconEmoji: '🔥', criteriaType: 'category_received' as const, criteriaTarget: 5, criteriaCategory: 'innovation' },
      { key: 'thankful_heart', name: 'Thankful Heart', description: 'Received 5 Thank You kudos', iconEmoji: '🌈', criteriaType: 'category_received' as const, criteriaTarget: 5, criteriaCategory: 'thanks' },
      { key: 'first_giver', name: 'First Giver', description: 'Sent your first kudos', iconEmoji: '🚀', criteriaType: 'given_count' as const, criteriaTarget: 1 },
    ];

    const badges: Badge[] = [];
    for (const b of badgesData) {
      const badge = this.badgeRepo.create(b as any);
      badges.push(await this.badgeRepo.save(badge as any) as any);
    }

    // Create kudos (spanning ~2 weeks)
    const now = new Date();
    const kudosData = [
      { sender: users[0], recipient: users[1], category: 'great_work', message: 'Crushed the sprint demo today! Amazing presentation skills.', daysAgo: 0 },
      { sender: users[2], recipient: users[3], category: 'thanks', message: 'Helped me debug the auth issue late into the night. True hero!', daysAgo: 0 },
      { sender: users[4], recipient: users[0], category: 'leadership', message: 'Guided us through the migration with clarity and patience.', daysAgo: 1 },
      { sender: users[1], recipient: users[5], category: 'helping_hand', message: 'Jumped on the production issue within minutes. Saved the day!', daysAgo: 1 },
      { sender: users[3], recipient: users[2], category: 'thanks', message: 'Always willing to review PRs and give constructive feedback.', daysAgo: 2 },
      { sender: users[5], recipient: users[0], category: 'great_work', message: 'Your architecture proposal for the new service was brilliant.', daysAgo: 2 },
      { sender: users[1], recipient: users[4], category: 'innovation', message: 'The dashboard redesign idea is game-changing. Love the creativity!', daysAgo: 3 },
      { sender: users[2], recipient: users[4], category: 'helping_hand', message: 'Stayed late to help the new team members get up to speed.', daysAgo: 3 },
      { sender: users[0], recipient: users[3], category: 'leadership', message: 'Leading the frontend guild with such dedication and skill.', daysAgo: 4 },
      { sender: users[4], recipient: users[1], category: 'great_work', message: 'The API documentation you wrote is the best I\'ve ever seen.', daysAgo: 4 },
      { sender: users[5], recipient: users[2], category: 'thanks', message: 'Thanks for covering my on-call shift last weekend.', daysAgo: 5 },
      { sender: users[3], recipient: users[0], category: 'great_work', message: 'Your code review feedback is always constructive and actionable.', daysAgo: 5 },
      { sender: users[1], recipient: users[5], category: 'helping_hand', message: 'Helped me understand the new deployment pipeline. Great teacher!', daysAgo: 6 },
      { sender: users[0], recipient: users[2], category: 'innovation', message: 'The automated testing framework you built saves us hours every sprint.', daysAgo: 7 },
      { sender: users[4], recipient: users[5], category: 'thanks', message: 'Thanks for always keeping the team spirits high during tough sprints.', daysAgo: 8 },
      { sender: users[2], recipient: users[1], category: 'great_work', message: 'Your performance optimization work cut our API latency in half!', daysAgo: 9 },
      { sender: users[3], recipient: users[5], category: 'leadership', message: 'Leading the infra migration with zero downtime was impressive.', daysAgo: 10 },
      { sender: users[5], recipient: users[3], category: 'thanks', message: 'Thanks for setting up the CI/CD pipeline. It works flawlessly.', daysAgo: 11 },
      { sender: users[0], recipient: users[4], category: 'helping_hand', message: 'Your mentorship of the junior devs is making a real difference.', daysAgo: 12 },
      { sender: users[1], recipient: users[2], category: 'innovation', message: 'The monitoring dashboard you built is incredibly useful for the team.', daysAgo: 13 },
    ];

    const kudosList: Kudos[] = [];
    for (const k of kudosData) {
      const date = new Date(now);
      date.setDate(date.getDate() - k.daysAgo);
      const kudos = this.kudosRepo.create({
        senderId: k.sender.id,
        recipientId: k.recipient.id,
        category: k.category,
        message: k.message,
        createdAt: date,
      } as any);
      kudosList.push(await this.kudosRepo.save(kudos as any) as any);
    }

    // Create kudos likes (~15)
    const likesData = [
      { kudosIndex: 0, user: users[2] },
      { kudosIndex: 0, user: users[3] },
      { kudosIndex: 0, user: users[4] },
      { kudosIndex: 1, user: users[0] },
      { kudosIndex: 1, user: users[4] },
      { kudosIndex: 2, user: users[1] },
      { kudosIndex: 2, user: users[3] },
      { kudosIndex: 2, user: users[5] },
      { kudosIndex: 3, user: users[0] },
      { kudosIndex: 3, user: users[2] },
      { kudosIndex: 4, user: users[4] },
      { kudosIndex: 5, user: users[1] },
      { kudosIndex: 5, user: users[2] },
      { kudosIndex: 6, user: users[0] },
      { kudosIndex: 6, user: users[4] },
    ];

    for (const l of likesData) {
      const like = this.likeRepo.create({
        kudosId: kudosList[l.kudosIndex].id,
        userId: l.user.id,
      } as any);
      await this.likeRepo.save(like) as any;
    }

    // Create user badges (~8 pre-awarded)
    // Ana has 3 badges: First Kudos, First Giver, Double Digits
    await this.userBadgeRepo.save(this.userBadgeRepo.create({ userId: users[0].id, badgeId: badges[0].id } as any));
    await this.userBadgeRepo.save(this.userBadgeRepo.create({ userId: users[0].id, badgeId: badges[11].id } as any));
    await this.userBadgeRepo.save(this.userBadgeRepo.create({ userId: users[0].id, badgeId: badges[1].id } as any)); // double digits (has many kudos)

    // Víctor has 2 badges: First Kudos, First Giver
    await this.userBadgeRepo.save(this.userBadgeRepo.create({ userId: users[1].id, badgeId: badges[0].id } as any));
    await this.userBadgeRepo.save(this.userBadgeRepo.create({ userId: users[1].id, badgeId: badges[11].id } as any));

    // Maria has 2 badges: First Kudos, First Giver
    await this.userBadgeRepo.save(this.userBadgeRepo.create({ userId: users[2].id, badgeId: badges[0].id } as any));
    await this.userBadgeRepo.save(this.userBadgeRepo.create({ userId: users[2].id, badgeId: badges[11].id } as any));

    // Alex has 1 badge: First Giver
    await this.userBadgeRepo.save(this.userBadgeRepo.create({ userId: users[3].id, badgeId: badges[11].id } as any));

    console.log(`Seeded: 1 team, ${users.length} users, ${kudosList.length} kudos, ${likesData.length} likes, ${badges.length} badges, 8 user badges`);
  }
}
