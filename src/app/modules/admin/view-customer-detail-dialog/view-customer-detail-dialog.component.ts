import { Component, inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButton, MatButtonModule } from "@angular/material/button";

@Component({
  selector: 'app-view-customer-detail-dialog',
  standalone: true,
  imports: [MatDialogModule, MatButton,MatButtonModule],
  templateUrl: './view-customer-detail-dialog.component.html',
  styleUrl: './view-customer-detail-dialog.component.scss'
})
export class ViewCustomerDetailDialogComponent {
  dialogRef = inject(MatDialogRef<ViewCustomerDetailDialogComponent>);
  data = inject(MAT_DIALOG_DATA);

  close() {
    this.dialogRef.close();
  }

  callNow(phone: string) {
  if (!phone) return;

  const formatted = phone.startsWith('+')
    ? phone
    : `+91${phone}`;

  window.location.href = `tel:${formatted}`;
}

formatDate(dateValue: any): string {
  if (!dateValue) return '-';

  const d = new Date(dateValue);

  return d.toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  });
}

formatTime(timeValue: any): string {
  if (!timeValue) return '-';

  // If time already like "18:30" or Date
  const d = new Date(`1970-01-01T${timeValue}`);

  return d.toLocaleTimeString('en-IN', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  });
}




}
