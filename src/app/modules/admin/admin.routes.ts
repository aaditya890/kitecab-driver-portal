import { Routes } from '@angular/router';
import { LoginComponent } from './login/login.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { CreateBookingComponent } from './create-booking/create-booking.component';
import { BookingListComponent } from './booking-list/booking-list.component';
import { BookingDetailsComponent } from './booking-details/booking-details.component';
import { adminGuard } from '../../shared/guards/admin.guard';


export const adminRoutes: Routes = [

  // LOGIN PAGE (no guard)
  { path: 'login', component: LoginComponent },

  // MAIN ADMIN DASHBOARD
  {
    path: 'dashboard',
    component: DashboardComponent,
    canActivate: [adminGuard]
  },

  // CREATE BOOKING
  {
    path: 'create-booking',
    component: CreateBookingComponent,
    canActivate: [adminGuard]
  },

  // BOOKING LIST
  {
    path: 'bookings',
    component: BookingListComponent,
    canActivate: [adminGuard]
  },

  // BOOKING DETAILS (bids list)
  {
    path: 'booking/:id',
    component: BookingDetailsComponent,
    canActivate: [adminGuard]
  }

];
