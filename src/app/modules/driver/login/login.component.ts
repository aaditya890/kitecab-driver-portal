import { Component, signal } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../../shared/services/auth.service';
@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent {
 
  step = signal<'phone' | 'otp'>('phone');
  loading = signal(false);
  error = signal('');
  info = signal('');

  phoneForm: FormGroup;
  otpForm: FormGroup;

  constructor(private fb: FormBuilder, private auth: AuthService) {
    this.phoneForm = this.fb.group({
      phone: ['', [Validators.required, Validators.pattern(/^\+91[0-9]{10}$/)]],
    });

    this.otpForm = this.fb.group({
      otp: ['', [Validators.required, Validators.minLength(6), Validators.maxLength(6)]],
    });
  }

  changeNumber() {
    this.step.set('phone');
    this.error.set('');
    this.info.set('');
  }

  async sendOtp() {
    this.error.set('');
    this.info.set('');

    if (this.phoneForm.invalid) {
      this.error.set('Enter a valid number (+91XXXXXXXXXX)');
      return;
    }

    this.loading.set(true);

    try {
      await this.auth.sendOtp(this.phoneForm.value.phone);
      this.info.set('OTP sent successfully.');
      this.step.set('otp');
    } catch (err: any) {
      console.error(err);
      this.error.set(err.message || 'Failed to send OTP');
    } finally {
      this.loading.set(false);
    }
  }

  async verifyOtp() {
    this.error.set('');
    this.loading.set(true);

    if (this.otpForm.invalid) {
      this.error.set('Enter 6 digit OTP');
      this.loading.set(false);
      return;
    }

    try {
      await this.auth.verifyOtp(this.otpForm.value.otp);
      this.info.set('Login successful!');
    } catch (err: any) {
      console.error(err);
      this.error.set(err.message || 'Invalid OTP');
    } finally {
      this.loading.set(false);
    }
  }
}
