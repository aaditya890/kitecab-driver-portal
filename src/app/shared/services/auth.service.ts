import { Injectable, signal } from '@angular/core';
import {
  RecaptchaVerifier,
  signInWithPhoneNumber,
  ConfirmationResult,
  User as FirebaseUser,
  onAuthStateChanged,
  signOut
} from 'firebase/auth';

import { firebaseAuth } from '../../firebase.config';
import { DriverService } from './driver.service';
import { Driver } from '../interfaces/driver.interface';
import { Firestore } from 'firebase/firestore';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  driver = signal<Driver | null>(null);

  private confirmation?: ConfirmationResult;
  private recaptchaVerifier?: RecaptchaVerifier;

  constructor(private driverService: DriverService,private db: Firestore) {

    // Track Firebase Auth state
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
    if (typeof window === 'undefined') return;

    // Create invisible Recaptcha only once
    if (!this.recaptchaVerifier) {
      this.recaptchaVerifier = new RecaptchaVerifier(
        firebaseAuth,
        'recaptcha-container',
        { size: 'invisible' }
      );
    }

    try {
      this.confirmation = await signInWithPhoneNumber(
        firebaseAuth,
        phone,
        this.recaptchaVerifier
      );
    } catch (e) {
      console.error(e);
      throw e;
    }
  }

  // VERIFY OTP
  async verifyOtp(code: string): Promise<Driver> {

    if (!this.confirmation) {
      throw new Error('Please send OTP first.');
    }

    try {
      const result = await this.confirmation.confirm(code);
      const fbUser = result.user as FirebaseUser;

      const driver = await this.driverService.ensureDriverOnLogin(fbUser);
      this.driver.set(driver);

      return driver;

    } catch (err: any) {
      console.error("OTP Verify Failed:", err);
      throw new Error("Invalid or expired OTP.");
    }
  }

  async logout(): Promise<void> {
    await signOut(firebaseAuth);
    this.driver.set(null);
  }

  get currentDriver(): Driver | null {
    return this.driver();
  }

}
