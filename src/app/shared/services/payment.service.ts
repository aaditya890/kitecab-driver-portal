import { Injectable, inject } from '@angular/core';
import { Functions, httpsCallable } from '@angular/fire/functions';

@Injectable({
  providedIn: 'root'
})
export class PaymentService {

  private functions = inject(Functions); // ✅ AngularFire ka instance

  createOrder = httpsCallable(this.functions, 'createOrder');
  verifyPayment = httpsCallable(this.functions, 'verifyPayment');
}
