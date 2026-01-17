import { Routes } from '@angular/router';
import { LoginComponent } from './login/login.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { CreateBookingComponent } from './create-booking/create-booking.component';
import { BookingListComponent } from './booking-list/booking-list.component';
import { BookingDetailsComponent } from './booking-details/booking-details.component';
import { adminGuard } from '../../shared/guards/admin.guard';
import { APP_ROUTES } from '../../routes.constant';


export const adminRoutes: Routes = [

  {
    path: APP_ROUTES.ADMIN.LOGIN,
    loadComponent: () => import('./login/login.component').then(m => m.LoginComponent)
  },

  { 
    path: APP_ROUTES.ADMIN.DASHBOARD,
    loadComponent: () =>
      import('./dashboard/dashboard.component').then(m => m.DashboardComponent),
    canActivate: [adminGuard]
  },

  {
    path: APP_ROUTES.ADMIN.DRIVERS,
    loadComponent: () =>
      import('./drivers/drivers.component').then(m => m.DriversComponent),
    canActivate: [adminGuard]
  },

  {
    path: APP_ROUTES.ADMIN.DRIVER_DETAILS,
    loadComponent: () =>
      import('./driver-details/driver-details.component').then(m => m.DriverDetailsComponent),
    canActivate: [adminGuard]
  },
  {
    path: APP_ROUTES.ADMIN.CREATE_BOOKING,
    loadComponent: () =>
      import('./create-booking/create-booking.component').then(m => m.CreateBookingComponent),
    canActivate: [adminGuard]
  },
  {
    path: APP_ROUTES.ADMIN.BOOKING_LIST,
    loadComponent: () =>
      import('./booking-list/booking-list.component').then(m => m.BookingListComponent),
    canActivate: [adminGuard]
  },
  {
    path: APP_ROUTES.ADMIN.BOOKING_DETAILS,
    loadComponent: () =>
      import('./booking-details/booking-details.component').then(m => m.BookingDetailsComponent),
    canActivate: [adminGuard]
  }
];