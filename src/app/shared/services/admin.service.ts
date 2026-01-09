import { Injectable, inject } from '@angular/core';
import {
  Firestore,
  collection,
  getDocs,
  query,
  where
} from '@angular/fire/firestore';
import { Admin } from '../interfaces/admin.interface';

@Injectable({
  providedIn: 'root'
})
export class AdminService {

  private fs = inject(Firestore);

  async login(email: string, password: string): Promise<Admin | null> {
    console.log('LOGIN INPUT:', email, password);

    // ⚠️ collection name = "admin" (as in Firestore)
    const adminRef = collection(this.fs, 'admin');

    const q = query(
      adminRef,
      where('email', '==', email),
      where('active', '==', true)
    );

    const snap = await getDocs(q);

    console.log('SNAP EMPTY:', snap.empty);

    if (snap.empty) {
      return null;
    }

    const admin = snap.docs[0].data() as Admin;

    console.log('DB PASSWORD:', admin.password);

    // normal password match
    if (admin.password !== password) {
      return null;
    }

    return admin;
  }
}
