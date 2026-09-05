import { Component, signal, effect } from '@angular/core';
import { KpiCardComponent } from '../../components/kpi-card/kpi-card.component';
import { AvatarComponent } from '../../components/avatar/avatar.component';

interface KPIs {
  kudosThisWeek: number;
  totalKudos: number;
  giversThisWeek: number;
  positiveRate: number;
}

interface TimelinePoint {
  date: string;
  count: number;
}

interface CategoryDist {
  name: string;
  count: number;
  percentage: number;
}

@Component({
  selector: 'app-trends-page',
  standalone: true,
  imports: [KpiCardComponent, AvatarComponent],
  template: `
    <div class="max-w-5xl mx-auto px-4 sm:px-6 py-8">
      <h1 class="text-2xl font-bold text-gray-900 dark:text-white mb-6">Trends</h1>

      <!-- KPI Cards -->
      @if (loading()) {
        <div class="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
          @for (_ of [1,2,3,4]; track _) {
            <div class="h-28 bg-gray-100 dark:bg-gray-800 rounded-xl animate-pulse"></div>
          }
        </div>
      } @else {
        <div class="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
          <app-kpi-card label="Kudos This Week" [value]="kpis()?.kudosThisWeek ?? 0" />
          <app-kpi-card label="Total Kudos" [value]="kpis()?.totalKudos ?? 0" />
          <app-kpi-card label="Active Givers" [value]="kpis()?.giversThisWeek ?? 0" />
          <app-kpi-card label="Positive Rate" [value]="(kpis()?.positiveRate ?? 0) + '%'" />
        </div>
      }

      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <!-- 7-day bar chart -->
        <div class="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6">
          <h2 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">Last 7 Days</h2>
          @if (timelineLoading()) {
            <div class="h-48 bg-gray-100 dark:bg-gray-800 rounded-xl animate-pulse"></div>
          } @else {
            <div class="flex items-end gap-2 h-48">
              @for (point of timeline(); track point.date) {
                <div class="flex-1 flex flex-col items-center gap-1">
                  <span class="text-xs font-medium text-gray-500 dark:text-gray-400">{{ point.count }}</span>
                  <div
                    class="w-full rounded-t-md transition-all"
                    [style.height.%]="barHeight(point.count)"
                    [class]="barColor(point.count)"
                  ></div>
                  <span class="text-xs text-gray-400">{{ dayLabel(point.date) }}</span>
                </div>
              }
            </div>
          }
        </div>

        <!-- Category distribution -->
        <div class="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6">
          <h2 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">Categories</h2>
          @if (categoriesLoading()) {
            <div class="space-y-3">
              @for (_ of [1,2,3,4,5]; track _) {
                <div class="h-8 bg-gray-100 dark:bg-gray-800 rounded-lg animate-pulse"></div>
              }
            </div>
          } @else {
            <div class="space-y-3">
              @for (cat of categories(); track cat.name) {
                <div>
                  <div class="flex justify-between items-center mb-1">
                    <span class="text-sm font-medium text-gray-700 dark:text-gray-300">{{ categoryLabel(cat.name) }}</span>
                    <span class="text-sm text-gray-500 dark:text-gray-400">{{ cat.count }} ({{ cat.percentage }}%)</span>
                  </div>
                  <div class="w-full h-2.5 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                    <div
                      class="h-full rounded-full transition-all duration-500"
                      [style.width.%]="cat.percentage"
                      [class]="categoryBarColor(cat.name)"
                    ></div>
                  </div>
                </div>
              }
            </div>
          }
        </div>
      </div>

      <!-- Top Givers -->
      <div class="mt-6 bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6">
        <h2 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">Top Givers (This Week)</h2>
        @if (giversLoading()) {
          <div class="space-y-3">
            @for (_ of [1,2,3]; track _) {
              <div class="h-14 bg-gray-100 dark:bg-gray-800 rounded-xl animate-pulse"></div>
            }
          </div>
        } @else {
          <div class="space-y-2">
            @for (giver of topGivers(); track giver.id; let i = $index) {
              <div class="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700/50">
                <span class="w-6 text-center text-sm font-bold text-gray-400">#{{ i + 1 }}</span>
                <app-avatar [src]="giver.avatar_url" [name]="giver.name" size="sm" />
                <span class="flex-1 text-sm font-medium text-gray-900 dark:text-white">{{ giver.name }}</span>
                <span class="text-sm font-semibold text-green-600 dark:text-green-400">{{ giver.kudos_given }} given</span>
              </div>
            }
            @if (topGivers().length === 0) {
              <p class="text-sm text-gray-500 dark:text-gray-400 text-center py-4">No givers this week.</p>
            }
          </div>
        }
      </div>
    </div>
  `,
})
export class TrendsPage {
  protected readonly kpis = signal<KPIs | null>(null);
  protected readonly timeline = signal<TimelinePoint[]>([]);
  protected readonly categories = signal<CategoryDist[]>([]);
  protected readonly topGivers = signal<any[]>([]);

  protected readonly loading = signal(true);
  protected readonly timelineLoading = signal(true);
  protected readonly categoriesLoading = signal(true);
  protected readonly giversLoading = signal(true);

  private readonly categoryLabelsMap: Record<string, string> = {
    thanks: 'Thank You', great_work: 'Great Work', helping_hand: 'Helping Hand',
    leadership: 'Leadership', innovation: 'Innovation',
  };

  private readonly categoryColors: Record<string, string> = {
    thanks: 'bg-blue-500', great_work: 'bg-green-500', helping_hand: 'bg-purple-500',
    leadership: 'bg-amber-500', innovation: 'bg-cyan-500',
  };

  constructor() {
    effect(() => { this.loadAll(); }, { allowSignalWrites: true });
  }

  private token(): string | null {
    return localStorage.getItem('kudos-token');
  }

  private async loadAll() {
    await Promise.all([
      this.loadKPIs(),
      this.loadTimeline(),
      this.loadCategories(),
      this.loadTopGivers(),
    ]);
  }

  private async loadKPIs() {
    this.loading.set(true);
    try {
      const res = await fetch('/api/trends/kpis', {
        headers: { Authorization: `Bearer ${this.token()}` },
      });
      if (res.ok) this.kpis.set(await res.json());
    } catch { /* ignore */ }
    finally { this.loading.set(false); }
  }

  private async loadTimeline() {
    this.timelineLoading.set(true);
    try {
      const res = await fetch('/api/trends/timeline?days=7', {
        headers: { Authorization: `Bearer ${this.token()}` },
      });
      if (res.ok) {
        const data = await res.json();
        this.timeline.set(data.data || []);
      }
    } catch { /* ignore */ }
    finally { this.timelineLoading.set(false); }
  }

  private async loadCategories() {
    this.categoriesLoading.set(true);
    try {
      const res = await fetch('/api/trends/categories', {
        headers: { Authorization: `Bearer ${this.token()}` },
      });
      if (res.ok) {
        const data = await res.json();
        this.categories.set(data.categories || []);
      }
    } catch { /* ignore */ }
    finally { this.categoriesLoading.set(false); }
  }

  private async loadTopGivers() {
    this.giversLoading.set(true);
    try {
      const res = await fetch('/api/leaderboard/given?period=week', {
        headers: { Authorization: `Bearer ${this.token()}` },
      });
      if (res.ok) {
        const data = await res.json();
        this.topGivers.set(data.slice(0, 5));
      }
    } catch { /* ignore */ }
    finally { this.giversLoading.set(false); }
  }

  protected readonly categoryLabel = (cat: string) => this.categoryLabelsMap[cat] || cat;
  protected readonly categoryBarColor = (cat: string) => this.categoryColors[cat] || 'bg-indigo-500';

  protected readonly barHeight = (count: number) => {
    const max = Math.max(...this.timeline().map(p => p.count), 1);
    return Math.max(4, (count / max) * 100);
  };

  protected readonly barColor = (count: number) => {
    if (count === 0) return 'bg-gray-200 dark:bg-gray-600';
    if (count >= 5) return 'bg-indigo-500';
    if (count >= 3) return 'bg-indigo-400';
    return 'bg-indigo-300';
  };

  protected readonly dayLabel = (dateStr: string) => {
    const d = new Date(dateStr + 'T00:00:00');
    return d.toLocaleDateString('en-US', { weekday: 'short' });
  };
}
