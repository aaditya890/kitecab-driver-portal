import { Component, inject, OnInit } from "@angular/core"
import { FormBuilder, Validators, ReactiveFormsModule, FormsModule } from "@angular/forms"
import { Router, RouterLink } from "@angular/router"
import { NgClass } from "@angular/common"
import { DriverService } from "../../../shared/services/driver.service"
import { APP_ROUTES } from "../../../routes.constant"

declare global {
  interface Window {
    sendOtp?: any
    verifyOtp?: any
    retryOtp?: any
  }
}

@Component({
  selector: "app-login",
  standalone: true,
  imports: [ReactiveFormsModule, FormsModule, NgClass],
  templateUrl: "./login.component.html",
  styleUrls: ["./login.component.scss"],
})
export class LoginComponent implements OnInit {
  fb = inject(FormBuilder)
  router = inject(Router)
  driverService = inject(DriverService)
  APP_ROUTES = APP_ROUTES;
  loading = false
  error: string | null = null
  currentStep = 1
  phoneNumber = ""
  resendTimer = 0
  requestId: string | undefined

  form = this.fb.group({
    phone: ["", [Validators.required, Validators.pattern(/^[6-9]\d{9}$/)]],
    otp: ["", [Validators.minLength(4), Validators.maxLength(4)]],
  })

  ngOnInit() {
    const driver = localStorage.getItem("driver")
    if (driver) {
      this.router.navigate([APP_ROUTES.DRIVER.BASE, APP_ROUTES.DRIVER.DASHBOARD]);
    }
  }

  async sendOtp() {
    if (!this.form.get("phone")?.valid) {
      this.error = "Enter a valid 10-digit phone number"
      return;
    }

    this.error = null
    this.loading = true

    this.phoneNumber = this.form.value.phone!
    const phone = "91" + this.phoneNumber

    const exists = await this.driverService.driverExists(phone)

    if (!exists) {
      this.loading = false
      this.error = "User not registered. Create your account first..."
      return
    }

    window.sendOtp?.(
      phone,
      (data: any) => {
        this.loading = false
        this.currentStep = 2
        this.requestId = data?.requestId
        this.startResendTimer()
      },
      () => {
        this.loading = false
        this.error = "Failed to send OTP"
      }
    )
  }

  verifyOtp() {
    if (!this.form.get("otp")?.valid) {
      this.error = "Enter valid OTP"
      return
    }

    this.error = null
    this.loading = true

    window.verifyOtp?.(
      this.form.value.otp!,
      async () => {
        const phone = "91" + this.form.value.phone!
        const driver = await this.driverService.getDriver(phone)

        localStorage.setItem("driver", JSON.stringify(driver))

        this.loading = false

        if (driver?.status === "approved") {
          this.router.navigate([APP_ROUTES.DRIVER.BASE, APP_ROUTES.DRIVER.DASHBOARD]);
        } else {
          this.router.navigate([APP_ROUTES.DRIVER.BASE, APP_ROUTES.DRIVER.PROFILE]);
        }
      },
      () => {
        this.loading = false
        this.error = "Invalid OTP"
      },
      this.requestId
    )
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

  goToDriverSignup(){
    this.router.navigate([APP_ROUTES.DRIVER.BASE, APP_ROUTES.DRIVER.SIGNUP]);
  }
}
