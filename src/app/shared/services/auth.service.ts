import { Injectable } from '@angular/core';
import {
  signInWithPhoneNumber,
  RecaptchaVerifier,
  ConfirmationResult,
} from 'firebase/auth';

import { firebaseAuth } from '../../firebase.config';
import { DriverService } from './driver.service';

@Injectable({ providedIn: 'root' })
export class AuthService {

  private recaptchaVerifier?: RecaptchaVerifier;
  private confirmation?: ConfirmationResult;

  constructor(private driverService: DriverService) {}

  /** SEND OTP */
  async sendOtp(phone: string): Promise<void> {

    // Recaptcha create only once
    if (!this.recaptchaVerifier) {
       this.recaptchaVerifier = new RecaptchaVerifier(
      firebaseAuth,
      'recaptcha-container',
      {
        size: 'normal'
      }
    );
    }

    // Call Firebase OTP
    this.confirmation = await signInWithPhoneNumber(
      firebaseAuth,
      phone,
      this.recaptchaVerifier
    );
  }

  /** VERIFY OTP */
  async verifyOtp(code: string) {
    if (!this.confirmation) throw new Error('Send OTP first.');

    const result = await this.confirmation.confirm(code);
    const fbUser = result.user;

    // Driver fetch/create
    const driver = await this.driverService.ensureDriverOnLogin(fbUser);

    return driver;
  }
}
