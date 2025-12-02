import { CanActivateFn } from '@angular/router';

export const approvedDriverGuard: CanActivateFn = () => {
  const data = localStorage.getItem("driver");
  if (!data) return false;

  const driver = JSON.parse(data);

  return driver.status === "approved";
};
