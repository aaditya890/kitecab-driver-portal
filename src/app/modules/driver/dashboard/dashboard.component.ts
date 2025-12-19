import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { APP_ROUTES } from '../../../routes.constant';
import { Driver } from '../../../shared/interfaces/driver.interface';
import { BookingService } from '../../../shared/services/booking.service';
import { Booking } from '../../../shared/interfaces/booking.interface';
import { ReactiveFormsModule } from '@angular/forms';
import { DriverService } from '../../../shared/services/driver.service';
import { BidService } from '../../../shared/services/bid.service';
import { Bid } from '../../../shared/interfaces/bid.interface';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss'
})
export class DashboardComponent {
 private router = inject(Router);
  private bookingService = inject(BookingService);
  private driverService = inject(DriverService);
  private bidService = inject(BidService);

  driver!: Driver;

  openBookings: Booking[] = [];
  myAcceptedBookings: Booking[] = [];

  // ✅ NEW
  myBids: Bid[] = [];
  myBidBookingIds: any[] = [];

  // ✅ TAB STATE
  activeTab: 'available' | 'bids' | 'accepted' = 'available';

  ngOnInit(): void {
    const raw = localStorage.getItem('driver');
    if (!raw) {
      this.router.navigate([APP_ROUTES.DRIVER.BASE, APP_ROUTES.DRIVER.LOGIN]);
      return;
    }

    this.driver = JSON.parse(raw);

    // ✅ CACHE (NO BLANK UI)
    const cached = sessionStorage.getItem('dashboard_cache');
    if (cached) {
      const parsed = JSON.parse(cached);
      this.openBookings = parsed.open || [];
      this.myAcceptedBookings = parsed.mine || [];
    }

    this.refreshBookings();
  }

  async refreshBookings() {
    try {
      const dashboard = await this.bookingService.getDashboardData(this.driver.phone);

      this.openBookings = dashboard.open;
      this.myAcceptedBookings = dashboard.mine;

      // ✅ LOAD MY BIDS
      this.myBids = await this.bidService.getMyBids(this.driver.phone);
      this.myBidBookingIds = this.myBids.map(b => b.bookingId);

      sessionStorage.setItem(
        'dashboard_cache',
        JSON.stringify(dashboard)
      );

    } catch (e) {
      console.error('Dashboard refresh error', e);
    }
  }

  async toggleOnline() {
    this.driver.onlineStatus = !this.driver.onlineStatus;
    localStorage.setItem('driver', JSON.stringify(this.driver));
    await this.driverService.updateOnlineStatus(
      this.driver.phone,
      this.driver.onlineStatus
    );
  }

  navigateToSetLocation() {
    this.router.navigate([
      APP_ROUTES.DRIVER.BASE,
      APP_ROUTES.DRIVER.SET_LOCATION
    ]);
  }

  navigateToBookingDetails(id: any) {
    if (!id) return;
    this.router.navigate([
      APP_ROUTES.DRIVER.BASE,
      'booking',
      id
    ]);
  }

  logout() {
    localStorage.removeItem('driver');
    this.router.navigate([
      APP_ROUTES.DRIVER.BASE,
      APP_ROUTES.DRIVER.LOGIN
    ]);
  }
}
