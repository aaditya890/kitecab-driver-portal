import { Routes } from '@angular/router';
import { APP_ROUTES } from './routes.constant';


export const routes: Routes = [
    // DRIVER MODULE
  {
    path: APP_ROUTES.DRIVER.BASE,
    loadChildren: () =>
      import('./modules/driver/driver.routes').then(m => m.driverRoutes)
  },

  // ADMIN MODULE
  {
    path: APP_ROUTES.ADMIN.BASE,
    loadChildren: () =>
      import('./modules/admin/admin.routes').then(m => m.adminRoutes)
  },

  // DEFAULT ROUTE → DRIVER LOGIN
  // {
  //   path: '',
  //   redirectTo: `${APP_ROUTES.DRIVER.BASE}/${APP_ROUTES.DRIVER.LOGIN}`,
  //   pathMatch: 'full'
  // },

   {
    path: '',
    redirectTo: `${APP_ROUTES.DRIVER.BASE}/${APP_ROUTES.DRIVER.LOGIN}`,
    pathMatch: 'full'
  },

  // 404 fallback (optional)
  { path: '**', redirectTo: `${APP_ROUTES.DRIVER.BASE}/${APP_ROUTES.DRIVER.LOGIN}` }
];
