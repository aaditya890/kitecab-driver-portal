import { Injectable } from '@angular/core';
import axios from 'axios';

@Injectable({
  providedIn: 'root'
})
export class CloudinaryService {
  cloudName = 'dymjzbdsx';
  uploadPreset = 'driver_docs';

  async uploadFile(file: File): Promise<string> {
    const url = `https://api.cloudinary.com/v1_1/${this.cloudName}/upload`;

    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', this.uploadPreset);

    const response = await axios.post(url, formData);
    return response.data.secure_url;  // final cloudinary image URL
  }
}
