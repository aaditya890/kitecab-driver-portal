export interface Driver {
  id?: string;                     // Firestore doc id (phone number)
  name: string;
  phone: string;                   // ALWAYS store with country code -> "91XXXXXXXXXX"
  address: string;
  city: string;                    // Permanent city
  currentCity: string;             // For live tracking, active city
  cabType: 'hatchback' | 'sedan' | 'suv';
  vehicleNumber: string;
  vehicleModel: string;
  idProofUrl: string;              // Cloudinary URL
  idProofType: 'Aadhaar' | 'DL' | 'PAN' | 'Voter';
  onlineStatus: boolean;           // Driver active/offline
  status: 'approved' | 'pending' | 'blocked';
  createdAt: any;                  // Firestore Timestamp
}
