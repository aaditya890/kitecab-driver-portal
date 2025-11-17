import { CanActivateFn } from '@angular/router';

export const driverGuard: CanActivateFn = (route, state) => {
  return true;
};
