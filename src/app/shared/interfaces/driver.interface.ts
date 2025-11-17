export interface Driver {
  id?: string;
  name: string;
  phone: string;
  address: string;
  city: string;
  cabType: 'hatchback' | 'sedan' | 'suv';
  vehicleNumber: string;
  vehicleModel: string;
  idProofUrl: string;               // Cloudinary uploaded file URL
  idProofType?: string;             // "Aadhaar" | "DL" | "PAN" | "Voter" (optional)
  currentCity: string;
  onlineStatus: boolean;
  status: 'approved' | 'pending' | 'blocked';
  createdAt: any;
}
