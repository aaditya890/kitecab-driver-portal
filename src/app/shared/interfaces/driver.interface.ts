export interface Driver {
  id?: string;                       // Firestore doc id (phone)

  name: string;
  phone: string;                     // "91XXXXXXXXXX"
  address: string;

  city: string;                      // Permanent city
  currentCity: string;               // Live city

  cabType: 'hatchback' | 'sedan' | 'suv';
  vehicleNumber: string;
  vehicleModel: string;

  // ---- AVAILABILITY ----
  availableRoutes?: {
    from: string;
    to: string;
  }[];

  idProofUrl: string;
  idProofType: 'Aadhaar' | 'DL' | 'PAN' | 'Voter';

  onlineStatus: boolean;
  status: 'approved' | 'pending' | 'blocked';

  createdAt: any;
}
