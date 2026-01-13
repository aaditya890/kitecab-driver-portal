import { Injectable, inject } from '@angular/core';
import {
  Firestore,
  collection,
  getDocs,
  query,
  where
} from '@angular/fire/firestore';
import { Admin } from '../interfaces/admin.interface';

const ADMIN_SESSION_KEY = 'admin_session';

@Injectable({
  providedIn: 'root'
})
export class AdminService {

  private fs = inject(Firestore);

  /* ================= LOGIN ================= */
  async login(email: string, password: string): Promise<Admin | null> {

    const adminRef = collection(this.fs, 'admin'); // 🔥 same as before

    const q = query(
      adminRef,
      where('email', '==', email),
      where('active', '==', true)
    );

    const snap = await getDocs(q);

    if (snap.empty) {
      return null;
    }

    const admin = snap.docs[0].data() as Admin;

    // ❌ wrong password
    if (admin.password !== password) {
      return null;
    }

    // ✅ STORE SESSION (password remove)
    const safeAdmin: Admin = {
      email: admin.email,
      active: admin.active,
      name: admin.name,
      password: '', // never store password
    };

    localStorage.setItem(ADMIN_SESSION_KEY, JSON.stringify(safeAdmin));

    return safeAdmin;
  }

  /* ================= SESSION HELPERS ================= */

  getLoggedInAdmin(): Admin | null {
    const raw = localStorage.getItem(ADMIN_SESSION_KEY);
    if (!raw) return null;

    try {
      return JSON.parse(raw) as Admin;
    } catch {
      return null;
    }
  }

  isAdminLoggedIn(): boolean {
    return !!this.getLoggedInAdmin();
  }

  logout() {
    localStorage.removeItem(ADMIN_SESSION_KEY);
  }
}
