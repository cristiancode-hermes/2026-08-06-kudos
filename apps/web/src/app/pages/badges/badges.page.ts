import { Component, signal, effect } from '@angular/core';

interface BadgeData {
  id: string;
  key: string;
  name: string;
  description: string;
  iconEmoji: string;
  criteriaType: string;
  criteriaTarget: number;
  progress: number;
  earned: boolean;
  earnedAt: string | null;
}

@Component({
  selector: 'app-badges-page',
  standalone: true,
  template: `
    <div class="max-w-4xl mx-auto px-4 sm:px-6 py-8">
      <h1 class="text-2xl font-bold text-gray-900 dark:text-white mb-2">Badges</h1>
      <p class="text-gray-500 dark:text-gray-400 mb-8">Earn badges by sending and receiving kudos</p>

      @if (loading()) {
        <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          @for (_ of [1,2,3,4,5,6,7,8]; track _) {
            <div class="aspect-square bg-gray-100 dark:bg-gray-800 rounded-2xl animate-pulse"></div>
          }
        </div>
      } @else {
        <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          @for (badge of badges(); track badge.id) {
            <div
              class="relative rounded-2xl border p-5 flex flex-col items-center justify-center text-center transition-all group"
              [class]="badge.earned
                ? 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md'
                : 'bg-gray-50 dark:bg-gray-800/50 border-gray-100 dark:border-gray-700/50'"
            >
              <!-- Badge emoji -->
              <span class="text-4xl sm:text-5xl mb-3" [class.opacity-30]="!badge.earned">{{ badge.iconEmoji }}</span>

              <!-- Name -->
              <p class="text-sm font-semibold text-gray-900 dark:text-white" [class.opacity-40]="!badge.earned">
                {{ badge.name }}
                @if (badge.earned) {
                  <span class="ml-1">✅</span>
                }
              </p>

              <!-- Description tooltip -->
              <p class="text-xs text-gray-500 dark:text-gray-400 mt-1 leading-relaxed" [class.opacity-40]="!badge.earned">
                {{ badge.description }}
              </p>

              <!-- Progress bar for locked -->
              @if (!badge.earned && badge.criteriaTarget > 0) {
                <div class="w-full mt-3">
                  <div class="flex justify-between text-xs mb-1">
                    <span class="text-gray-400">{{ badge.progress }}/{{ badge.criteriaTarget }}</span>
                    <span class="text-gray-400">{{ progressPercent(badge) }}%</span>
                  </div>
                  <div class="w-full h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                    <div
                      class="h-full bg-indigo-500 rounded-full transition-all duration-500"
                      [style.width.%]="progressPercent(badge)"
                    ></div>
                  </div>
                </div>
              }

              <!-- Earned date -->
              @if (badge.earned && badge.earnedAt) {
                <p class="text-xs text-gray-400 mt-2">
                  Earned {{ earnedDate(badge.earnedAt) }}
                </p>
              }
            </div>
          }
        </div>
      }
    </div>
  `,
})
export class BadgesPage {
  protected readonly badges = signal<BadgeData[]>([]);
  protected readonly loading = signal(true);

  constructor() {
    effect(() => { this.loadBadges(); }, { allowSignalWrites: true });
  }

  private token(): string | null {
    return localStorage.getItem('kudos-token');
  }

  private async loadBadges() {
    this.loading.set(true);
    try {
      const res = await fetch('/api/badges', {
        headers: { Authorization: `Bearer ${this.token()}` },
      });
      if (res.ok) {
        const data: BadgeData[] = await res.json();
        this.badges.set(data);
      }
    } catch (err) {
      console.error('Failed to load badges', err);
    } finally {
      this.loading.set(false);
    }
  }

  protected readonly progressPercent = (badge: BadgeData) => {
    if (badge.criteriaTarget === 0) return 0;
    return Math.min(100, Math.round((badge.progress / badge.criteriaTarget) * 100));
  };

  protected readonly earnedDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };
}
