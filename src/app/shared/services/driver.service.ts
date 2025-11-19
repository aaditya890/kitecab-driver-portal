import { Injectable } from '@angular/core';
import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  serverTimestamp,
  Firestore,
} from 'firebase/firestore';

import { firebaseDb } from '../../firebase.config';
import { Driver } from '../interfaces/driver.interface';
import { User as FirebaseUser } from 'firebase/auth';

@Injectable({
  providedIn: 'root'
})
export class DriverService {

  private collectionName = 'drivers';
constructor(private db: Firestore) {}
  // =======================================================
  // 🔍 GET EXISTING DRIVER BY UID
  // =======================================================
  async getDriverById(uid: string): Promise<Driver | null> {
    const ref = doc(firebaseDb, this.collectionName, uid);
    const snapshot = await getDoc(ref);

    if (!snapshot.exists()) return null;

    return {
      id: snapshot.id,
      ...snapshot.data()
    } as Driver;
  }

  // =======================================================
  // 🆕 CREATE DRIVER RECORD ON FIRST LOGIN
  // =======================================================
  async createDefaultDriver(fbUser: FirebaseUser): Promise<Driver> {
    const uid = fbUser.uid;
    const phone = fbUser.phoneNumber || '';

    const newDriver: Driver = {
      id: uid,
      name: '',
      phone,
      address: '',
      city: '',
      cabType: 'hatchback',
      vehicleNumber: '',
      vehicleModel: '',
      idProofUrl: '',
      idProofType: '',
      currentCity: '',
      onlineStatus: false,
      status: 'pending',
      createdAt: serverTimestamp(),
    };

    const ref = doc(firebaseDb, this.collectionName, uid);
    await setDoc(ref, newDriver);

    return newDriver;
  }

  // =======================================================
  // 🧠 ENSURE DRIVER EXISTS (Used during OTP login)
  // =======================================================
  async ensureDriverOnLogin(user: FirebaseUser): Promise<Driver> {

    const ref = doc(this.db, "drivers", user.uid);

    let snap = await getDoc(ref);

    // IF FIRST TIME LOGIN → CREATE DRIVER DOC
    if (!snap.exists()) {
      const newDriver: Driver = {
        id: user.uid,
        name: "",                           // empty initially
        phone: user.phoneNumber || "",
        address: "",
        city: "",
        cabType: "hatchback",
        vehicleNumber: "",
        vehicleModel: "",
        idProofUrl: "",
        currentCity: "",
        onlineStatus: false,
        status: "pending",
        createdAt: new Date()
      };

      await setDoc(ref, newDriver);
      snap = await getDoc(ref); // re-fetch after creation
    }

    return snap.data() as Driver;
  }



  // =======================================================
  // ✏ UPDATE DRIVER PROFILE
  // =======================================================
  async updateDriverProfile(uid: string, data: Partial<Driver>): Promise<void> {
    const ref = doc(firebaseDb, this.collectionName, uid);
    await updateDoc(ref, data as any);
  }

  // =======================================================
  // 🟢 Set Online/Offline
  // =======================================================
  async setOnlineStatus(uid: string, status: boolean): Promise<void> {
    const ref = doc(firebaseDb, this.collectionName, uid);
    await updateDoc(ref, { onlineStatus: status });
  }

  // =======================================================
  // 🟢 Update Driver City (Set current location)
  // =======================================================
  async updateCurrentCity(uid: string, city: string): Promise<void> {
    const ref = doc(firebaseDb, this.collectionName, uid);
    await updateDoc(ref, { currentCity: city });
  }
}
