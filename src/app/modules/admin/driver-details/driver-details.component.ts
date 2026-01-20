import { Component, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { DriverService } from '../../../shared/services/driver.service';
import { Driver } from '../../../shared/interfaces/driver.interface';
import { MatSnackBar } from '@angular/material/snack-bar';
import { APP_ROUTES } from '../../../routes.constant';

@Component({
  selector: 'app-driver-details',
  standalone: true,
  imports: [],
  templateUrl: './driver-details.component.html',
  styleUrl: './driver-details.component.scss'
})
export class DriverDetailsComponent {


  private route = inject(ActivatedRoute);
  private driverService = inject(DriverService);
  private snackBar = inject(MatSnackBar);
  private router = inject(Router);

  driver: Driver | null = null;
  loading = true;

  private unsub?: () => void;

  ngOnInit(): void {
    const phone = this.route.snapshot.paramMap.get('id');
    if (!phone) return;

    // 🔥 realtime listener (NO refresh)
    this.unsub = this.driverService.listenToDriver(phone, (d) => {
      this.driver = d;
      this.loading = false;
    });
  }

  ngOnDestroy(): void {
    if (this.unsub) this.unsub();
  }

  goBack() {
    this.router.navigate([
      APP_ROUTES.ADMIN.BASE,
      APP_ROUTES.ADMIN.DRIVERS
    ]);
  }

  formatDate(value: any): string {
    if (!value) return '-';

    const d = value.toDate ? value.toDate() : new Date(value);

    return d.toLocaleString('en-IN', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  }

  async deactivateDriver() {
    if (!this.driver) return;

    const ok = confirm('Deactivate this driver?');
    if (!ok) return;

    await this.driverService.updateOnlineStatus(this.driver.phone, false);
    await this.driverService.updateDriverStatus(this.driver.phone, 'blocked');

    this.snackBar.open('Driver deactivated', 'OK', { duration: 2000 });
  }

  async deleteDriver() {
    if (!this.driver) return;

    const ok = confirm('Are you sure you want to DELETE this driver?');
    if (!ok) return;

    await this.driverService.deleteDriver(this.driver.phone);

    this.snackBar.open('Driver deleted', 'OK', { duration: 2000 });

    this.goBack();
  }

  editDriver() {
    alert('Edit driver coming soon');
  }

  async activateDriver() {
    if (!this.driver) return;

    const ok = confirm('Activate this driver?');
    if (!ok) return;

    await this.driverService.updateDriverStatus(this.driver.phone, 'approved');
    await this.driverService.updateOnlineStatus(this.driver.phone, true);

    this.snackBar.open('Driver activated', 'OK', { duration: 2000 });
  }

  openIdProof(url: string) {
    const previewUrl = url.replace(
      '/raw/upload/',
      '/raw/upload/fl_inline/'
    );
    window.open(previewUrl, '_blank');
  }


}
