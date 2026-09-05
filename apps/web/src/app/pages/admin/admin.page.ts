import { Component, signal, effect } from '@angular/core';
import { AvatarComponent } from '../../components/avatar/avatar.component';

interface AdminKudos {
  id: string;
  sender: { id: string; name: string; avatarUrl: string | null };
  recipient: { id: string; name: string; avatarUrl: string | null };
  category: string;
  message: string;
  isHidden: boolean;
  likeCount: number;
  createdAt: string;
  hiddenAt: string | null;
  hiddenByUserId: string | null;
}

@Component({
  selector: 'app-admin-page',
  standalone: true,
  imports: [AvatarComponent],
  template: `
    <div class="max-w-4xl mx-auto px-4 sm:px-6 py-8">
      <h1 class="text-2xl font-bold text-gray-900 dark:text-white mb-6">Admin Panel</h1>

      <!-- Tabs -->
      <div class="flex gap-2 mb-6">
        <button
          (click)="tab.set('visible')"
          class="px-5 py-2 rounded-full text-sm font-medium transition-colors"
          [class]="tab() === 'visible'
            ? 'bg-indigo-600 text-white shadow-sm'
            : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700'"
        >
          All Kudos
        </button>
        <button
          (click)="tab.set('hidden')"
          class="px-5 py-2 rounded-full text-sm font-medium transition-colors"
          [class]="tab() === 'hidden'
            ? 'bg-indigo-600 text-white shadow-sm'
            : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700'"
        >
          Hidden Kudos
        </button>
      </div>

      <!-- Visible kudos -->
      @if (tab() === 'visible') {
        @if (loading()) {
          <div class="space-y-3">
            @for (_ of [1,2,3]; track _) {
              <div class="h-32 bg-gray-100 dark:bg-gray-800 rounded-xl animate-pulse"></div>
            }
          </div>
        } @else {
          <div class="space-y-3">
            @for (k of visibleKudos(); track k.id) {
              <div class="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
                <div class="flex items-center gap-3 mb-2">
                  <app-avatar [src]="k.sender.avatarUrl" [name]="k.sender.name" size="sm" />
                  <span class="text-sm font-medium text-gray-900 dark:text-white">{{ k.sender.name }}</span>
                  <svg class="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 8l4 4m0 0l-4 4m4-4H3"/>
                  </svg>
                  <app-avatar [src]="k.recipient.avatarUrl" [name]="k.recipient.name" size="sm" />
                  <span class="text-sm font-medium text-gray-900 dark:text-white">{{ k.recipient.name }}</span>
                  <span class="text-xs text-gray-400 ml-auto">{{ relativeTime(k.createdAt) }}</span>
                </div>
                <div class="flex items-center gap-2 mb-2">
                  <span class="inline-block px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300">
                    {{ categoryLabel(k.category) }}
                  </span>
                  <span class="text-xs text-gray-400">❤️ {{ k.likeCount }}</span>
                </div>
                <p class="text-sm text-gray-700 dark:text-gray-300 mb-3">{{ k.message }}</p>
                <button
                  (click)="hideKudos(k.id)"
                  class="px-3 py-1.5 text-xs font-medium text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/40 transition-colors"
                >
                  Hide
                </button>
              </div>
            }
            @if (visibleKudos().length === 0) {
              <p class="text-sm text-gray-500 dark:text-gray-400 text-center py-8">No kudos to moderate.</p>
            }

            <!-- Pagination -->
            @if (visibleTotal() > visibleLimit) {
              <div class="flex justify-center gap-2 mt-4">
                <button
                  (click)="visiblePage.update(p => _Math.max(1, p - 1))"
                  [disabled]="visiblePage() === 1"
                  class="px-3 py-1.5 text-sm rounded-lg border border-gray-200 dark:border-gray-700 disabled:opacity-50"
                >
                  Previous
                </button>
                <span class="px-3 py-1.5 text-sm text-gray-500">{{ visiblePage() }} / {{ visibleTotalPages() }}</span>
                <button
                  (click)="visiblePage.update(p => p + 1)"
                  [disabled]="visiblePage() >= visibleTotalPages()"
                  class="px-3 py-1.5 text-sm rounded-lg border border-gray-200 dark:border-gray-700 disabled:opacity-50"
                >
                  Next
                </button>
              </div>
            }
          </div>
        }
      }

      <!-- Hidden kudos -->
      @if (tab() === 'hidden') {
        @if (hiddenLoading()) {
          <div class="space-y-3">
            @for (_ of [1,2,3]; track _) {
              <div class="h-32 bg-gray-100 dark:bg-gray-800 rounded-xl animate-pulse"></div>
            }
          </div>
        } @else {
          <div class="space-y-3">
            @for (k of hiddenKudos(); track k.id) {
              <div class="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 opacity-75">
                <div class="flex items-center gap-3 mb-2">
                  <app-avatar [src]="k.sender.avatarUrl" [name]="k.sender.name" size="sm" />
                  <span class="text-sm font-medium text-gray-500 dark:text-gray-400 line-through">{{ k.sender.name }}</span>
                  <svg class="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 8l4 4m0 0l-4 4m4-4H3"/>
                  </svg>
                  <app-avatar [src]="k.recipient.avatarUrl" [name]="k.recipient.name" size="sm" />
                  <span class="text-sm font-medium text-gray-500 dark:text-gray-400 line-through">{{ k.recipient.name }}</span>
                  <span class="text-xs text-gray-400 ml-auto">Hidden {{ relativeTime(k.hiddenAt || k.createdAt) }}</span>
                </div>
                <p class="text-sm text-gray-500 dark:text-gray-400 line-through mb-3">{{ k.message }}</p>
                <button
                  (click)="restoreKudos(k.id)"
                  class="px-3 py-1.5 text-xs font-medium text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20 rounded-lg hover:bg-green-100 dark:hover:bg-green-900/40 transition-colors"
                >
                  Restore
                </button>
              </div>
            }
            @if (hiddenKudos().length === 0) {
              <p class="text-sm text-gray-500 dark:text-gray-400 text-center py-8">No hidden kudos.</p>
            }
          </div>
        }
      }
    </div>
  `,
})
export class AdminPage {
  protected readonly tab = signal<'visible' | 'hidden'>('visible');

  // Visible kudos
  protected readonly visibleKudos = signal<AdminKudos[]>([]);
  protected readonly visiblePage = signal(1);
  protected readonly visibleTotal = signal(0);
  protected readonly loading = signal(false);

  // Hidden kudos
  protected readonly hiddenKudos = signal<AdminKudos[]>([]);
  protected readonly hiddenLoading = signal(false);

  protected readonly visibleLimit = 20;

  protected readonly _Math = Math;

  private readonly categoryLabelsMap: Record<string, string> = {
    thanks: 'Thank You', great_work: 'Great Work', helping_hand: 'Helping Hand',
    leadership: 'Leadership', innovation: 'Innovation',
  };

  constructor() {
    effect(() => {
      this.tab();
      this.visiblePage();
      if (this.tab() === 'visible') this.loadVisible();
      else this.loadHidden();
    }, { allowSignalWrites: true });
  }

  private token(): string | null {
    return localStorage.getItem('kudos-token');
  }

  protected readonly visibleTotalPages = () => Math.max(1, Math.ceil(this.visibleTotal() / this.visibleLimit));

  private async loadVisible() {
    this.loading.set(true);
    try {
      const res = await fetch(`/api/admin/kudos?page=${this.visiblePage()}&limit=${this.visibleLimit}`, {
        headers: { Authorization: `Bearer ${this.token()}` },
      });
      if (res.ok) {
        const data = await res.json();
        this.visibleKudos.set(data.data);
        this.visibleTotal.set(data.total);
      }
    } catch { /* ignore */ }
    finally { this.loading.set(false); }
  }

  private async loadHidden() {
    this.hiddenLoading.set(true);
    try {
      const res = await fetch('/api/admin/kudos/hidden', {
        headers: { Authorization: `Bearer ${this.token()}` },
      });
      if (res.ok) {
        const data = await res.json();
        this.hiddenKudos.set(data.data);
      }
    } catch { /* ignore */ }
    finally { this.hiddenLoading.set(false); }
  }

  protected async hideKudos(id: string) {
    try {
      const res = await fetch(`/api/admin/kudos/${id}/hide`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${this.token()}` },
      });
      if (res.ok) {
        this.visibleKudos.update(list => list.filter(k => k.id !== id));
      }
    } catch { /* ignore */ }
  }

  protected async restoreKudos(id: string) {
    try {
      const res = await fetch(`/api/admin/kudos/${id}/restore`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${this.token()}` },
      });
      if (res.ok) {
        this.hiddenKudos.update(list => list.filter(k => k.id !== id));
      }
    } catch { /* ignore */ }
  }

  protected readonly categoryLabel = (cat: string) => this.categoryLabelsMap[cat] || cat;

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
