import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface TrendPoint {
  date: string;
  value: number;
}

export interface TrendReport {
  label: string;
  data: TrendPoint[];
  change: number;
  direction: 'up' | 'down' | 'flat';
}

@Injectable({ providedIn: 'root' })
export class TrendsService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = '/api/trends';

  getKudosTrends(period: '7d' | '30d' | '90d' = '30d'): Observable<TrendReport> {
    return this.http.get<TrendReport>(`${this.apiUrl}/kudos`, {
      params: { period },
    });
  }

  getEngagementTrends(period: '7d' | '30d' | '90d' = '30d'): Observable<TrendReport> {
    return this.http.get<TrendReport>(`${this.apiUrl}/engagement`, {
      params: { period },
    });
  }

  getDepartmentTrends(period: '7d' | '30d' | '90d' = '30d'): Observable<TrendReport[]> {
    return this.http.get<TrendReport[]>(`${this.apiUrl}/departments`, {
      params: { period },
    });
  }
}
