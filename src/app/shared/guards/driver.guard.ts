import { CanActivateFn } from '@angular/router';

export const driverGuard: CanActivateFn = () => {
  const driver = localStorage.getItem("driver");
  return !!driver;  // true = allow, false = block
};
