import { Component, input, computed } from '@angular/core';

@Component({
  selector: 'app-avatar',
  standalone: true,
  template: `
    @if (src()) {
      <img
        [src]="src()"
        [alt]="name()"
        class="rounded-full object-cover"
        [class]="sizeClass()"
        (error)="onError()"
      />
    } @else {
      <div
        class="rounded-full flex items-center justify-center font-semibold text-white"
        [class]="sizeClass()"
        [style.background-color]="bgColor()"
      >
        {{ initials() }}
      </div>
    }
  `,
})
export class AvatarComponent {
  readonly src = input<string | null>(null);
  readonly name = input<string>('');
  readonly size = input<'sm' | 'md' | 'lg' | 'xl'>('md');

  protected readonly sizeClass = computed(() => {
    const map = { sm: 'w-8 h-8 text-xs', md: 'w-10 h-10 text-sm', lg: 'w-14 h-14 text-lg', xl: 'w-20 h-20 text-2xl' };
    return map[this.size()] || map.md;
  });

  protected readonly initials = computed(() => {
    const name = this.name();
    if (!name) return '?';
    const parts = name.trim().split(/\s+/);
    if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
    return parts[0].slice(0, 2).toUpperCase();
  });

  protected readonly bgColor = computed(() => {
    const name = this.name();
    if (!name) return '#6366f1';
    const colors = [
      '#6366f1', '#8b5cf6', '#a855f7', '#d946ef', '#ec4899',
      '#f43f5e', '#ef4444', '#f97316', '#eab308', '#22c55e',
      '#14b8a6', '#06b6d4', '#3b82f6', '#2563eb', '#7c3aed',
    ];
    let hash = 0;
    for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
    return colors[Math.abs(hash) % colors.length];
  });

  private imgError = false;

  protected onError() {
    this.imgError = true;
  }
}
