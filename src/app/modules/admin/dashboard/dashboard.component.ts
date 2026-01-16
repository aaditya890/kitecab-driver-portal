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

      this.showSnack(`✓ Bid accepted & booking assigned to ${driverName}`, "success")

      await this.loadBidsTab()
      await this.loadAssignedBookings()

      this.activeTab = "assigned"
    } catch (err) {
      this.showSnack("Error accepting bid", "error")
    }

    this.acceptingBidId = null
  }

  setTab(tab: AdminTab) {
    this.activeTab = tab
  }

  goToCreateBooking() {
    this.router.navigate([APP_ROUTES.ADMIN.BASE, APP_ROUTES.ADMIN.BOOKING_LIST])
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

  async uploadCustomerPdf(booking: Booking) {
    const input = document.createElement("input")
    input.type = "file"
    input.accept = "application/pdf"

    input.onchange = async () => {
      const file = input.files?.[0]
      if (!file) return

      const pdfUrl = await this.cloudinary.uploadFile(file)
      await this.bookingService.assignDriverWithPdf(booking.id!, booking.selectedDriverId!, pdfUrl)
      this.snackBar.open("✓ PDF uploaded", "success")
      await this.loadAssignedBookings()
    }

    input.click()
  }

  async removeCustomerPdf(booking: Booking) {
    await this.bookingService.assignDriverWithPdf(booking.id!, booking.selectedDriverId!, "")
    this.snackBar.open("✓ PDF removed", "success")
    await this.loadAssignedBookings()
  }

  showSnack(message: string, type: "success" | "error" | "info" = "info") {
    const bgColor = type === "success" ? "bg-green-600" : type === "error" ? "bg-red-600" : "bg-blue-600"
    this.snackBar.open(message, "✕", {
      duration: 3000,
      horizontalPosition: "center",
      verticalPosition: "bottom",
      panelClass: [bgColor],
    })
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

  async deleteBooking(booking: Booking) {
    const confirmed = await this.showConfirmDialog(
      "Delete Booking",
      `Delete booking ${booking.bookingCode}?\n\nRoute: ${booking.pickup} → ${booking.drop}\n\nThis action cannot be undone.`,
    )

    if (!confirmed) return

    try {
      await this.bookingService.deleteBooking(booking.id!)
      this.showSnack(`✓ Booking ${booking.bookingCode} deleted`, "success")
      await this.loadAdminBookings()
    } catch (err) {
      this.showSnack("Error deleting booking", "error")
    }
  }

  private showConfirmDialog(title: string, message: string): Promise<boolean> {
    return new Promise((resolve) => {
      const confirmed = confirm(`${title}\n\n${message}`)
      resolve(confirmed)
    })
  }

  editBooking(booking: Booking) {
    this.router.navigate([APP_ROUTES.ADMIN.BASE, APP_ROUTES.ADMIN.BOOKING_LIST, booking.id])
  }
}
