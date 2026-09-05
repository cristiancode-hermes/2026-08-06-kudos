import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface TeamMember {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  department: string;
  role: string;
  kudosReceived: number;
}

export interface Team {
  id: string;
  name: string;
  description: string;
  memberCount: number;
}

@Injectable({ providedIn: 'root' })
export class TeamService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = '/api/team';

  getMembers(): Observable<TeamMember[]> {
    return this.http.get<TeamMember[]>(`${this.apiUrl}/members`);
  }

  getMember(id: string): Observable<TeamMember> {
    return this.http.get<TeamMember>(`${this.apiUrl}/members/${id}`);
  }
}
