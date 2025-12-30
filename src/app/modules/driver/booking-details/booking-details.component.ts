import { Component, inject, OnInit } from "@angular/core";
import { CommonModule } from "@angular/common";
import { ActivatedRoute, Router } from "@angular/router";
import { FormBuilder, ReactiveFormsModule, Validators } from "@angular/forms";
import { BookingService } from "../../../shared/services/booking.service";
import { BidService } from "../../../shared/services/bid.service";
import { Booking } from "../../../shared/interfaces/booking.interface";
import { Driver } from "../../../shared/interfaces/driver.interface";
import { APP_ROUTES } from "../../../routes.constant";

@Component({
  selector: "app-booking-details",
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: "./booking-details.component.html",
})
export class BookingDetailsComponent implements OnInit {

  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private bookingService = inject(BookingService);
  private bidService = inject(BidService);
  private fb = inject(FormBuilder);
   // ✅ SAFE, TYPED KEYS
  inclusionKeys: Array<keyof Booking['inclusions']> = [
    'toll',
    'parking',
    'waiting'
  ];

  booking!: Booking;
  driver!: Driver;
  isSubmitting = false;

  bidForm = this.fb.group({
    driverIncome: [0, [Validators.required, Validators.min(1)]],
  });

  ngOnInit(): void {
    const raw = localStorage.getItem("driver");
    if (!raw) {
      this.router.navigate([APP_ROUTES.DRIVER.BASE, APP_ROUTES.DRIVER.LOGIN]);
      return;
    }

    this.driver = JSON.parse(raw);

    const id = this.route.snapshot.paramMap.get("id");
    if (id) this.loadBooking(id);
  }

  async loadBooking(id: string) {
    const data = await this.bookingService.getBookingById(id);
    if (!data) return;

    this.booking = data;

    this.bidForm.patchValue({
      driverIncome: data.baseDriverIncome,
    });
  }

  /* ================= CALCULATIONS ================= */

  get driverIncome(): number {
    return this.bidForm.value.driverIncome ?? this.booking.baseDriverIncome;
  }

  get totalAmount(): number {
    return this.booking.baseDriverIncome + this.booking.baseCommission;
  }

  get finalCommission(): number {
    return (
      this.booking.baseCommission +
      (this.booking.baseDriverIncome - this.driverIncome)
    );
  }

  get commissionUp(): boolean {
    return this.finalCommission > this.booking.baseCommission;
  }

  get commissionEmoji(): string {
    if (this.finalCommission > this.booking.baseCommission) return "😄";
    if (this.finalCommission < this.booking.baseCommission) return "😢";
    return "🙂";
  }

  /* ================= ACTIONS ================= */

  async submitBid() {
    if (!this.booking || !this.bidForm.valid) return;

    this.isSubmitting = true;
    try {
      await this.bidService.createBid(
        this.booking,
        this.driver.phone,
        this.driverIncome,
        this.driver.currentCity
      );

      this.router.navigate([
        APP_ROUTES.DRIVER.BASE,
        APP_ROUTES.DRIVER.DASHBOARD,
      ]);
    } catch (e) {
      console.error("Bid submit failed", e);
    } finally {
      this.isSubmitting = false;
    }
  }

  back() {
    this.router.navigate([
      APP_ROUTES.DRIVER.BASE,
      APP_ROUTES.DRIVER.DASHBOARD,
    ]);
  }
}
