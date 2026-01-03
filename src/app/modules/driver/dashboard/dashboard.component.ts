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
  myBidsWithBooking: Array<{
    bid: Bid;
    booking: Booking | null;
  }> = [];


  driver!: Driver;

  openBookings: Booking[] = [];
myAcceptedBookings: Array<{
  booking: Booking;
  bid: Bid;
}> = [];

  myBids: Bid[] = [];
  myBidBookingIds: string[] = [];

  activeTab: 'available' | 'bids' | 'accepted' = 'available';

  ngOnInit(): void {
    console.log(this.bookingService.getOpenBookings)
    const raw = localStorage.getItem('driver');
    if (!raw) {
      this.router.navigate([APP_ROUTES.DRIVER.BASE, APP_ROUTES.DRIVER.LOGIN]);
      return;
    }

    this.driver = JSON.parse(raw);

    // ⚡ Cache (instant UI)
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
    this.myAcceptedBookings = [];

    // 🔹 fetch bids ONCE
    const myBids = await this.bidService.getMyBids(this.driver.phone);

    for (const booking of dashboard.mine) {
      const acceptedBid = myBids.find(
        b => b.bookingId === booking.id && b.status === 'accepted'
      );

      if (acceptedBid) {
        this.myAcceptedBookings.push({
          booking,
          bid: acceptedBid
        });
      }
    }

    // 🔹 MY BIDS TAB
    this.myBids = myBids;
    this.myBidBookingIds = myBids.map(b => b.bookingId);

    this.myBidsWithBooking = [];
    for (const bid of myBids) {
      const booking = await this.bookingService.getBookingById(bid.bookingId);
      this.myBidsWithBooking.push({ bid, booking });
    }

    sessionStorage.setItem('dashboard_cache', JSON.stringify(dashboard));

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

  navigateToBookingDetails(id: string) {
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

 editBid(bid: Bid) {
  this.router.navigate(
    [
      APP_ROUTES.DRIVER.BASE,
      'booking',
      bid.bookingId
    ],
    {
      queryParams: {
        bidAmount: bid.driverBidIncome
      }
    }
  );
}

async deleteBid(bidId: string) {
  const ok = confirm('Are you sure you want to delete this bid?');
  if (!ok) return;

  await this.bidService.deleteBid(bidId);

  // ⚡ instant UX (optimistic)
  this.myBids = this.myBids.filter(b => b.id !== bidId);
  this.myBidBookingIds = this.myBids.map(b => b.bookingId);
  this.myBidsWithBooking = this.myBidsWithBooking.filter(
    x => x.bid.id !== bidId
  );

  // optional full refresh (safe)
  await this.refreshBookings();
}

}
