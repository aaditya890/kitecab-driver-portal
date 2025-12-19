import { Component, inject } from '@angular/core';
import { APP_ROUTES } from '../../../routes.constant';
import { Router } from '@angular/router';
import { DriverService } from '../../../shared/services/driver.service';
import { Driver } from '../../../shared/interfaces/driver.interface';
import { FormBuilder, FormsModule, NgModel, ReactiveFormsModule, Validators } from '@angular/forms';

@Component({
  selector: 'app-set-location',
  standalone: true,
  imports: [ReactiveFormsModule,FormsModule],
  templateUrl: './set-location.component.html',
  styleUrl: './set-location.component.scss'
})
export class SetLocationComponent {
  private router = inject(Router)
  private driverService = inject(DriverService)
  private fb = inject(FormBuilder)

  driver!: Driver
  loading = false
  error: string | null = null

  form = this.fb.group({
    city: ["", Validators.required],
  })

  ngOnInit(): void {
    const raw = localStorage.getItem("driver")
    if (!raw) {
      this.router.navigate([APP_ROUTES.DRIVER.BASE, APP_ROUTES.DRIVER.LOGIN])
      return
    }

    this.driver = JSON.parse(raw)
    this.form.patchValue({ city: this.driver.currentCity || "" })
  }

  async updateCity(): Promise<void> {
    if (this.form.invalid) {
      this.error = "Please enter a city name"
      return
    }

    this.loading = true
    this.error = null

    try {
      const city = this.form.value.city!
      await this.driverService.updateCurrentCity(this.driver.phone, city)

      this.driver.currentCity = city
      localStorage.setItem("driver", JSON.stringify(this.driver))
      this.router.navigate([APP_ROUTES.DRIVER.BASE, APP_ROUTES.DRIVER.DASHBOARD])
    } catch (e) {
      this.error = "Failed to update city"
      console.error(e)
    } finally {
      this.loading = false
    }
  }

  backToDashboard(): void {
    this.router.navigate([APP_ROUTES.DRIVER.BASE, APP_ROUTES.DRIVER.DASHBOARD])
  }
}
