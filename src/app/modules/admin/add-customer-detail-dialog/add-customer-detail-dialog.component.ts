import { Component, inject } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';
import { Booking } from '../../../shared/interfaces/booking.interface';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-add-customer-detail-dialog',
  standalone: true,
  imports: [ReactiveFormsModule,FormsModule,MatDialogModule,MatButtonModule],
  templateUrl: './add-customer-detail-dialog.component.html',
  styleUrl: './add-customer-detail-dialog.component.scss'
})
export class AddCustomerDetailDialogComponent {

fb = inject(FormBuilder);
  dialogRef = inject(MatDialogRef<AddCustomerDetailDialogComponent>);
data = inject(MAT_DIALOG_DATA) as {
  booking: Booking;
  mode: 'add' | 'edit';
};

  form: FormGroup;

  // Custom validators
  private indianPhoneValidator = (control: AbstractControl): ValidationErrors | null => {
    if (!control.value) return null;
    
    const phone = control.value.toString().replace(/\D/g, '');
    
    if (phone.length === 10 && /^[6-9]/.test(phone)) {
      return null;
    }
    
    if (phone.length === 12 && phone.startsWith('91') && /^91[6-9]/.test(phone)) {
      return null;
    }
    
    return { invalidPhone: true };
  };

  constructor() {
    this.form = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(50)]],
      phone: ['', [Validators.required, this.indianPhoneValidator]],
      pickupAddress: ['', [Validators.required, Validators.minLength(5), Validators.maxLength(200)]],
      dropAddress: ['', [Validators.required, Validators.minLength(5), Validators.maxLength(200)]],
      date: ['', Validators.required],
      time: ['', Validators.required],
      note: ['', Validators.maxLength(500)]
    });

   // Prefill logic
if (this.data?.booking) {

  // EDIT MODE → customerDetails se bharna
  if (this.data.mode === 'edit' && this.data.booking.customerDetails) {
    const cd = this.data.booking.customerDetails;

    this.form.patchValue({
      name: cd.name,
      phone: cd.phone,
      pickupAddress: cd.pickupAddress,
      dropAddress: cd.dropAddress,
      date: cd.date,
      time: cd.time,
      note: cd.note || ''
    });

  } else {
    // ADD MODE → booking se default
    this.form.patchValue({
      pickupAddress: this.data.booking.pickup || '',
      dropAddress: this.data.booking.drop || '',
      date: this.data.booking.date || '',
      time: this.data.booking.time || ''
    });
  }
}

  }

  get nameError(): string {
    const control = this.form.get('name');
    if (control?.hasError('required')) return 'Name is required';
    if (control?.hasError('minlength')) return 'Name must be at least 2 characters';
    if (control?.hasError('maxlength')) return 'Name cannot exceed 50 characters';
    return '';
  }

  get phoneError(): string {
    const control = this.form.get('phone');
    if (control?.hasError('required')) return 'Phone number is required';
    if (control?.hasError('invalidPhone')) return 'Enter valid Indian phone number (10 digits with +91)';
    return '';
  }

  get pickupError(): string {
    const control = this.form.get('pickupAddress');
    if (control?.hasError('required')) return 'Pickup address is required';
    if (control?.hasError('minlength')) return 'Address must be at least 5 characters';
    if (control?.hasError('maxlength')) return 'Address cannot exceed 200 characters';
    return '';
  }

  get dropError(): string {
    const control = this.form.get('dropAddress');
    if (control?.hasError('required')) return 'Drop address is required';
    if (control?.hasError('minlength')) return 'Address must be at least 5 characters';
    if (control?.hasError('maxlength')) return 'Address cannot exceed 200 characters';
    return '';
  }

  get dateError(): string {
    const control = this.form.get('date');
    if (control?.hasError('required')) return 'Date is required';
    return '';
  }

  get timeError(): string {
    const control = this.form.get('time');
    if (control?.hasError('required')) return 'Time is required';
    return '';
  }

  formatPhoneForDisplay(): string {
    const phone = this.form.get('phone')?.value || '';
    const digits = phone.toString().replace(/\D/g, '');
    
    if (digits.length === 12 && digits.startsWith('91')) {
      return `+${digits.substring(0, 2)} ${digits.substring(2, 5)} ${digits.substring(5, 8)} ${digits.substring(8)}`;
    }
    
    if (digits.length === 10) {
      return `+91 ${digits.substring(0, 3)} ${digits.substring(3, 6)} ${digits.substring(6)}`;
    }
    
    return phone;
  }

 save() {
  if (this.form.invalid) return;

  const formValue = this.form.value;
  const phone = formValue.phone.toString().replace(/\D/g, '');
  const normalizedPhone = phone.length === 12 ? phone.substring(2) : phone;

  this.dialogRef.close({
    ...formValue,
    phone: normalizedPhone,
    isHidden: false,          // 🔥 important
    updatedAt: new Date(),
    addedAt:
      this.data.mode === 'edit'
        ? this.data.booking.customerDetails?.addedAt
        : new Date(),
    addedBy: 'KITECAB TAXI SERVICE'
  });
}


  close() {
    this.dialogRef.close(null);
  }
}
