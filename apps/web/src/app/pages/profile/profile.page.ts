import { Component, signal, inject, effect } from '@angular/core';
import { Router } from '@angular/router';
import { AvatarComponent } from '../../components/avatar/avatar.component';

interface ProfileData {
  user: {
    id: string;
    name: string;
    email: string;
    avatarUrl: string | null;
    role: string;
    teamId: string;
    createdAt: string;
  };
  stats: {
    receivedCount: number;
    givenCount: number;
  };
  badges: Array<{
    id: string;
    key: string;
    name: string;
    description: string;
    iconEmoji: string;
  }>;
}

interface KudosItem {
  id: string;
  sender: { id: string; name: string; avatarUrl: string | null };
  category: string;
  message: string;
  createdAt: string;
}

@Component({
  selector: 'app-profile-page',
  standalone: true,
  imports: [AvatarComponent],
  template: `
    <div class="max-w-3xl mx-auto px-4 sm:px-6 py-8">
      @if (loading()) {
        <div class="animate-pulse space-y-6">
          <div class="flex items-center gap-6">
            <div class="w-20 h-20 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
            <div class="space-y-2">
              <div class="h-6 bg-gray-200 dark:bg-gray-700 rounded w-40"></div>
              <div class="h-4 bg-gray-200 dark:bg-gray-700 rounded w-56"></div>
            </div>
          </div>
          <div class="grid grid-cols-3 gap-4">
            <div class="h-24 bg-gray-200 dark:bg-gray-700 rounded-xl"></div>
            <div class="h-24 bg-gray-200 dark:bg-gray-700 rounded-xl"></div>
            <div class="h-24 bg-gray-200 dark:bg-gray-700 rounded-xl"></div>
          </div>
        </div>
      } @else if (profile(); as p) {
        <!-- User info -->
        <div class="flex items-center gap-6 mb-8">
          <app-avatar [src]="p.user.avatarUrl" [name]="p.user.name" size="xl" />
          <div>
            <h1 class="text-2xl font-bold text-gray-900 dark:text-white">{{ p.user.name }}</h1>
            <p class="text-sm text-gray-500 dark:text-gray-400">{{ p.user.email }}</p>
            <div class="flex items-center gap-2 mt-2">
              @if (p.user.role === 'admin') {
                <span class="px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300">
                  Admin
                </span>
              }
              <span class="text-xs text-gray-400">
                Joined {{ joinDate() }}
              </span>
            </div>
          </div>
        </div>

        <!-- Stats -->
        <div class="grid grid-cols-3 gap-4 mb-8">
          <div class="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5 text-center">
            <p class="text-3xl font-bold text-indigo-600 dark:text-indigo-400">{{ p.stats.receivedCount }}</p>
            <p class="text-sm text-gray-500 dark:text-gray-400 mt-1">Received</p>
          </div>
          <div class="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5 text-center">
            <p class="text-3xl font-bold text-green-600 dark:text-green-400">{{ p.stats.givenCount }}</p>
            <p class="text-sm text-gray-500 dark:text-gray-400 mt-1">Given</p>
          </div>
          <div class="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5 text-center">
            <p class="text-3xl font-bold text-purple-600 dark:text-purple-400">{{ p.badges.length }}</p>
            <p class="text-sm text-gray-500 dark:text-gray-400 mt-1">Badges</p>
          </div>
        </div>

        <!-- Badges -->
        @if (p.badges.length > 0) {
          <div class="mb-8">
            <h2 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">Badges Earned</h2>
            <div class="flex flex-wrap gap-3">
              @for (badge of p.badges; track badge.id) {
                <div class="group relative flex flex-col items-center p-3 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
                  <span class="text-3xl">{{ badge.iconEmoji }}</span>
                  <span class="text-xs font-medium text-gray-700 dark:text-gray-300 mt-1">{{ badge.name }}</span>
                  <!-- Tooltip -->
                  <div class="absolute bottom-full mb-2 hidden group-hover:block bg-gray-900 dark:bg-gray-700 text-white text-xs rounded-lg px-3 py-2 whitespace-nowrap z-10">
                    {{ badge.description }}
                  </div>
                </div>
              }
            </div>
          </div>
        }

        <!-- Kudos Received -->
        <div>
          <h2 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">Kudos Received</h2>
          @if (kudosList().length === 0) {
            <p class="text-sm text-gray-500 dark:text-gray-400 py-8 text-center">No kudos received yet.</p>
          } @else {
            <div class="space-y-3">
              @for (k of kudosList(); track k.id) {
                <div class="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
                  <div class="flex items-center gap-3 mb-2">
                    <app-avatar [src]="k.sender.avatarUrl" [name]="k.sender.name" size="sm" />
                    <span class="text-sm font-medium text-gray-900 dark:text-white">{{ k.sender.name }}</span>
                    <span class="text-xs text-gray-400 ml-auto">{{ relativeTime(k.createdAt) }}</span>
                  </div>
                  <span class="inline-block px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300">
                    {{ categoryLabel(k.category) }}
                  </span>
                  <p class="mt-2 text-sm text-gray-700 dark:text-gray-300">{{ k.message }}</p>
                </div>
              }
            </div>
          }
        </div>
      }
    </div>
  `,
})
export class ProfilePage {
  protected readonly profile = signal<ProfileData | null>(null);
  protected readonly kudosList = signal<KudosItem[]>([]);
  protected readonly loading = signal(true);

  private readonly router = inject(Router);

  constructor() {
    effect(() => { this.loadProfile(); }, { allowSignalWrites: true });
  }

  private token(): string | null {
    return localStorage.getItem('kudos-token');
  }

  private async loadProfile() {
    this.loading.set(true);
    try {
      // First get me
      const meRes = await fetch('/api/auth/me', {
        headers: { Authorization: `Bearer ${this.token()}` },
      });
      if (meRes.status === 401) {
        await this.router.navigate(['/login']);
        return;
      }
      const meData = await meRes.json();

      const profileRes = await fetch(`/api/users/${meData.user.id}`, {
        headers: { Authorization: `Bearer ${this.token()}` },
      });
      if (profileRes.ok) {
        const profileData: ProfileData = await profileRes.json();
        this.profile.set(profileData);
      }

      // Get user's kudos
      const kudosRes = await fetch(`/api/users/${meData.user.id}/kudos`, {
        headers: { Authorization: `Bearer ${this.token()}` },
      });
      if (kudosRes.ok) {
        const kudosData = await kudosRes.json();
        this.kudosList.set(kudosData.kudos || []);
      }
    } catch (err) {
      console.error('Failed to load profile', err);
    } finally {
      this.loading.set(false);
    }
  }

  protected readonly joinDate = () => {
    const p = this.profile();
    if (!p) return '';
    return new Date(p.user.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long' });
  };

  protected readonly categoryLabel = (cat: string) => {
    const labels: Record<string, string> = {
      thanks: 'Thank You', great_work: 'Great Work', helping_hand: 'Helping Hand',
      leadership: 'Leadership', innovation: 'Innovation',
    };
    return labels[cat] || cat;
  };

  protected readonly relativeTime = (dateStr: string) => {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 60) return `${mins}m ago`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    if (days < 7) return `${days}d ago`;
    return new Date(dateStr).toLocaleDateString();
  };
}
