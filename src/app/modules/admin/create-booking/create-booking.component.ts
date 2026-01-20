import { Component, inject } from '@angular/core';
import { FormBuilder, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { BookingService } from '../../../shared/services/booking.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { Booking } from '../../../shared/interfaces/booking.interface';
import { APP_ROUTES } from '../../../routes.constant';

type RideType = 'oneway' | 'roundtrip' | 'localrental';
type CabType = 'hatchback' | 'sedan' | 'suv';
type Inclusion = 'included' | 'excluded';

@Component({
  selector: 'app-create-booking',
  standalone: true,
  imports: [ReactiveFormsModule, FormsModule],
  templateUrl: './create-booking.component.html',
  styleUrl: './create-booking.component.scss'
})
export class CreateBookingComponent {
  private fb = inject(FormBuilder)
  private bookingService = inject(BookingService)
  private snackbar = inject(MatSnackBar)
  private router = inject(Router)

  loading = false

  form = this.fb.group({
    bookingCode: ["", Validators.required],
    pickup: ["", Validators.required],
    drop: ["", Validators.required],
    address: ["", Validators.required],

    rideType: ["oneway" as RideType, Validators.required],
    cabType: ["sedan" as CabType, Validators.required],

    date: [null, Validators.required],
    time: ["", Validators.required],

    baseDriverIncome: ["", [Validators.required, Validators.min(1)]],
    baseCommission: ["", [Validators.required, Validators.min(0)]],

    toll: ["included" as Inclusion, Validators.required],
    parking: ["excluded" as Inclusion, Validators.required],
  })

  get getBookingCodeError() {
    return this.form.get("bookingCode")?.invalid && this.form.get("bookingCode")?.touched
  }

  get getPickupError() {
    return this.form.get("pickup")?.invalid && this.form.get("pickup")?.touched
  }

  get getDropError() {
    return this.form.get("drop")?.invalid && this.form.get("drop")?.touched
  }

  get getAddressError() {
    return this.form.get("address")?.invalid && this.form.get("address")?.touched
  }

  get getRideTypeError() {
    return this.form.get("rideType")?.invalid && this.form.get("rideType")?.touched
  }

  get getCabTypeError() {
    return this.form.get("cabType")?.invalid && this.form.get("cabType")?.touched
  }

  get getDateError() {
    return this.form.get("date")?.invalid && this.form.get("date")?.touched
  }

  get getTimeError() {
    return this.form.get("time")?.invalid && this.form.get("time")?.touched
  }

  get getDriverIncomeError() {
    return this.form.get("baseDriverIncome")?.invalid && this.form.get("baseDriverIncome")?.touched
  }

  get getCommissionError() {
    return this.form.get("baseCommission")?.invalid && this.form.get("baseCommission")?.touched
  }

  async submit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched()
      return
    }

    this.loading = true
    const v = this.form.value

    const rawCode = v.bookingCode!.trim()
    const bookingCode = rawCode.startsWith("#") ? rawCode : `#${rawCode}`

    const booking: Booking = {
      bookingCode,
      pickup: v.pickup!,
      drop: v.drop!,
      address: v.address!,
      rideType: v.rideType!,
      cabType: v.cabType!,
      date: this.formatDate(v.date!),
      time: this.formatTimeTo12Hour(v.time!),
      baseDriverIncome: Number(v.baseDriverIncome),
      baseCommission: Number(v.baseCommission),
      inclusions: {
        toll: v.toll!,
        parking: v.parking!,
      },
      status: "active",
      createdAt: new Date(),
    }

    try {
      await this.bookingService.createBooking(booking)
      this.snackbar.open("Booking created successfully", "OK", { duration: 2500 })
      this.router.navigate(["/admin/dashboard"])
    } catch {
      this.snackbar.open("Failed to create booking", "OK", { duration: 2500 })
    }

    this.loading = false
  }

  private formatDate(date: any): string {
    const d = new Date(date)
    return d.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    })
  }

  private formatTimeTo12Hour(time: string): string {
    const [h, m] = time.split(":").map(Number)
    const ampm = h >= 12 ? "PM" : "AM"
    const hour = h % 12 || 12
    return `${hour}:${m.toString().padStart(2, "0")} ${ampm}`
  }

  
goToDashboard() {
  this.router.navigate([
    APP_ROUTES.ADMIN.BASE,
    APP_ROUTES.ADMIN.DASHBOARD
  ]);
}
}