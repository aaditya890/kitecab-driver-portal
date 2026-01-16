import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { APP_ROUTES } from '../../../routes.constant';
import { DriverService } from '../../../shared/services/driver.service';
import { Driver } from '../../../shared/interfaces/driver.interface';
import { FormBuilder, ReactiveFormsModule, FormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-set-location',
  standalone: true,
  imports: [ReactiveFormsModule, FormsModule],
  templateUrl: './set-location.component.html',
})
export class SetLocationComponent {
  private router = inject(Router);
  private driverService = inject(DriverService);
  private fb = inject(FormBuilder);
  private snackBar = inject(MatSnackBar);

  driver!: Driver;
  loading = false;
  error: string | null = null;

  routes: { from: string; to: string }[] = [];

  cityForm = this.fb.group({
    city: ['', Validators.required],
  });

  routeForm = this.fb.group({
    from: ['', Validators.required],
    to: ['', Validators.required],
  });

  ngOnInit(): void {
    const raw = localStorage.getItem('driver');
    if (!raw) {
      this.router.navigate([APP_ROUTES.DRIVER.BASE, APP_ROUTES.DRIVER.LOGIN]);
      return;
    }

    this.driver = JSON.parse(raw);
    this.cityForm.patchValue({
      city: this.driver.currentCity || ''
    });

    this.routes = Array.isArray(this.driver.availableRoutes)
      ? [...this.driver.availableRoutes]
      : [];

    console.log('✅ Routes loaded:', this.routes);
  }

  async updateCity() {
    if (this.cityForm.invalid) return

    this.loading = true
    this.error = null

    try {
      const city = this.cityForm.value.city!

      await this.driverService.updateCurrentCity(this.driver.phone, city)

      const freshDriver = await this.driverService.getDriver(this.driver.phone)

      if (freshDriver) {
        this.driver = freshDriver
        localStorage.setItem("driver", JSON.stringify(freshDriver))

        this.snackBar.open(`✓ Location updated to ${city}`, "Close", {
          duration: 3000,
        })

        setTimeout(() => {
          this.router.navigate([APP_ROUTES.DRIVER.BASE, APP_ROUTES.DRIVER.DASHBOARD])
        }, 1000)
      }
    } catch (err: any) {
      this.error = "Failed to update city. Please try again."
      this.snackBar.open(this.error, "Close", {
        duration: 5000,
        panelClass: ["error-snackbar"],
      })
    } finally {
      this.loading = false
    }
  }



  async addRoute() {
    if (this.routeForm.invalid) return

    const route = this.routeForm.value as { from: string; to: string }
    this.routes.push(route)
    this.routeForm.reset()

    try {
      await this.driverService.updateAvailableRoutes(this.driver.phone, this.routes)
      this.driver.availableRoutes = this.routes
      localStorage.setItem("driver", JSON.stringify(this.driver))

      this.snackBar.open("✓ Route added successfully", "Close", {
        duration: 2000,
        panelClass: ["success-snackbar"],
      })
    } catch (err) {
      this.error = "Failed to add route. Please try again."
    }
  }

  async removeRoute(index: number) {
    this.routes.splice(index, 1)

    try {
      await this.driverService.updateAvailableRoutes(this.driver.phone, this.routes)
      this.driver.availableRoutes = this.routes
      localStorage.setItem("driver", JSON.stringify(this.driver))

      this.snackBar.open("✓ Route removed", "Close", {
        duration: 2000,
        panelClass: ["success-snackbar"],
      })
    } catch (err) {
      this.error = "Failed to remove route. Please try again."
    }
  }

  backToDashboard() {
    this.router.navigate([APP_ROUTES.DRIVER.BASE, APP_ROUTES.DRIVER.DASHBOARD]);
  }

  
}
