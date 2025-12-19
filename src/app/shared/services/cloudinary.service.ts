import { Injectable } from '@angular/core';
import axios from 'axios';

@Injectable({
  providedIn: 'root'
})
export class CloudinaryService {
  cloud_name = 'dv0b2asck';
  uploadPreset = 'driver_docs';

  async uploadFile(file: File): Promise<string> {
    const url = `https://api.cloudinary.com/v1_1/${this.cloud_name}/upload`;

    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', this.uploadPreset);

    const response = await axios.post(url, formData);
    return response.data.secure_url;  // final cloudinary image URL
  }
}
