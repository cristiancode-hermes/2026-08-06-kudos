import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Kudos {
  id: string;
  fromUserId: string;
  fromUserName: string;
  toUserId: string;
  toUserName: string;
  message: string;
  value: number;
  createdAt: string;
}

export interface SendKudosRequest {
  toUserId: string;
  message: string;
  value: number;
}

@Injectable({ providedIn: 'root' })
export class KudosService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = '/api/kudos';

  getAll(): Observable<Kudos[]> {
    return this.http.get<Kudos[]>(this.apiUrl);
  }

  getReceived(): Observable<Kudos[]> {
    return this.http.get<Kudos[]>(`${this.apiUrl}/received`);
  }

  getSent(): Observable<Kudos[]> {
    return this.http.get<Kudos[]>(`${this.apiUrl}/sent`);
  }

  getById(id: string): Observable<Kudos> {
    return this.http.get<Kudos>(`${this.apiUrl}/${id}`);
  }

  send(data: SendKudosRequest): Observable<Kudos> {
    return this.http.post<Kudos>(this.apiUrl, data);
  }

  getMonthlyCount(): Observable<{ month: string; count: number }[]> {
    return this.http.get<{ month: string; count: number }[]>(`${this.apiUrl}/monthly-count`);
  }
}
