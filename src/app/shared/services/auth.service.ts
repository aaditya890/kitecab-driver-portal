import { Injectable } from '@angular/core';
import {
  signInWithPhoneNumber,
  RecaptchaVerifier,
  ConfirmationResult,
  UserCredential
} from 'firebase/auth';

import { firebaseAuth } from '../../firebase.config';

@Injectable({ providedIn: 'root' })
export class AuthService {

  private recaptcha!: RecaptchaVerifier;
  private confirmation!: ConfirmationResult;

  constructor() {}

  // SEND OTP
  async sendOtp(phone: string) {
    this.recaptcha = new RecaptchaVerifier(
      firebaseAuth,
      'recaptcha-container',
      { size: 'invisible' }
    );

    this.confirmation = await signInWithPhoneNumber(
      firebaseAuth,
      phone,
      this.recaptcha
    );
  }

  // VERIFY OTP
  async verifyOtp(code: string) {
    return await this.confirmation.confirm(code);
  }

}
