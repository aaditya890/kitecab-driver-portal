import { Component } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../../shared/services/auth.service';
@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent {
  
  step: 'phone' | 'otp' = 'phone';

  phoneForm = this.fb.group({
    phone: ['', [Validators.required]]
  });

  otpForm = this.fb.group({
    otp: ['', [Validators.required, Validators.minLength(6)]]
  });

  constructor(private fb: FormBuilder, private auth: AuthService) {}

  async sendOtp() {
    const phone = this.phoneForm.value.phone!;
    await this.auth.sendOtp(phone);
    this.step = 'otp';
  }

  async verifyOtp() {
    const otp = this.otpForm.value.otp!;
    const result = await this.auth.verifyOtp(otp);
    console.log("LOGGED IN!", result.user);
  }
}
