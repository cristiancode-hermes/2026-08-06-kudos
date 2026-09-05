import { Component, signal, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AvatarComponent } from '../../components/avatar/avatar.component';

interface UserResult {
  id: string;
  name: string;
  email: string;
  avatarUrl: string | null;
  role: string;
}

@Component({
  selector: 'app-send-page',
  standalone: true,
  imports: [FormsModule, AvatarComponent],
  template: `
    <div class="max-w-3xl mx-auto px-4 sm:px-6 py-8">
      <h1 class="text-2xl font-bold text-gray-900 dark:text-white mb-6">Send Kudos</h1>

      <div class="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6 sm:p-8 space-y-6">
        <!-- Recipient search -->
        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Who do you want to recognize?</label>
          <input
            type="text"
            [(ngModel)]="searchQuery"
            (input)="onSearch()"
            placeholder="Search by name..."
            class="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-colors text-sm"
          />

          <!-- Search results -->
          @if (searchResults().length > 0 && !selectedRecipient()) {
            <div class="mt-2 border border-gray-200 dark:border-gray-600 rounded-lg overflow-hidden">
              @for (user of searchResults(); track user.id) {
                <button
                  (click)="selectRecipient(user)"
                  class="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-left"
                >
                  <app-avatar [src]="user.avatarUrl" [name]="user.name" size="sm" />
                  <div>
                    <p class="text-sm font-medium text-gray-900 dark:text-white">{{ user.name }}</p>
                    <p class="text-xs text-gray-500 dark:text-gray-400">{{ user.email }}</p>
                  </div>
                </button>
              }
            </div>
          }

          <!-- Selected recipient -->
          @if (selectedRecipient(); as recipient) {
            <div class="mt-3 flex items-center gap-3 bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-200 dark:border-indigo-800 rounded-lg px-4 py-2.5">
              <app-avatar [src]="recipient.avatarUrl" [name]="recipient.name" size="sm" />
              <span class="text-sm font-medium text-indigo-700 dark:text-indigo-300 flex-1">{{ recipient.name }}</span>
              <button (click)="clearRecipient()" class="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
                </svg>
              </button>
            </div>
          }
        </div>

        <!-- Category selection -->
        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Category</label>
          <div class="grid grid-cols-2 sm:grid-cols-3 gap-2">
            @for (cat of categories; track cat.key) {
              <button
                type="button"
                (click)="selectedCategory.set(cat.key)"
                class="px-4 py-3 rounded-xl border text-sm font-medium transition-all text-left"
                [class]="selectedCategory() === cat.key
                  ? cat.activeClass
                  : 'border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600'"
              >
                <span class="text-lg block mb-1">{{ cat.emoji }}</span>
                {{ cat.label }}
              </button>
            }
          </div>
        </div>

        <!-- Message -->
        <div>
          <label for="message" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Message</label>
          <textarea
            id="message"
            [(ngModel)]="message"
            name="message"
            rows="4"
            placeholder="Write a thoughtful message (10-500 characters)..."
            class="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-colors text-sm resize-none"
            (input)="onMessageInput()"
          ></textarea>
          <div class="flex justify-between mt-1">
            <span class="text-xs text-gray-400">10-500 characters</span>
            <span class="text-xs" [class.text-red-500]="message().length > 500" [class.text-green-500]="message().length >= 10 && message().length <= 500">
              {{ message().length }}/500
            </span>
          </div>
        </div>

        <!-- Error -->
        @if (error()) {
          <div class="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg px-4 py-3 text-sm text-red-700 dark:text-red-300">
            {{ error() }}
          </div>
        }

        <!-- Success message -->
        @if (success()) {
          <div class="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg px-4 py-3 text-sm text-green-700 dark:text-green-300">
            Kudos sent! 🎉
          </div>
        }

        <!-- Submit -->
        <button
          (click)="onSubmit()"
          [disabled]="loading() || !canSubmit()"
          class="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white font-medium rounded-lg transition-colors text-sm"
        >
          @if (loading()) {
            <svg class="animate-spin h-4 w-4" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" fill="none"/>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
            </svg>
            Sending...
          } @else {
            Send Kudos 🎉
          }
        </button>
      </div>
    </div>
  `,
})
export class SendPage {
  protected readonly categories = [
    { key: 'thanks', label: 'Thank You', emoji: '🙏', activeClass: 'bg-blue-100 dark:bg-blue-900/30 border-blue-300 dark:border-blue-700 text-blue-700 dark:text-blue-300' },
    { key: 'great_work', label: 'Great Work', emoji: '🌟', activeClass: 'bg-green-100 dark:bg-green-900/30 border-green-300 dark:border-green-700 text-green-700 dark:text-green-300' },
    { key: 'helping_hand', label: 'Helping Hand', emoji: '🤝', activeClass: 'bg-purple-100 dark:bg-purple-900/30 border-purple-300 dark:border-purple-700 text-purple-700 dark:text-purple-300' },
    { key: 'leadership', label: 'Leadership', emoji: '👏', activeClass: 'bg-amber-100 dark:bg-amber-900/30 border-amber-300 dark:border-amber-700 text-amber-700 dark:text-amber-300' },
    { key: 'innovation', label: 'Innovation', emoji: '💡', activeClass: 'bg-cyan-100 dark:bg-cyan-900/30 border-cyan-300 dark:border-cyan-700 text-cyan-700 dark:text-cyan-300' },
  ];

  protected readonly searchQuery = signal('');
  protected readonly searchResults = signal<UserResult[]>([]);
  protected readonly selectedRecipient = signal<UserResult | null>(null);
  protected readonly selectedCategory = signal('');
  protected readonly message = signal('');
  protected readonly loading = signal(false);
  protected readonly error = signal<string | null>(null);
  protected readonly success = signal(false);

  private searchTimeout: ReturnType<typeof setTimeout> | null = null;
  private readonly router = inject(Router);

  private token(): string | null {
    return localStorage.getItem('kudos-token');
  }

  protected canSubmit(): boolean {
    return !!this.selectedRecipient() && !!this.selectedCategory() && this.message().length >= 10 && this.message().length <= 500;
  }

  protected onSearch() {
    if (this.searchTimeout) clearTimeout(this.searchTimeout);
    const q = this.searchQuery().trim();
    if (q.length < 1) {
      this.searchResults.set([]);
      return;
    }
    this.searchTimeout = setTimeout(() => this.doSearch(q), 300);
  }

  private async doSearch(q: string) {
    try {
      const res = await fetch(`/api/users/search?q=${encodeURIComponent(q)}`, {
        headers: { Authorization: `Bearer ${this.token()}` },
      });
      if (res.ok) {
        const data: UserResult[] = await res.json();
        this.searchResults.set(data);
      }
    } catch {
      // ignore
    }
  }

  protected selectRecipient(user: UserResult) {
    this.selectedRecipient.set(user);
    this.searchResults.set([]);
    this.searchQuery.set('');
  }

  protected clearRecipient() {
    this.selectedRecipient.set(null);
  }

  protected onMessageInput() {
    // Character count is reactive via signal
  }

  protected async onSubmit() {
    if (!this.canSubmit()) return;

    this.loading.set(true);
    this.error.set(null);
    this.success.set(false);

    try {
      const res = await fetch('/api/kudos', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.token()}`,
        },
        body: JSON.stringify({
          recipientId: this.selectedRecipient()!.id,
          category: this.selectedCategory(),
          message: this.message(),
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        this.error.set(data.message || 'Failed to send kudos');
        return;
      }

      this.success.set(true);
      setTimeout(() => this.router.navigate(['/feed']), 1500);
    } catch {
      this.error.set('Connection error. Please try again.');
    } finally {
      this.loading.set(false);
    }
  }
}
