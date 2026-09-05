import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', redirectTo: '/feed', pathMatch: 'full' },
  { path: 'login', loadComponent: () => import('./pages/login/login.page').then(m => m.LoginPage) },
  { path: 'register', loadComponent: () => import('./pages/register/register.page').then(m => m.RegisterPage) },
  { path: 'feed', loadComponent: () => import('./pages/feed/feed.page').then(m => m.FeedPage) },
  { path: 'send', loadComponent: () => import('./pages/send/send.page').then(m => m.SendPage) },
  { path: 'profile', loadComponent: () => import('./pages/profile/profile.page').then(m => m.ProfilePage) },
  { path: 'leaderboard', loadComponent: () => import('./pages/leaderboard/leaderboard.page').then(m => m.LeaderboardPage) },
  { path: 'badges', loadComponent: () => import('./pages/badges/badges.page').then(m => m.BadgesPage) },
  { path: 'team', loadComponent: () => import('./pages/team/team.page').then(m => m.TeamPage) },
  { path: 'trends', loadComponent: () => import('./pages/trends/trends.page').then(m => m.TrendsPage) },
  { path: 'admin', loadComponent: () => import('./pages/admin/admin.page').then(m => m.AdminPage) },
];
