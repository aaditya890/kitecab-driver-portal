import { Component, signal } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../../shared/services/auth.service';
import { DriverService } from '../../../shared/services/driver.service';
import { CloudinaryService } from '../../../shared/services/cloudinary.service';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.scss'
})
export class ProfileComponent {
   loading = signal(false);
  error = signal('');
  success = signal('');
  selectedFile: File | null = null;

  form = this.fb.nonNullable.group({
    name: ['', Validators.required],
    address: ['', Validators.required],
    city: ['', Validators.required],
    cabType: ['hatchback', Validators.required],
    vehicleNumber: ['', Validators.required],
    vehicleModel: ['', Validators.required],
    idProofType: ['Aadhaar', Validators.required],
    currentCity: ['', Validators.required],
  });

  cabTypes = ['hatchback', 'sedan', 'suv'];
  idTypes = ['Aadhaar', 'DL', 'PAN', 'Voter'];

  constructor(
    private fb: FormBuilder,
    private auth: AuthService,
    private driverService: DriverService,
    private cloud: CloudinaryService
  ) {}

  ngOnInit() {
    const driver = this.auth.currentDriver;
    if (!driver) return;

    this.form.patchValue({
      name: driver.name,
      address: driver.address,
      city: driver.city,
      cabType: driver.cabType,
      vehicleNumber: driver.vehicleNumber,
      vehicleModel: driver.vehicleModel,
      idProofType: driver.idProofType || 'Aadhaar',
      currentCity: driver.currentCity,
    });
  }

  onFileChange(e: any) {
    this.selectedFile = e.target.files[0];
  }

  async save() {
    this.error.set('');
    this.success.set('');

    if (this.form.invalid) {
      this.error.set('Please fill all required fields.');
      return;
    }

    const driver = this.auth.currentDriver;
    if (!driver) {
      this.error.set('Not logged in.');
      return;
    }

    this.loading.set(true);

    let proofUrl = driver.idProofUrl;

    try {
      if (this.selectedFile) {
        proofUrl = await this.cloud.uploadFile(this.selectedFile);
      }

      const formValue = this.form.value;
      await this.driverService.updateDriverProfile(driver.id!, {
        ...formValue,
        cabType: formValue.cabType as 'hatchback' | 'sedan' | 'suv',
        idProofUrl: proofUrl,
        status: 'pending',
      });

      this.success.set('Profile saved! Waiting for admin approval.');
    } catch (err: any) {
      this.error.set(err.message || 'Failed to save profile');
    } finally {
      this.loading.set(false);
    }
  }
}
