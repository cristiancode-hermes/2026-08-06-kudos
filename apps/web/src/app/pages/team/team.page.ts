import { Component, signal, effect, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AvatarComponent } from '../../components/avatar/avatar.component';

interface TeamData {
  team: {
    id: string;
    name: string;
    inviteCode: string;
    adminId: string;
    createdAt: string;
  };
  members: Array<{
    id: string;
    name: string;
    email: string;
    avatarUrl: string | null;
    role: 'member' | 'admin';
  }>;
}

@Component({
  selector: 'app-team-page',
  standalone: true,
  imports: [FormsModule, AvatarComponent],
  template: `
    <div class="max-w-3xl mx-auto px-4 sm:px-6 py-8">
      <h1 class="text-2xl font-bold text-gray-900 dark:text-white mb-6">Team</h1>

      @if (loading()) {
        <div class="animate-pulse space-y-6">
          <div class="h-24 bg-gray-100 dark:bg-gray-800 rounded-2xl"></div>
          <div class="h-64 bg-gray-100 dark:bg-gray-800 rounded-2xl"></div>
        </div>
      } @else if (data(); as d) {
        <!-- Team info -->
        <div class="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6 mb-6">
          <div class="flex items-center justify-between mb-4">
            <div>
              <h2 class="text-xl font-bold text-gray-900 dark:text-white">{{ d.team.name }}</h2>
              <p class="text-sm text-gray-500 dark:text-gray-400 mt-1">{{ d.members.length }} members</p>
            </div>
            @if (isAdmin()) {
              <button
                (click)="editingName.set(true)"
                class="text-sm text-indigo-600 dark:text-indigo-400 hover:underline"
              >
                Edit
              </button>
            }
          </div>

          <!-- Edit team name -->
          @if (editingName()) {
            <div class="flex gap-2 mt-3">
              <input
                type="text"
                [(ngModel)]="newTeamName"
                name="newTeamName"
                class="flex-1 px-3 py-1.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none"
                placeholder="New team name"
              />
              <button
                (click)="updateTeamName()"
                class="px-4 py-1.5 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700"
              >
                Save
              </button>
              <button
                (click)="editingName.set(false)"
                class="px-4 py-1.5 text-sm text-gray-500 hover:text-gray-700"
              >
                Cancel
              </button>
            </div>
          }

          <!-- Invite code -->
          <div class="mt-5 p-4 bg-gray-50 dark:bg-gray-900/50 rounded-xl border border-gray-200 dark:border-gray-700">
            <p class="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Invite Code</p>
            <div class="flex items-center gap-2">
              <code class="flex-1 px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg text-lg font-bold tracking-widest text-indigo-600 dark:text-indigo-400 text-center select-all">
                {{ d.team.inviteCode }}
              </code>
              <button
                (click)="copyInviteCode()"
                class="px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition-colors whitespace-nowrap"
              >
                {{ copied() ? 'Copied!' : 'Copy' }}
              </button>
              @if (isAdmin()) {
                <button
                  (click)="regenerateCode()"
                  class="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                  title="Regenerate code"
                >
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/>
                  </svg>
                </button>
              }
            </div>
          </div>
        </div>

        <!-- Members -->
        <div class="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6">
          <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">Members</h3>
          <div class="space-y-2">
            @for (member of d.members; track member.id) {
              <div class="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                <app-avatar [src]="member.avatarUrl" [name]="member.name" size="md" />
                <div class="flex-1 min-w-0">
                  <p class="text-sm font-medium text-gray-900 dark:text-white truncate">{{ member.name }}</p>
                  <p class="text-xs text-gray-500 dark:text-gray-400 truncate">{{ member.email }}</p>
                </div>
                @if (member.role === 'admin') {
                  <span class="px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300">
                    Admin
                  </span>
                }
                @if (isAdmin() && member.id !== currentUserId()) {
                  <button
                    (click)="removeMember(member.id)"
                    class="text-xs text-red-500 hover:text-red-700 font-medium"
                  >
                    Remove
                  </button>
                }
              </div>
            }
          </div>
        </div>

        <!-- Error -->
        @if (error()) {
          <div class="mt-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg px-4 py-3 text-sm text-red-700 dark:text-red-300">
            {{ error() }}
          </div>
        }
      }
    </div>
  `,
})
export class TeamPage {
  protected readonly data = signal<TeamData | null>(null);
  protected readonly loading = signal(true);
  protected readonly isAdmin = signal(false);
  protected readonly currentUserId = signal('');
  protected readonly editingName = signal(false);
  protected readonly newTeamName = signal('');
  protected readonly copied = signal(false);
  protected readonly error = signal<string | null>(null);

  constructor() {
    effect(() => { this.loadTeam(); }, { allowSignalWrites: true });
  }

  private token(): string | null {
    return localStorage.getItem('kudos-token');
  }

  private async loadTeam() {
    this.loading.set(true);
    try {
      // Get current user info
      const meRes = await fetch('/api/auth/me', {
        headers: { Authorization: `Bearer ${this.token()}` },
      });
      if (meRes.ok) {
        const me = await meRes.json();
        this.currentUserId.set(me.user.id);
        this.isAdmin.set(me.user.role === 'admin');
      }

      const res = await fetch('/api/team', {
        headers: { Authorization: `Bearer ${this.token()}` },
      });
      if (res.ok) {
        const data: TeamData = await res.json();
        this.data.set(data);
      }
    } catch (err) {
      console.error('Failed to load team', err);
    } finally {
      this.loading.set(false);
    }
  }

  protected async copyInviteCode() {
    const code = this.data()?.team.inviteCode;
    if (code) {
      try {
        await navigator.clipboard.writeText(code);
        this.copied.set(true);
        setTimeout(() => this.copied.set(false), 2000);
      } catch {
        // Fallback
        this.copied.set(true);
        setTimeout(() => this.copied.set(false), 2000);
      }
    }
  }

  protected async regenerateCode() {
    try {
      const res = await fetch('/api/team/regenerate-code', {
        method: 'POST',
        headers: { Authorization: `Bearer ${this.token()}` },
      });
      if (res.ok) {
        const data = await res.json();
        this.data.update(d => d ? { ...d, team: { ...d.team, inviteCode: data.inviteCode } } : d);
      }
    } catch {
      this.error.set('Failed to regenerate code');
    }
  }

  protected async updateTeamName() {
    if (!this.newTeamName().trim()) return;
    try {
      const res = await fetch('/api/team', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.token()}`,
        },
        body: JSON.stringify({ name: this.newTeamName().trim() }),
      });
      if (res.ok) {
        const data = await res.json();
        this.data.update(d => d ? { ...d, team: { ...d.team, name: data.name } } : d);
        this.editingName.set(false);
      }
    } catch {
      this.error.set('Failed to update team name');
    }
  }

  protected async removeMember(memberId: string) {
    if (!confirm('Remove this member from the team?')) return;
    try {
      const res = await fetch(`/api/team/members/${memberId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${this.token()}` },
      });
      if (res.ok) {
        this.data.update(d => d ? { ...d, members: d.members.filter(m => m.id !== memberId) } : d);
      } else {
        const data = await res.json();
        this.error.set(data.message || 'Failed to remove member');
      }
    } catch {
      this.error.set('Failed to remove member');
    }
  }
}
