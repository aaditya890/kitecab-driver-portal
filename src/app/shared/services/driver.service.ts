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
}
