import { Injectable, signal } from '@angular/core';
import {
  RecaptchaVerifier,
  signInWithPhoneNumber,
  ConfirmationResult,
  onAuthStateChanged,
  User as FirebaseUser,
  signOut,
} from 'firebase/auth';

import { firebaseAuth } from '../../firebase.config';
import { DriverService } from './driver.service';
import { Driver } from '../interfaces/driver.interface';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  driver = signal<Driver | null>(null);

  private confirmation: ConfirmationResult | null = null;
  private recaptchaVerifier: RecaptchaVerifier | null = null;

  constructor(private driverService: DriverService) {

    onAuthStateChanged(firebaseAuth, async (user) => {
      if (!user) {
        this.driver.set(null);
        return;
      }

      const d = await this.driverService.ensureDriverOnLogin(user);
      this.driver.set(d);
    });

  }

  // SEND OTP
  async sendOtp(phone: string): Promise<void> {

    if (!this.recaptchaVerifier) {
      this.recaptchaVerifier = new RecaptchaVerifier(
        firebaseAuth,
        'recaptcha-container',
        { size: 'invisible' }
      );
    }

    this.confirmation = await signInWithPhoneNumber(
      firebaseAuth,
      phone,
      this.recaptchaVerifier
    );

    (window as any).confirmation = this.confirmation;
  }

  // VERIFY OTP
  async verifyOtp(code: string): Promise<Driver> {

    if (!this.confirmation) {
      this.confirmation = (window as any).confirmation;
      if (!this.confirmation) throw new Error("OTP expired. Try again.");
    }

    const result = await this.confirmation.confirm(code);
    const fbUser = result.user as FirebaseUser;

    const driver = await this.driverService.ensureDriverOnLogin(fbUser);
    this.driver.set(driver);

    return driver;
  }

  async logout(): Promise<void> {
    await signOut(firebaseAuth);
    this.driver.set(null);
  }

  get currentDriver(): Driver | null {
    return this.driver();
  }
}
