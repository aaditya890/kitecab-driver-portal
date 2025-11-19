import { Injectable } from '@angular/core';
import {
  RecaptchaVerifier,
  signInWithPhoneNumber,
  ConfirmationResult
} from 'firebase/auth';
import { firebaseAuth } from '../../firebase.config';
import { DriverService } from './driver.service';

@Injectable({ providedIn: 'root' })
export class AuthService {

  private recaptcha!: RecaptchaVerifier;
  private confirmation!: ConfirmationResult;

  constructor(private driverService: DriverService) {}

  /** SEND OTP */
 async sendOtp(phone: string): Promise<void> {

  if (!this.recaptcha) {
    this.recaptcha = new RecaptchaVerifier(
      firebaseAuth,
      'recaptcha-container',
      {
        size: 'invisible'
      }
    );
  }

  this.confirmation = await signInWithPhoneNumber(
    firebaseAuth,
    phone,
    this.recaptcha
  );
}


  /** VERIFY OTP */
  async verifyOtp(code: string) {
    const result = await this.confirmation.confirm(code);
    const fbUser = result.user;

    // Firestore ko background thread me chalao → no UI lag
    setTimeout(() => this.driverService.ensureDriverOnLogin(fbUser), 0);

    return fbUser;
  }
}
