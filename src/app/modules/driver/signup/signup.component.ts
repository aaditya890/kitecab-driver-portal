import { Component, inject, OnInit } from '@angular/core';
import { FormBuilder, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { DriverService } from '../../../shared/services/driver.service';
import { CloudinaryService } from '../../../shared/services/cloudinary.service';
import { Driver } from '../../../shared/interfaces/driver.interface';
import { NgClass } from '@angular/common';

@Component({
  selector: 'app-signup',
  standalone: true,
  imports: [ReactiveFormsModule, FormsModule,RouterLink,NgClass],
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.scss'],
})
export class SignupComponent {
 
  fb = inject(FormBuilder)
  router = inject(Router)
  cloud = inject(CloudinaryService)
  driverService = inject(DriverService)

  loading = false
  error: string | null = null
  otpSent = false
  otpVerified = false
  requestId: string | undefined
  idFile: File | null = null
  resendTimer = 0
  currentStep = 1
  phoneNumber = ""

  form = this.fb.group({
    phone: ["", [Validators.required, Validators.pattern(/^[6-9]\d{9}$/)]],
    otp: ["", [Validators.minLength(4), Validators.maxLength(4)]],
    name: [{ value: "", disabled: true }, Validators.required],
    address: [{ value: "", disabled: true }, Validators.required],
    city: [{ value: "", disabled: true }, Validators.required],
    cabType: [{ value: "", disabled: true }, Validators.required],
    vehicleNumber: [{ value: "", disabled: true }, Validators.required],
    vehicleModel: [{ value: "", disabled: true }, Validators.required],
    idProofType: [{ value: "", disabled: true }, Validators.required],
  })

  ngOnInit() {
    const driver = localStorage.getItem("driver");
    if (driver) {
      this.router.navigate(["/driver/dashboard"]);
    }
  }

  async sendOtp() {
    if (!this.form.get("phone")?.valid) {
      this.error = "❌ Enter a valid phone number"
      return
    }

    this.error = null
    this.loading = true

    this.phoneNumber = this.form.value.phone!
    const phone = "91" + this.phoneNumber

    // Already registered?
    const exists = await this.driverService.driverExists(phone)

    if (exists) {
      this.loading = false
      this.error = "Already registered. Please login."
      return
    }

    window.sendOtp?.(
      phone,
      (data: any) => {
        this.loading = false
        this.otpSent = true
        this.currentStep = 2
        this.requestId = data?.requestId
        this.startResendTimer()
      },
      () => {
        this.loading = false
        this.error = "❌ OTP sending failed"
      }
    )
  }

  verifyOtp() {
    if (!this.form.get("otp")?.valid) {
      this.error = "❌ Enter valid OTP"
      return
    }

    this.error = null
    this.loading = true

    window.verifyOtp?.(
      this.form.value.otp!,
      () => {
        this.loading = false
        this.otpVerified = true
        this.currentStep = 3

        Object.keys(this.form.controls).forEach(key => {
          if (key !== "phone" && key !== "otp") {
            this.form.get(key)?.enable()
          }
        })
      },
      () => {
        this.loading = false
        this.error = "❌ Invalid OTP"
      },
      this.requestId
    )
  }

  onFileSelect(e: any) {
    const file = e.target.files[0]
    if (file && file.size <= 5 * 1024 * 1024) {
      this.idFile = file
      this.error = null
    } else {
      this.error = "❌ File must be under 5MB"
    }
  }

  async submit() {
    if (!this.form.valid || !this.idFile) {
      this.error = "❌ Complete all fields"
      return
    }

    this.error = null
    this.loading = true

    try {
      const raw = this.form.getRawValue()
      const phone = "91" + raw.phone

      const idUrl = await this.cloud.uploadFile(this.idFile)

      const driver: Driver = {
        id: phone,
        name: raw.name!,
        phone,
        address: raw.address!,
        city: raw.city!,
        currentCity: raw.city!,
        cabType: raw.cabType! as any,
        vehicleNumber: raw.vehicleNumber!,
        vehicleModel: raw.vehicleModel!,
        idProofUrl: idUrl,
        idProofType: raw.idProofType! as any,
        onlineStatus: false,
        status: "approved",
        createdAt: new Date(),
      }

      await this.driverService.createDriver(driver)

      localStorage.setItem("driver", JSON.stringify(driver))

      this.loading = false
      this.router.navigate(["/driver/dashboard"])

    } catch {
      this.loading = false
      this.error = "❌ Registration failed"
    }
  }

  changePhone() {
    this.currentStep = 1
    this.form.get("otp")?.reset()
    this.resendTimer = 0
  }

  private startResendTimer() {
    this.resendTimer = 30
    const interval = setInterval(() => {
      this.resendTimer--
      if (this.resendTimer <= 0) clearInterval(interval)
    }, 1000)
  }
}