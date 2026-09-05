import { Component, signal, effect } from '@angular/core';
import { AvatarComponent } from '../../components/avatar/avatar.component';

interface LeaderboardEntry {
  id: string;
  name: string;
  avatar_url: string | null;
  kudos_received: number;
}

interface GiverEntry {
  id: string;
  name: string;
  avatar_url: string | null;
  kudos_given: number;
}

@Component({
  selector: 'app-leaderboard-page',
  standalone: true,
  imports: [AvatarComponent],
  template: `
    <div class="max-w-4xl mx-auto px-4 sm:px-6 py-8">
      <h1 class="text-2xl font-bold text-gray-900 dark:text-white mb-6">Leaderboard</h1>

      <!-- Period tabs -->
      <div class="flex gap-2 mb-8">
        @for (p of periods; track p.key) {
          <button
            (click)="selectedPeriod.set(p.key)"
            class="px-5 py-2 rounded-full text-sm font-medium transition-colors"
            [class]="selectedPeriod() === p.key
              ? 'bg-indigo-600 text-white shadow-sm'
              : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700'"
          >
            {{ p.label }}
          </button>
        }
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <!-- Top Received -->
        <div>
          <h2 class="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            🏆 Top Recipients
          </h2>
          @if (loading()) {
            <div class="space-y-3">
              @for (_ of [1,2,3,4,5]; track _) {
                <div class="h-16 bg-gray-100 dark:bg-gray-800 rounded-xl animate-pulse"></div>
              }
            </div>
          } @else {
            <div class="space-y-2">
              @for (entry of topReceived(); track entry.id; let i = $index) {
                <div class="flex items-center gap-3 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 px-4 py-3">
                  <div class="w-8 text-center">
                    @if (i === 0) {
                      <span class="text-xl">🥇</span>
                    } @else if (i === 1) {
                      <span class="text-xl">🥈</span>
                    } @else if (i === 2) {
                      <span class="text-xl">🥉</span>
                    } @else {
                      <span class="text-sm font-bold text-gray-400">#{{ i + 1 }}</span>
                    }
                  </div>
                  <app-avatar [src]="entry.avatar_url" [name]="entry.name" size="md" />
                  <span class="flex-1 text-sm font-medium text-gray-900 dark:text-white">{{ entry.name }}</span>
                  <div class="text-right">
                    <p class="text-sm font-bold text-indigo-600 dark:text-indigo-400">{{ entry.kudos_received }}</p>
                    <p class="text-xs text-gray-400">kudos</p>
                  </div>
                </div>
              }
              @if (topReceived().length === 0) {
                <p class="text-sm text-gray-500 dark:text-gray-400 text-center py-8">No data for this period.</p>
              }
            </div>
          }
        </div>

        <!-- Top Givers -->
        <div>
          <h2 class="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            💝 Top Givers
          </h2>
          @if (loading()) {
            <div class="space-y-3">
              @for (_ of [1,2,3,4,5]; track _) {
                <div class="h-16 bg-gray-100 dark:bg-gray-800 rounded-xl animate-pulse"></div>
              }
            </div>
          } @else {
            <div class="space-y-2">
              @for (entry of topGivers(); track entry.id; let i = $index) {
                <div class="flex items-center gap-3 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 px-4 py-3">
                  <div class="w-8 text-center">
                    @if (i === 0) {
                      <span class="text-xl">🥇</span>
                    } @else if (i === 1) {
                      <span class="text-xl">🥈</span>
                    } @else if (i === 2) {
                      <span class="text-xl">🥉</span>
                    } @else {
                      <span class="text-sm font-bold text-gray-400">#{{ i + 1 }}</span>
                    }
                  </div>
                  <app-avatar [src]="entry.avatar_url" [name]="entry.name" size="md" />
                  <span class="flex-1 text-sm font-medium text-gray-900 dark:text-white">{{ entry.name }}</span>
                  <div class="text-right">
                    <p class="text-sm font-bold text-green-600 dark:text-green-400">{{ entry.kudos_given }}</p>
                    <p class="text-xs text-gray-400">given</p>
                  </div>
                </div>
              }
              @if (topGivers().length === 0) {
                <p class="text-sm text-gray-500 dark:text-gray-400 text-center py-8">No data for this period.</p>
              }
            </div>
          }
        </div>
      </div>
    </div>
  `,
})
export class LeaderboardPage {
  protected readonly periods = [
    { key: 'week', label: 'This Week' },
    { key: 'month', label: 'This Month' },
    { key: 'all', label: 'All Time' },
  ];
  protected readonly selectedPeriod = signal('week');
  protected readonly topReceived = signal<LeaderboardEntry[]>([]);
  protected readonly topGivers = signal<GiverEntry[]>([]);
  protected readonly loading = signal(false);

  constructor() {
    effect(() => {
      this.selectedPeriod();
      this.loadData();
    }, { allowSignalWrites: true });
  }

  private token(): string | null {
    return localStorage.getItem('kudos-token');
  }

  private async loadData() {
    this.loading.set(true);
    try {
      const [receivedRes, givenRes] = await Promise.all([
        fetch(`/api/leaderboard/received?period=${this.selectedPeriod()}`, {
          headers: { Authorization: `Bearer ${this.token()}` },
        }),
        fetch(`/api/leaderboard/given?period=${this.selectedPeriod()}`, {
          headers: { Authorization: `Bearer ${this.token()}` },
        }),
      ]);

      if (receivedRes.ok) {
        const data: LeaderboardEntry[] = await receivedRes.json();
        this.topReceived.set(data);
      }
      if (givenRes.ok) {
        const data: GiverEntry[] = await givenRes.json();
        this.topGivers.set(data);
      }
    } catch (err) {
      console.error('Failed to load leaderboard', err);
    } finally {
      this.loading.set(false);
    }
  }
}
