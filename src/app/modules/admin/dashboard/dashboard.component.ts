import { AfterViewInit, Component, inject, OnInit } from '@angular/core';
import { APP_ROUTES } from '../../../routes.constant';
import { FormBuilder, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AdminService } from '../../../shared/services/admin.service';
import { BidService } from '../../../shared/services/bid.service';
import { BookingService } from '../../../shared/services/booking.service';
import { Booking } from '../../../shared/interfaces/booking.interface';
import { Bid } from '../../../shared/interfaces/bid.interface';
import { Driver } from '../../../shared/interfaces/driver.interface';
import { DriverService } from '../../../shared/services/driver.service';
import { CloudinaryService } from '../../../shared/services/cloudinary.service';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { NgClass } from '@angular/common';
import { AddCustomerDetailDialogComponent } from '../add-customer-detail-dialog/add-customer-detail-dialog.component';

interface BookingWithBids {
  booking: Booking;
  bids: Bid[];
}

interface AssignedBooking {
  booking: Booking;
  bid: Bid;
  driver: Driver;
}
type AdminTab = 'bids' | 'assigned' | 'bookings';


@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [ReactiveFormsModule, FormsModule, MatDialogModule, NgClass],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss'
})
export class DashboardComponent implements OnInit, AfterViewInit {
  private router = inject(Router)
  private adminService = inject(AdminService)
  private driverService = inject(DriverService)
  private cloudinary = inject(CloudinaryService)
  private snackBar = inject(MatSnackBar)
  private dialog = inject(MatDialog)
  private bidService = inject(BidService)
  private bookingService = inject(BookingService)


  assignedBookings: AssignedBooking[] = []
  loadingAssigned = false
  driverMap = new Map<string, Driver>()

  loadingDashboard = true
  bookingBids: BookingWithBids[] = []
  adminBookings: Booking[] = []
  loadingBids = false
  loadingBookings = false
  acceptingBidId: string | null = null
  adminName = ""
  adminEmail = ""
  activeTab: AdminTab = "assigned"
  expandedBookingIds: Set<string> = new Set()

  ngOnInit(): void {
    const admin = this.adminService.getLoggedInAdmin()
    if (admin) {
      this.adminName = admin.name || "Admin"
      this.adminEmail = admin.email
    }
    this.loadingDashboard = false
    this.loadBidsTab()

  }

  ngAfterViewInit(): void {
    // Additional initialization if needed after the view is initialized
    this.loadAssignedBookings()
    this.loadAdminBookings()
  }


  async loadBidsTab() {
    this.loadingBids = true
    const bookings = await this.bookingService.getOpenBookings()
    const result: BookingWithBids[] = []

    for (const booking of bookings) {
      const bids = await this.bidService.getBidsByBookingId(booking.id!)

      for (const bid of bids) {
        if (!this.driverMap.has(bid.driverId)) {
          const d = await this.driverService.getDriver(bid.driverId)
          if (d) this.driverMap.set(bid.driverId, d)
        }
      }

      if (bids.length > 0) {
        result.push({ booking, bids })
      }
    }

    this.bookingBids = result
    this.loadingBids = false
  }

  async acceptBid(bid: Bid, booking: Booking) {
    if (!bid.id || !booking.id) return

    const driverName = this.driverMap.get(bid.driverId)?.name || bid.driverId
    const confirmed = await this.showConfirmDialog(
      `Assign Booking`,
      `Confirm assignment to ${driverName}?\n\nAmount: ₹${bid.driverBidIncome}`,
    )

    if (!confirmed) return

    this.acceptingBidId = bid.id

    try {
      await this.bidService.markBidAccepted(bid.id)
      await this.bidService.closeOtherBidsOfBooking(booking.id, bid.id)
      await this.bookingService.assignDriverWithPdf(booking.id, bid.driverId, "")

      this.snackBar.open(`✓ Bid accepted & booking assigned to ${driverName}`, "Ok", {
        duration: 3000
      })

      await this.loadBidsTab()
      await this.loadAssignedBookings()

      this.activeTab = "assigned"
    } catch (err) {
      this.snackBar.open("Error accepting bid", "error")
    }

    this.acceptingBidId = null
  }

  setTab(tab: AdminTab) {
    this.activeTab = tab
  }

  goToCreateBooking() {
    this.router.navigate([APP_ROUTES.ADMIN.BASE, APP_ROUTES.ADMIN.CREATE_BOOKING])
  }

  goToDrivers() {
    this.router.navigate([APP_ROUTES.ADMIN.BASE, APP_ROUTES.ADMIN.DRIVERS])
  }

  logout() {
    this.adminService.logout()
    this.router.navigate([APP_ROUTES.ADMIN.BASE, APP_ROUTES.ADMIN.LOGIN])
  }

  async loadAssignedBookings() {
    this.loadingAssigned = true
    const bookings = await this.bookingService.getAssignedBookings()
    const result: AssignedBooking[] = []

    for (const booking of bookings) {
      if (!booking.selectedDriverId) continue
      const bids = await this.bidService.getBidsByBookingId(booking.id!)
      const acceptedBid = bids.find((b) => b.status === "accepted")
      if (!acceptedBid) continue

      const driver = await this.driverService.getDriver(booking.selectedDriverId)
      if (!driver) continue

      result.push({ booking, bid: acceptedBid, driver })
    }

    this.assignedBookings = result
    this.loadingAssigned = false
  }

  // async uploadCustomerPdf(booking: Booking) {
  //   const input = document.createElement("input")
  //   input.type = "file"
  //   input.accept = "application/pdf"

  //   input.onchange = async () => {
  //     const file = input.files?.[0]
  //     if (!file) return

  //     const pdfUrl = await this.cloudinary.uploadFile(file)
  //     await this.bookingService.assignDriverWithPdf(booking.id!, booking.selectedDriverId!, pdfUrl)
  //     this.snackBar.open("✓ PDF uploaded", "Close", {
  //       duration: 3000
  //     })
  //     await this.loadAssignedBookings()
  //   }

  //   input.click()
  // }

  // async removeCustomerPdf(booking: Booking) {
  //   await this.bookingService.assignDriverWithPdf(booking.id!, booking.selectedDriverId!, "")
  //   this.snackBar.open("✓ PDF removed", "Close", {
  //     duration: 3000
  //   })
  //   await this.loadAssignedBookings()
  // }


openAddCustomerDetails(booking: Booking) {
  // 🔥 remove focus from button
  (document.activeElement as HTMLElement)?.blur();

  const dialogRef = this.dialog.open(AddCustomerDetailDialogComponent, {
    width: '95%',
    maxWidth: '420px',
    autoFocus: true,          // 👈 important
    restoreFocus: true,       // 👈 important
    data: {
      booking,
      mode: 'add'
    }
  });

  dialogRef.afterClosed().subscribe(async (details) => {
    if (!details) return;

    await this.bookingService.updateBooking(booking.id!, {
      customerDetails: {
        ...details,
        isHidden: false
      }
    });

    this.snackBar.open("✓ Customer details added", "Close", {
      duration: 3000
    });

     await this.loadAssignedBookings();
      await this.loadAdminBookings();
  });
}


  openEditCustomerDetails(booking: Booking) {
    if (!booking.customerDetails) return;

    const dialogRef = this.dialog.open(AddCustomerDetailDialogComponent, {
      width: '95%',
      maxWidth: '420px',
      data: {
        booking,
        mode: 'edit'
      }
    });

    dialogRef.afterClosed().subscribe(async (details) => {
      if (!details) return;

      await this.bookingService.updateBooking(booking.id!, {
        customerDetails: {
          ...details,
          isHidden: false
        }
      });

      this.snackBar.open("✓ Customer details updated", "Close", {
        duration: 3000
      });

      await this.loadAssignedBookings();
      await this.loadAdminBookings();
    });
  }


  async hideCustomerDetails(booking: Booking) {
    if (!booking.id || !booking.customerDetails) return;

    await this.bookingService.updateBooking(booking.id, {
      customerDetails: {
        ...booking.customerDetails,
        isHidden: true
      }
    });

    // 🔥 IMPORTANT: local state update
    booking.customerDetails.isHidden = true;

    this.snackBar.open("Customer details hidden", "OK", {
      duration: 2000
    });

    await this.loadAssignedBookings();
  }


  async showCustomerDetails(booking: Booking) {
    if (!booking.id || !booking.customerDetails) return;

    await this.bookingService.updateBooking(booking.id, {
      customerDetails: {
        ...booking.customerDetails,
        isHidden: false
      }
    });

    // 🔥 IMPORTANT: local state update
    booking.customerDetails.isHidden = false;

    this.snackBar.open("Customer details visible", "OK", {
      duration: 2000
    });

    await this.loadAssignedBookings();
  }


  async deleteBooking(booking: Booking) {
    const confirmed = await this.showConfirmDialog(
      "Delete Booking",
      `Delete booking ${booking.bookingCode}?\n\nAll related bids will also be removed.\n\nThis action cannot be undone.`
    );

    if (!confirmed) return;

    try {
      await this.bookingService.deleteBookingWithBids(booking.id!);

      this.snackBar.open(
        `✓ Booking ${booking.bookingCode} & bids deleted`,
        "Close",
        { duration: 3000 }
      );

      // 🔥 Refresh everything
      await this.loadAdminBookings();
      await this.loadAssignedBookings();
      await this.loadBidsTab();

    } catch (err) {
      this.snackBar.open("Error deleting booking", "Close");
    }
  }

  toggleBooking(bookingId: string | undefined) {
    if (!bookingId) return
    if (this.expandedBookingIds.has(bookingId)) {
      this.expandedBookingIds.delete(bookingId)
    } else {
      this.expandedBookingIds.add(bookingId)
    }
  }

  isBookingExpanded(bookingId: string | undefined): boolean {
    return bookingId ? this.expandedBookingIds.has(bookingId) : false
  }

  async loadAdminBookings() {
    this.loadingBookings = true
    this.adminBookings = await this.bookingService.getAllBookings()
    this.loadingBookings = false
  }

  private showConfirmDialog(title: string, message: string): Promise<boolean> {
    return new Promise((resolve) => {
      const confirmed = confirm(`${title}\n\n${message}`)
      resolve(confirmed)
    })
  }

  editBooking(booking: Booking) {
    if (!booking.id) return;

    this.router.navigateByUrl(
      `/${APP_ROUTES.ADMIN.BASE}/${APP_ROUTES.ADMIN.BOOKING_EDIT_ID(booking.id)}`
    );
  }




}
