import { Component, signal, inject, effect } from '@angular/core';
import { Router } from '@angular/router';
import { KudosCardComponent, KudosCardData } from '../../components/kudos-card/kudos-card.component';

interface KudosResponse {
  data: KudosCardData[];
  total: number;
  page: number;
  limit: number;
}

@Component({
  selector: 'app-feed-page',
  standalone: true,
  imports: [KudosCardComponent],
  template: `
    <div class="max-w-3xl mx-auto px-4 sm:px-6 py-8">
      <h1 class="text-2xl font-bold text-gray-900 dark:text-white mb-6">Kudos Feed</h1>

      <!-- Category filter tabs -->
      <div class="flex flex-wrap gap-2 mb-6">
        @for (tab of categories; track tab.key) {
          <button
            (click)="selectedCategory.set(tab.key); page.set(1)"
            class="px-4 py-2 rounded-full text-sm font-medium transition-colors"
            [class]="selectedCategory() === tab.key
              ? 'bg-indigo-600 text-white shadow-sm'
              : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700'"
          >
            {{ tab.label }}
          </button>
        }
      </div>

      <!-- Loading skeleton -->
      @if (loading()) {
        <div class="space-y-4">
          @for (_ of [1,2,3]; track _) {
            <div class="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5 animate-pulse">
              <div class="flex items-center gap-3">
                <div class="w-10 h-10 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
                <div class="h-4 bg-gray-200 dark:bg-gray-700 rounded w-24"></div>
                <div class="h-4 bg-gray-200 dark:bg-gray-700 rounded w-20 ml-auto"></div>
              </div>
              <div class="mt-3 h-6 bg-gray-200 dark:bg-gray-700 rounded w-20"></div>
              <div class="mt-3 space-y-2">
                <div class="h-3 bg-gray-200 dark:bg-gray-700 rounded w-full"></div>
                <div class="h-3 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
              </div>
              <div class="mt-4 flex justify-between">
                <div class="h-3 bg-gray-200 dark:bg-gray-700 rounded w-16"></div>
                <div class="h-8 bg-gray-200 dark:bg-gray-700 rounded w-16"></div>
              </div>
            </div>
          }
        </div>
      }

      <!-- Empty state -->
      @if (!loading() && kudosList().length === 0) {
        <div class="text-center py-16">
          <span class="text-6xl">📭</span>
          <h3 class="text-lg font-semibold text-gray-900 dark:text-white mt-4">No kudos yet</h3>
          <p class="text-gray-500 dark:text-gray-400 mt-2">Be the first to send some kudos to your teammates!</p>
          <a routerLink="/send" class="inline-block mt-4 px-6 py-2.5 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 transition-colors text-sm">
            Send Kudos
          </a>
        </div>
      }

      <!-- Kudos cards -->
      <div class="space-y-4">
        @for (k of kudosList(); track k.id) {
          <app-kudos-card [kudos]="k" (toggle)="onToggleLike($event)" />
        }
      </div>

      <!-- Load More -->
      @if (!loading() && hasMore()) {
        <div class="text-center mt-8">
          <button
            (click)="loadMore()"
            class="px-6 py-2.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 font-medium rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-sm"
          >
            Load More
          </button>
        </div>
      }
    </div>
  `,
})
export class FeedPage {
  protected readonly categories = [
    { key: '', label: 'All' },
    { key: 'thanks', label: 'Thank You' },
    { key: 'great_work', label: 'Great Work' },
    { key: 'helping_hand', label: 'Helping Hand' },
    { key: 'leadership', label: 'Leadership' },
    { key: 'innovation', label: 'Innovation' },
  ];

  protected readonly kudosList = signal<KudosCardData[]>([]);
  protected readonly selectedCategory = signal('');
  protected readonly page = signal(1);
  protected readonly loading = signal(false);
  protected readonly total = signal(0);
  protected readonly hasMore = signal(true);

  private readonly router = inject(Router);

  constructor() {
    effect(() => {
      // React to category or page changes
      this.selectedCategory();
      this.page();
      this.loadKudos();
    }, { allowSignalWrites: true });
  }

  private token(): string | null {
    return localStorage.getItem('kudos-token');
  }

  private async loadKudos() {
    this.loading.set(true);
    try {
      const cat = this.selectedCategory();
      const params = new URLSearchParams({ page: String(this.page()), limit: '20' });
      if (cat) params.set('category', cat);

      const res = await fetch(`/api/kudos?${params}`, {
        headers: { Authorization: `Bearer ${this.token()}` },
      });

      if (res.status === 401) {
        await this.router.navigate(['/login']);
        return;
      }

      const data: KudosResponse = await res.json();

      if (this.page() === 1) {
        this.kudosList.set(data.data);
      } else {
        this.kudosList.update(list => [...list, ...data.data]);
      }

      this.total.set(data.total);
      this.hasMore.set(this.page() * data.limit < data.total);
    } catch (err) {
      console.error('Failed to load kudos', err);
    } finally {
      this.loading.set(false);
    }
  }

  protected loadMore() {
    this.page.update(p => p + 1);
  }

  protected async onToggleLike(kudosId: string) {
    try {
      const res = await fetch(`/api/kudos/${kudosId}/like`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${this.token()}` },
      });
      const data = await res.json();
      if (res.ok) {
        this.kudosList.update(list =>
          list.map(k => {
            if (k.id === kudosId) {
              return {
                ...k,
                liked: data.liked,
                likeCount: data.liked ? k.likeCount + 1 : k.likeCount - 1,
              };
            }
            return k;
          })
        );
      }
    } catch (err) {
      console.error('Failed to toggle like', err);
    }
  }
}
