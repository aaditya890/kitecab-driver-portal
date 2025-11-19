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

  private recaptchaVerifier?: RecaptchaVerifier;
  private confirmation?: ConfirmationResult;

  constructor(private driverService: DriverService) {}

  /** SEND OTP */
  async sendOtp(phone: string): Promise<void> {

    if (!this.recaptchaVerifier) {
      this.recaptchaVerifier = new RecaptchaVerifier(
        firebaseAuth,             // ✔ FIRST PARAM = AUTH
        'recaptcha-container',    // ✔ SECOND = DIV ID
        {
          size: 'invisible'       // ✔ invisible captcha
        }
      );
    }

    this.confirmation = await signInWithPhoneNumber(
      firebaseAuth,
      phone,
      this.recaptchaVerifier
    );
  }

  /** VERIFY OTP */
  async verifyOtp(code: string) {
    if (!this.confirmation) throw new Error('Send OTP first');

    const result = await this.confirmation.confirm(code);
    const fbUser = result.user;

    // Firestore driver create/get
    return await this.driverService.ensureDriverOnLogin(fbUser);
  }

}
