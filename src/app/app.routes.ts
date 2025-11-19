import { Routes } from '@angular/router';

export const routes: Routes = [
    {
        path: 'driver',
        loadChildren: () =>
            import('./modules/driver/driver.routes').then(m => m.driverRoutes)
    },
    {
        path: 'admin',
        loadChildren: () =>
            import('./modules/admin/admin.routes').then(m => m.adminRoutes)
    },
    {
        path:'',
        pathMatch:'full',
        redirectTo: 'driver/login'
    }
];
