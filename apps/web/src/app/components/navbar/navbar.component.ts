import { Component, signal, inject, effect } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';

interface NavLink {
  path: string;
  label: string;
  icon: string;
  adminOnly?: boolean;
}

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive],
  template: `
    <nav class="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 sticky top-0 z-50">
      <div class="max-w-6xl mx-auto px-4 sm:px-6">
        <div class="flex items-center justify-between h-16">
          <!-- Logo -->
          <a routerLink="/feed" class="flex items-center gap-2">
            <span class="text-2xl">👏</span>
            <span class="text-xl font-bold text-gray-900 dark:text-white">Kudos</span>
          </a>

          <!-- Desktop Nav -->
          <div class="hidden md:flex items-center gap-1">
            @for (link of visibleLinks(); track link.path) {
              <a
                [routerLink]="link.path"
                routerLinkActive="bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400"
                class="px-3 py-2 rounded-lg text-sm font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              >
                <span class="mr-1.5">{{ link.icon }}</span>
                {{ link.label }}
              </a>
            }
          </div>

          <!-- Right side -->
          <div class="flex items-center gap-3">
            <!-- Dark mode toggle -->
            <button
              (click)="toggleDarkMode()"
              class="p-2 rounded-lg text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            >
              @if (isDarkMode()) {
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"/>
                </svg>
              } @else {
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"/>
                </svg>
              }
            </button>

            <!-- Profile -->
            @if (userName()) {
              <a routerLink="/profile" class="flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                <div class="w-8 h-8 rounded-full bg-indigo-500 flex items-center justify-center text-white text-xs font-semibold">
                  {{ initials() }}
                </div>
                <span class="hidden sm:block text-sm font-medium text-gray-700 dark:text-gray-300">{{ userName() }}</span>
              </a>
            }

            <!-- Mobile hamburger -->
            <button
              (click)="mobileOpen.set(!mobileOpen())"
              class="md:hidden p-2 rounded-lg text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"
            >
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                @if (mobileOpen()) {
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
                } @else {
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"/>
                }
              </svg>
            </button>
          </div>
        </div>

        <!-- Mobile nav -->
        @if (mobileOpen()) {
          <div class="md:hidden pb-4 space-y-1">
            @for (link of visibleLinks(); track link.path) {
              <a
                [routerLink]="link.path"
                routerLinkActive="bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400"
                class="block px-3 py-2 rounded-lg text-sm font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                (click)="mobileOpen.set(false)"
              >
                <span class="mr-1.5">{{ link.icon }}</span>
                {{ link.label }}
              </a>
            }
          </div>
        }
      </div>
    </nav>
  `,
})
export class NavbarComponent {
  readonly userName = signal<string | null>(null);
  readonly isAdmin = signal(false);
  protected readonly mobileOpen = signal(false);

  protected readonly allLinks: NavLink[] = [
    { path: '/feed', label: 'Feed', icon: '📰' },
    { path: '/send', label: 'Send', icon: '🎉' },
    { path: '/leaderboard', label: 'Leaderboard', icon: '🏆' },
    { path: '/badges', label: 'Badges', icon: '🎖️' },
    { path: '/trends', label: 'Trends', icon: '📊' },
    { path: '/team', label: 'Team', icon: '👥' },
    { path: '/admin', label: 'Admin', icon: '⚙️', adminOnly: true },
  ];

  protected readonly visibleLinks = signal<NavLink[]>([]);

  private readonly DARK_MODE_KEY = 'kudos-dark-mode';

  protected readonly isDarkMode = signal(false);

  constructor() {
    effect(() => {
      const admin = this.isAdmin();
      this.visibleLinks.set(
        admin ? this.allLinks : this.allLinks.filter(l => !l.adminOnly)
      );
    });

    // Load dark mode preference
    const saved = localStorage.getItem(this.DARK_MODE_KEY);
    if (saved === 'true') {
      this.isDarkMode.set(true);
      document.documentElement.classList.add('dark');
    }
  }

  protected readonly initials = () => {
    const name = this.userName() || '';
    const parts = name.trim().split(/\s+/);
    if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
    return name.slice(0, 2).toUpperCase();
  };

  protected toggleDarkMode() {
    const next = !this.isDarkMode();
    this.isDarkMode.set(next);
    localStorage.setItem(this.DARK_MODE_KEY, String(next));
    if (next) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }
}
