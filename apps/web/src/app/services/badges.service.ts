import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Badge {
  id: string;
  name: string;
  description: string;
  iconUrl: string;
  category: string;
  requirement: string;
}

export interface UserBadge {
  id: string;
  badge: Badge;
  earnedAt: string;
}

@Injectable({ providedIn: 'root' })
export class BadgesService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = '/api/badges';

  getAll(): Observable<Badge[]> {
    return this.http.get<Badge[]>(this.apiUrl);
  }

  getMyBadges(): Observable<UserBadge[]> {
    return this.http.get<UserBadge[]>(`${this.apiUrl}/mine`);
  }

  getUserBadges(userId: string): Observable<UserBadge[]> {
    return this.http.get<UserBadge[]>(`${this.apiUrl}/user/${userId}`);
  }
}
