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
import { NgClass } from '@angular/common';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [ReactiveFormsModule,NgClass],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss'
})
export class DashboardComponent {
  loadingDashboard:boolean = true;
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

  
async ngOnInit() {
  const raw = localStorage.getItem('driver');
  if (!raw) {
    this.router.navigate([APP_ROUTES.DRIVER.LOGIN]);
    return;
  }

  const cached = JSON.parse(raw);

  // 🔴 ALWAYS FETCH FRESH DRIVER FROM DB
  const freshDriver = await this.driverService.getDriver(cached.phone);

  if (!freshDriver) {
    this.logout();
    return;
  }

  this.driver = freshDriver;

  // 🔄 update local cache
  localStorage.setItem('driver', JSON.stringify(freshDriver));

  this.refreshBookings();
}


async refreshBookings() {
  this.loadingDashboard = true;   // 🔴 START LOADING

  try {
    // 🔹 fetch everything FIRST
    const [dashboard, myBids] = await Promise.all([
      this.bookingService.getDashboardData(this.driver.phone),
      this.bidService.getMyBids(this.driver.phone),
    ]);

    // 🔹 prepare accepted bookings
    const accepted: Array<{ booking: Booking; bid: Bid }> = [];

    for (const booking of dashboard.mine) {
      const acceptedBid = myBids.find(
        b => b.bookingId === booking.id && b.status === 'accepted'
      );
      if (acceptedBid) {
        accepted.push({ booking, bid: acceptedBid });
      }
    }

    // 🔹 prepare bids with booking
    const bidsWithBooking: Array<{ bid: Bid; booking: Booking | null }> = [];

    for (const bid of myBids) {
      const booking = await this.bookingService.getBookingById(bid.bookingId);
      bidsWithBooking.push({ bid, booking });
    }

    // ✅ ATOMIC COMMIT (ONLY ONE UI UPDATE)
    this.openBookings = dashboard.open;
    this.myBids = myBids;
    this.myBidBookingIds = myBids.map(b => b.bookingId);
    this.myAcceptedBookings = accepted;
    this.myBidsWithBooking = bidsWithBooking;

  } catch (e) {
    console.error('Dashboard refresh error', e);
  } finally {
    this.loadingDashboard = false;  // 🟢 END LOADING
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

openCustomerPdf(url: string) {
  const previewUrl = url.replace(
    '/raw/upload/',
    '/raw/upload/fl_inline/'
  );
  window.open(previewUrl, '_blank');
}
}
