import { Component, inject } from '@angular/core';
import { APP_ROUTES } from '../../../routes.constant';
import { Booking } from '../../../shared/interfaces/booking.interface';
import { ActivatedRoute, Router } from '@angular/router';
import { BookingService } from '../../../shared/services/booking.service';
import { BidService } from '../../../shared/services/bid.service';
import { FormBuilder, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Driver } from '../../../shared/interfaces/driver.interface';

@Component({
  selector: 'app-booking-details',
  standalone: true,
  imports: [ReactiveFormsModule, FormsModule],
  templateUrl: './booking-details.component.html',
  styleUrl: './booking-details.component.scss'
})

export class BookingDetailsComponent {
  private route = inject(ActivatedRoute)
  private router = inject(Router)
  private bookingService = inject(BookingService)
  private bidService = inject(BidService)
  private fb = inject(FormBuilder)

  booking: Booking | null = null
  driver!: Driver
  loading = false
  submitting = false
  error: string | null = null
  bidForm = this.fb.group({
    bidAmount: [0, [Validators.required, Validators.min(1)]],
  })

  ngOnInit(): void {
    const raw = localStorage.getItem("driver")
    if (!raw) {
      this.router.navigate([APP_ROUTES.DRIVER.BASE, APP_ROUTES.DRIVER.LOGIN])
      return
    }

    this.driver = JSON.parse(raw)
    const bookingId = this.route.snapshot.paramMap.get("id")

    if (bookingId) {
      this.loadBooking(bookingId)
    }
  }

  async loadBooking(bookingId: string): Promise<void> {
    this.loading = true
    try {
      const data = await this.bookingService.getBookingById(bookingId)
      this.booking = {
        id: bookingId,
        ...data,
      } as Booking
    } catch (err) {
      this.error = "Failed to load booking"
      console.error(err)
    } finally {
      this.loading = false
    }
  }

  async submitBid(): Promise<void> {
    if (!this.booking || !this.driver || this.bidForm.invalid) return

    this.submitting = true
    try {
      const bidAmount = this.bidForm.get("bidAmount")?.value || 0

      await this.bidService.createBid({
        bookingId: this.booking.id,
        driverId: this.driver.phone,
        bidAmount,
        commission: this.booking.commissionAmount,
        netAmount: bidAmount - this.booking.commissionAmount,
        driverCity: this.driver.currentCity,
        status: "pending",
        timestamp: new Date(),
      })
      
      this.router.navigate([APP_ROUTES.DRIVER.BASE, "dashboard"])
    } catch (err) {
      this.error = "Failed to submit bid"
      console.error(err)
    } finally {
      this.submitting = false
    }
  }

  goBack(): void {
    this.router.navigate([APP_ROUTES.DRIVER.BASE, "dashboard"])
  }

  get netAmount(): number {
    const bidAmount = this.bidForm.get("bidAmount")?.value || 0
    return bidAmount - (this.booking?.commissionAmount || 0)
  }
}
