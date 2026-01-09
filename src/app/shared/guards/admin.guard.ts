import { CanActivateFn } from '@angular/router';

export const adminGuard: CanActivateFn = () => {
  const admin = localStorage.getItem('admin');
  return !!admin;
};
