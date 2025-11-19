import { Injectable } from '@angular/core';
import {
  doc,
  getDoc,
  setDoc,
} from 'firebase/firestore';

import { firebaseDb } from '../../firebase.config';
import { User as FirebaseUser } from 'firebase/auth';
import { Driver } from '../interfaces/driver.interface';

@Injectable({
  providedIn: 'root'
})
export class DriverService {

  constructor() { }

  // RUN ON EVERY LOGIN
  async ensureDriverOnLogin(user: FirebaseUser): Promise<Driver> {
    const ref = doc(firebaseDb, 'drivers', user.uid);

    const snap = await getDoc(ref);

    // IF DRIVER ALREADY EXISTS
    if (snap.exists()) {
      return snap.data() as Driver;
    }

    // CREATE NEW DRIVER (First time login)
    const newDriver: Driver = {
      id: user.uid,
      name: '',
      phone: user.phoneNumber || '',
      address: '',
      city: '',
      cabType: 'hatchback',
      vehicleNumber: '',
      vehicleModel: '',
      idProofUrl: '',
      idProofType: '',
      currentCity: '',
      onlineStatus: false,
      status: 'pending',          // Admin approve karega
      createdAt: new Date()
    };

    // STORE IN FIRESTORE
    await setDoc(ref, newDriver);

    return newDriver;
  }
}
