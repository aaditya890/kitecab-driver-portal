import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { APP_ROUTES } from '../../../routes.constant';
import { DriverService } from '../../../shared/services/driver.service';
import { Driver } from '../../../shared/interfaces/driver.interface';
import { FormBuilder, ReactiveFormsModule, FormsModule, Validators } from '@angular/forms';

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

  driver!: Driver;
  loading = false;
  error: string | null = null;

  routes: { from: string; to: string }[] = [];
  routeFrom = '';
  routeTo = '';

  cityForm = this.fb.group({
    city: ['', Validators.required],
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
      ? this.driver.availableRoutes
      : [];
  }

  async updateCity() {
    if (this.cityForm.invalid) {
      this.error = 'Please enter city';
      return;
    }

    this.loading = true;
    this.error = null;

    try {
      const city = this.cityForm.value.city!;
      await this.driverService.updateCurrentCity(this.driver.phone, city);

      this.driver.currentCity = city;
      localStorage.setItem('driver', JSON.stringify(this.driver));

      this.cityForm.reset();

      console.log('✅ City updated successfully:', city);
    } catch (e) {
      console.error(e);
      this.error = 'Failed to update city';
    } finally {
      this.loading = false;
    }
  }

  async addRoute() {
    if (!this.routeFrom || !this.routeTo) return;

    this.routes.push({ from: this.routeFrom, to: this.routeTo });

    this.routeFrom = '';
    this.routeTo = '';

    await this.driverService.updateAvailableRoutes(this.driver.phone, this.routes);

    this.driver.availableRoutes = this.routes;
    localStorage.setItem('driver', JSON.stringify(this.driver));

    console.log('✅ Route added:', this.routes[this.routes.length - 1]);
  }

  async removeRoute(index: number) {
    this.routes.splice(index, 1);

    await this.driverService.updateAvailableRoutes(this.driver.phone, this.routes);

    this.driver.availableRoutes = this.routes;
    localStorage.setItem('driver', JSON.stringify(this.driver));

    console.log('🗑 Route removed, remaining:', this.routes);
  }

  backToDashboard() {
    this.router.navigate([APP_ROUTES.DRIVER.BASE, APP_ROUTES.DRIVER.DASHBOARD]);
  }
}
