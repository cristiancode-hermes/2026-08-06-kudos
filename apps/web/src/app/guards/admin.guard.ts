import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

export const adminGuard: CanActivateFn = () => {
  const router = inject(Router);
  const role = localStorage.getItem('auth_role');

  if (role === 'admin') {
    return true;
  }

  return router.parseUrl('/dashboard');
};
