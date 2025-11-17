import { CanActivateFn } from '@angular/router';

export const approvedDriverGuard: CanActivateFn = (route, state) => {
  return true;
};
