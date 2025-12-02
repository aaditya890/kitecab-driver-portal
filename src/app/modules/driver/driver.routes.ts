import { Routes } from '@angular/router';

import { LoginComponent } from './login/login.component';
import { ProfileComponent } from './profile/profile.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { SetLocationComponent } from './set-location/set-location.component';
import { BookingsComponent } from './bookings/bookings.component';
import { BookingDetailsComponent } from './booking-details/booking-details.component';
import { driverGuard } from '../../shared/guards/driver.guard';
import { approvedDriverGuard } from '../../shared/guards/approved-driver.guard';
import { APP_ROUTES } from '../../routes.constant';



export const driverRoutes: Routes = [

  { path: APP_ROUTES.DRIVER.LOGIN, component: LoginComponent },
  {
    path: APP_ROUTES.DRIVER.SIGNUP,
    loadComponent: () =>
      import('./signup/signup.component').then(m => m.SignupComponent)
  },
  {
    path: APP_ROUTES.DRIVER.PROFILE,
    component: ProfileComponent,
    canActivate: [driverGuard]
  },


  {
    path: APP_ROUTES.DRIVER.DASHBOARD,
    component: DashboardComponent,
    canActivate: [driverGuard, approvedDriverGuard]
  },


  {
    path: APP_ROUTES.DRIVER.SET_LOCATION,
    component: SetLocationComponent,
    canActivate: [driverGuard, approvedDriverGuard]
  },


  {
    path: APP_ROUTES.DRIVER.BOOKINGS,
    component: BookingsComponent,
    canActivate: [driverGuard, approvedDriverGuard]
  },


  {
    path: APP_ROUTES.DRIVER.BOOKING_DETAILS,
    component: BookingDetailsComponent,
    canActivate: [driverGuard, approvedDriverGuard]
  }
];
