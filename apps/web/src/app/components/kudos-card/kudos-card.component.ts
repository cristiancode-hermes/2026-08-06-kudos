import { Component, input, output, signal } from '@angular/core';
import { AvatarComponent } from '../avatar/avatar.component';

export interface KudosCardData {
  id: string;
  sender: { id: string; name: string; avatarUrl: string | null };
  recipient: { id: string; name: string; avatarUrl: string | null };
  category: string;
  message: string;
  likeCount: number;
  liked?: boolean;
  createdAt: string;
}

@Component({
  selector: 'app-kudos-card',
  standalone: true,
  imports: [AvatarComponent],
  template: `
    <div class="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5 shadow-sm hover:shadow-md transition-shadow">
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-3">
          <app-avatar [src]="kudos().sender.avatarUrl" [name]="kudos().sender.name" size="sm" />
          <span class="text-sm font-medium text-gray-900 dark:text-white">{{ kudos().sender.name }}</span>
        </div>
        <div class="flex items-center gap-1 text-gray-400">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 8l4 4m0 0l-4 4m4-4H3"/>
          </svg>
          <app-avatar [src]="kudos().recipient.avatarUrl" [name]="kudos().recipient.name" size="sm" />
          <span class="text-sm font-medium text-gray-900 dark:text-white ml-1">{{ kudos().recipient.name }}</span>
        </div>
      </div>

      <div class="mt-3">
        <span [class]="categoryBadgeClass()">{{ categoryLabel() }}</span>
      </div>

      <p class="mt-3 text-gray-700 dark:text-gray-300 text-sm leading-relaxed">{{ kudos().message }}</p>

      <div class="mt-4 flex items-center justify-between">
        <span class="text-xs text-gray-400">{{ relativeTime() }}</span>
        <button
          (click)="toggleLike()"
          class="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm transition-colors"
          [class]="liked() ? 'bg-pink-50 dark:bg-pink-900/20 text-pink-600 dark:text-pink-400' : 'bg-gray-50 dark:bg-gray-700 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-600'"
        >
          @if (liked()) {
            <svg class="w-4 h-4 fill-current" viewBox="0 0 24 24">
              <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
            </svg>
          } @else {
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"/>
            </svg>
          }
          <span>{{ kudos().likeCount }}</span>
        </button>
      </div>
    </div>
  `,
})
export class KudosCardComponent {
  readonly kudos = input.required<KudosCardData>();
  readonly liked = signal(false);

  readonly categoryLabels: Record<string, string> = {
    thanks: 'Thank You',
    great_work: 'Great Work',
    helping_hand: 'Helping Hand',
    leadership: 'Leadership',
    innovation: 'Innovation',
  };

  readonly categoryColors: Record<string, string> = {
    thanks: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
    great_work: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300',
    helping_hand: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300',
    leadership: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300',
    innovation: 'bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-300',
  };

  protected readonly toggle = output<string>();

  protected readonly categoryLabel = () => this.categoryLabels[this.kudos().category] || this.kudos().category;
  protected readonly categoryBadgeClass = () => {
    const base = 'inline-block px-2.5 py-0.5 rounded-full text-xs font-medium';
    const color = this.categoryColors[this.kudos().category] || 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300';
    return `${base} ${color}`;
  };

  protected readonly relativeTime = () => {
    const now = Date.now();
    const then = new Date(this.kudos().createdAt).getTime();
    const diff = now - then;
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'just now';
    if (mins < 60) return `${mins}m ago`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    if (days < 7) return `${days}d ago`;
    return new Date(this.kudos().createdAt).toLocaleDateString();
  };

  protected toggleLike() {
    this.toggle.emit(this.kudos().id);
  }
}
