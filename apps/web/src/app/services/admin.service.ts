import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface AdminStats {
  totalUsers: number;
  totalKudos: number;
  totalBadges: number;
  activeToday: number;
  kudosThisMonth: number;
}

export interface SystemLog {
  id: string;
  action: string;
  userId: string;
  userName: string;
  timestamp: string;
  details: string;
}

@Injectable({ providedIn: 'root' })
export class AdminService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = '/api/admin';

  getStats(): Observable<AdminStats> {
    return this.http.get<AdminStats>(`${this.apiUrl}/stats`);
  }

  getLogs(): Observable<SystemLog[]> {
    return this.http.get<SystemLog[]>(`${this.apiUrl}/logs`);
  }

  resetKudos(userId: string): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/reset-kudos`, { userId });
  }

  disableUser(userId: string): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/users/${userId}/disable`, {});
  }

  enableUser(userId: string): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/users/${userId}/enable`, {});
  }
}
