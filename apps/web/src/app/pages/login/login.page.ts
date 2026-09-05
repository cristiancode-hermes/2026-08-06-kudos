import { Component, signal, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-login-page',
  standalone: true,
  imports: [RouterLink, FormsModule],
  template: `
    <div class="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 px-4">
      <div class="w-full max-w-md">
        <div class="text-center mb-8">
          <span class="text-5xl">👏</span>
          <h1 class="text-3xl font-bold text-gray-900 dark:text-white mt-4">Welcome back</h1>
          <p class="text-gray-500 dark:text-gray-400 mt-2">Sign in to your Kudos account</p>
        </div>

        <form (ngSubmit)="onSubmit()" class="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-8 space-y-5">
          <!-- Email -->
          <div>
            <label for="email" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email</label>
            <input
              id="email"
              type="email"
              [(ngModel)]="email"
              name="email"
              required
              placeholder="you@example.com"
              class="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-colors text-sm"
              [class.border-red-400]="error()"
            />
          </div>

          <!-- Password -->
          <div>
            <label for="password" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Password</label>
            <input
              id="password"
              type="password"
              [(ngModel)]="password"
              name="password"
              required
              placeholder="Enter your password"
              class="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-colors text-sm"
              [class.border-red-400]="error()"
            />
          </div>

          <!-- Remember me -->
          <div class="flex items-center gap-2">
            <input
              id="remember"
              type="checkbox"
              [(ngModel)]="rememberMe"
              name="remember"
              class="w-4 h-4 rounded border-gray-300 dark:border-gray-600 text-indigo-600 focus:ring-indigo-500"
            />
            <label for="remember" class="text-sm text-gray-600 dark:text-gray-400">Remember me</label>
          </div>

          <!-- Error message -->
          @if (error()) {
            <div class="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg px-4 py-3 text-sm text-red-700 dark:text-red-300">
              {{ error() }}
            </div>
          }

          <!-- Submit -->
          <button
            type="submit"
            [disabled]="loading()"
            class="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white font-medium rounded-lg transition-colors text-sm"
          >
            @if (loading()) {
              <svg class="animate-spin h-4 w-4" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" fill="none"/>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
              </svg>
              Signing in...
            } @else {
              Sign in
            }
          </button>
        </form>

        <p class="text-center text-sm text-gray-500 dark:text-gray-400 mt-6">
          Don't have an account?
          <a routerLink="/register" class="text-indigo-600 dark:text-indigo-400 font-medium hover:underline">Create one</a>
        </p>
      </div>
    </div>
  `,
})
export class LoginPage {
  protected readonly email = signal('');
  protected readonly password = signal('');
  protected readonly rememberMe = signal(false);
  protected readonly loading = signal(false);
  protected readonly error = signal<string | null>(null);

  private readonly router = inject(Router);

  constructor() {
    const saved = localStorage.getItem('kudos-email');
    if (saved) {
      this.email.set(saved);
      this.rememberMe.set(true);
    }
  }

  protected async onSubmit() {
    if (!this.email() || !this.password()) {
      this.error.set('Please fill in all fields');
      return;
    }

    this.loading.set(true);
    this.error.set(null);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: this.email(), password: this.password() }),
      });

      const data = await res.json();

      if (!res.ok) {
        this.error.set(data.message || 'Invalid email or password');
        return;
      }

      localStorage.setItem('kudos-token', data.token);

      if (this.rememberMe()) {
        localStorage.setItem('kudos-email', this.email());
      } else {
        localStorage.removeItem('kudos-email');
      }

      await this.router.navigate(['/feed']);
    } catch (err) {
      this.error.set('Connection error. Please try again.');
    } finally {
      this.loading.set(false);
    }
  }
}
