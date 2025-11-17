export interface User {
  uid: string;                 // Firebase Auth uid
  role: 'admin' | 'driver';    // For guards & routing
  email?: string;              // Optional (admin ke liye mainly)
  phone?: string;              // Optional (driver ke liye)
}
