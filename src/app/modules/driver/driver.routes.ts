import { Routes } from '@angular/router';

import { LoginComponent } from './login/login.component';
import { ProfileComponent } from './profile/profile.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { SetLocationComponent } from './set-location/set-location.component';
import { BookingsComponent } from './bookings/bookings.component';
import { BookingDetailsComponent } from './booking-details/booking-details.component';
import { driverGuard } from '../../shared/guards/driver.guard';
import { approvedDriverGuard } from '../../shared/guards/approved-driver.guard';


export const driverRoutes: Routes = [

  // LOGIN (no guard)
  { path: 'login', component: LoginComponent },

  // PROFILE SETUP (driver must login)
  {
    path: 'profile',
    component: ProfileComponent,
    canActivate: [driverGuard]
  },

  // DASHBOARD
  {
    path: 'dashboard',
    component: DashboardComponent,
    canActivate: [driverGuard, approvedDriverGuard]
  },

  // DRIVER SET LOCATION
  {
    path: 'set-location',
    component: SetLocationComponent,
    canActivate: [driverGuard, approvedDriverGuard]
  },

  // ACTIVE BOOKINGS
  {
    path: 'bookings',
    component: BookingsComponent,
    canActivate: [driverGuard, approvedDriverGuard]
  },

  // BOOKING DETAILS
  {
    path: 'booking/:id',
    component: BookingDetailsComponent,
    canActivate: [driverGuard, approvedDriverGuard]
  }

];
