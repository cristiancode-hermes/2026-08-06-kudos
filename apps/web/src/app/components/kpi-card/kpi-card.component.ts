import { Component, input } from '@angular/core';

@Component({
  selector: 'app-kpi-card',
  standalone: true,
  template: `
    <div class="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5 shadow-sm">
      <p class="text-sm font-medium text-gray-500 dark:text-gray-400">{{ label() }}</p>
      <p class="text-3xl font-bold text-gray-900 dark:text-white mt-1">{{ value() }}</p>
      @if (trend(); as t) {
        <div class="flex items-center gap-1 mt-2">
          @if (t > 0) {
            <svg class="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 10l7-7m0 0l7 7m-7-7v18"/>
            </svg>
            <span class="text-sm font-medium text-green-600 dark:text-green-400">+{{ t }}%</span>
          } @else if (t < 0) {
            <svg class="w-4 h-4 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 14l-7 7m0 0l-7-7m7 7V3"/>
            </svg>
            <span class="text-sm font-medium text-red-600 dark:text-red-400">{{ t }}%</span>
          } @else {
            <span class="text-sm font-medium text-gray-500 dark:text-gray-400">0%</span>
          }
        </div>
      }
    </div>
  `,
})
export class KpiCardComponent {
  readonly label = input.required<string>();
  readonly value = input.required<string | number>();
  readonly trend = input<number | null>(null);
}
