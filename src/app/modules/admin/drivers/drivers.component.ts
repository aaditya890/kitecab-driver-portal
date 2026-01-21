import { Component, inject, OnInit } from '@angular/core';
import { AsyncPipe, CommonModule, NgClass } from '@angular/common';
import { MatChipsModule } from '@angular/material/chips';
import { DriverService } from '../../../shared/services/driver.service';
import { Router } from '@angular/router';
import { Driver } from '../../../shared/interfaces/driver.interface';
import { APP_ROUTES } from '../../../routes.constant';
import { Observable, BehaviorSubject, combineLatest, map } from 'rxjs';
import { MatSnackBarModule } from '@angular/material/snack-bar';


type CabType = 'hatchback' | 'sedan' | 'suv' | null;
type StatusType = 'online' | 'offline' | null;

@Component({
selector: 'app-drivers',
standalone: true,
imports: [MatSnackBarModule,MatChipsModule,CommonModule],
templateUrl: './drivers.component.html',
styleUrl: './drivers.component.scss'
})
export class DriversComponent {
 
  private driverService = inject(DriverService);
  private router = inject(Router);

  loading = true;
  openMenu: string | null = null;

  // Filter state
  selectedStatus$ = new BehaviorSubject<StatusType>(null);
  selectedCabType$ = new BehaviorSubject<CabType>(null);
  
  get selectedStatus(): StatusType {
    return this.selectedStatus$.value;
  }

  get selectedCabType(): CabType {
    return this.selectedCabType$.value;
  }

  // Filtered drivers observable
  filteredDrivers!: Observable<Driver[]>;

  ngOnInit() {
    const drivers$ = this.driverService.getDrivers();

    this.filteredDrivers = combineLatest([
      drivers$,
      this.selectedStatus$,
      this.selectedCabType$
    ]).pipe(
      map(([drivers, status, cabType]) => {
        return drivers.filter(driver => {
          const statusMatch = !status || 
            (status === 'online' ? driver.onlineStatus : !driver.onlineStatus);
          
          const cabTypeMatch = !cabType || driver.cabType === cabType;
          
          return statusMatch && cabTypeMatch;
        });
      })
    );

    // Set loading to false once we get data
    drivers$.subscribe(() => {
      this.loading = false;
    });
  }

  filterByStatus(status: StatusType) {
    this.selectedStatus$.next(status);
  }

  filterByCabType(cabType: CabType) {
    this.selectedCabType$.next(cabType);
  }

  toggleMenu(phone: string) {
    this.openMenu = this.openMenu === phone ? null : phone;
  }

  view(driver: Driver) {
    this.router.navigate([
      APP_ROUTES.ADMIN.BASE,
      APP_ROUTES.ADMIN.DRIVERS,
      driver.phone
    ]);
  }

  edit(driver: Driver) {
    alert("PAGE IN PROCESS")
    // this.router.navigate([
    //   APP_ROUTES.ADMIN.BASE,
    //   APP_ROUTES.ADMIN.DRIVER_DETAILS,
    //   driver.phone
    // ], { queryParams: { edit: true } });
  }

  delete(driver: Driver) {
    if (!confirm(`Delete driver ${driver.name}?`)) return;
    this.driverService.deleteDriver(driver.phone);
  }

  goToDashboard() {
    this.router.navigate([
      APP_ROUTES.ADMIN.BASE,
      APP_ROUTES.ADMIN.DASHBOARD
    ]);
  }

    closeMenu() {
    this.openMenu = null;
  }
}
