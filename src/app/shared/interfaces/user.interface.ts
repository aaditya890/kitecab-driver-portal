export interface User {
  uid: string;
  role: 'admin' | 'driver';
  email?: string;
  phone?: string;
}
