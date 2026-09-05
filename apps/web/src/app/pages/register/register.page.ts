import { Component, signal, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-register-page',
  standalone: true,
  imports: [RouterLink, FormsModule],
  template: `
    <div class="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 px-4 py-12">
      <div class="w-full max-w-md">
        <div class="text-center mb-8">
          <span class="text-5xl">👏</span>
          <h1 class="text-3xl font-bold text-gray-900 dark:text-white mt-4">Create your account</h1>
          <p class="text-gray-500 dark:text-gray-400 mt-2">Join or create a team</p>
        </div>

        <form (ngSubmit)="onSubmit()" class="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-8 space-y-5">
          <!-- Name -->
          <div>
            <label for="name" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Name</label>
            <input
              id="name"
              type="text"
              [(ngModel)]="name"
              name="name"
              required
              placeholder="Your full name"
              class="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-colors text-sm"
            />
          </div>

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
              minlength="8"
              placeholder="At least 8 characters"
              class="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-colors text-sm"
            />
            @if (password() && password().length < 8) {
              <p class="text-xs text-red-500 mt-1">Password must be at least 8 characters</p>
            }
          </div>

          <!-- Radio: Join or Create team -->
          <div class="space-y-3">
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">Team</label>
            <div class="flex gap-4">
              <label class="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  [value]="'join'"
                  [(ngModel)]="teamAction"
                  name="teamAction"
                  class="w-4 h-4 text-indigo-600 focus:ring-indigo-500"
                />
                <span class="text-sm text-gray-700 dark:text-gray-300">Join a team</span>
              </label>
              <label class="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  [value]="'create'"
                  [(ngModel)]="teamAction"
                  name="teamAction"
                  class="w-4 h-4 text-indigo-600 focus:ring-indigo-500"
                />
                <span class="text-sm text-gray-700 dark:text-gray-300">Create a team</span>
              </label>
            </div>
          </div>

          <!-- Invite code or Team name -->
          @if (teamAction() === 'join') {
            <div>
              <label for="inviteCode" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Invite Code</label>
              <input
                id="inviteCode"
                type="text"
                [(ngModel)]="inviteCode"
                name="inviteCode"
                placeholder="Enter team invite code"
                class="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-colors text-sm uppercase"
              />
            </div>
          } @else {
            <div>
              <label for="teamName" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Team Name</label>
              <input
                id="teamName"
                type="text"
                [(ngModel)]="teamName"
                name="teamName"
                placeholder="Your team name"
                class="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-colors text-sm"
              />
            </div>
          }

          <!-- Error -->
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
              Creating account...
            } @else {
              Create account
            }
          </button>
        </form>

        <p class="text-center text-sm text-gray-500 dark:text-gray-400 mt-6">
          Already have an account?
          <a routerLink="/login" class="text-indigo-600 dark:text-indigo-400 font-medium hover:underline">Sign in</a>
        </p>
      </div>
    </div>
  `,
})
export class RegisterPage {
  protected readonly name = signal('');
  protected readonly email = signal('');
  protected readonly password = signal('');
  protected readonly teamAction = signal<'join' | 'create'>('join');
  protected readonly inviteCode = signal('');
  protected readonly teamName = signal('');
  protected readonly loading = signal(false);
  protected readonly error = signal<string | null>(null);

  private readonly router = inject(Router);

  protected async onSubmit() {
    if (!this.name() || !this.email() || !this.password()) {
      this.error.set('Please fill in all fields');
      return;
    }

    if (this.password().length < 8) {
      this.error.set('Password must be at least 8 characters');
      return;
    }

    if (this.teamAction() === 'join' && !this.inviteCode()) {
      this.error.set('Please enter an invite code');
      return;
    }

    if (this.teamAction() === 'create' && !this.teamName()) {
      this.error.set('Please enter a team name');
      return;
    }

    this.loading.set(true);
    this.error.set(null);

    try {
      const body: Record<string, string> = {
        name: this.name(),
        email: this.email(),
        password: this.password(),
      };

      if (this.teamAction() === 'join') {
        body['inviteCode'] = this.inviteCode().toUpperCase();
      } else {
        body['teamName'] = this.teamName();
      }

      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      const data = await res.json();

      if (!res.ok) {
        this.error.set(data.message || 'Registration failed');
        return;
      }

      localStorage.setItem('kudos-token', data.token);
      await this.router.navigate(['/feed']);
    } catch {
      this.error.set('Connection error. Please try again.');
    } finally {
      this.loading.set(false);
    }
  }
}
