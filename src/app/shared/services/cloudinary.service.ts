import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import axios from 'axios';

@Injectable({
  providedIn: 'root'
})
export class CloudinaryService {
   cloudName = 'dv0b2asck';
  uploadPreset = 'driver_docs';

  constructor(private http: HttpClient) {}

  uploadFile(file: File): Promise<string> {
    const url = `https://api.cloudinary.com/v1_1/${this.cloudName}/auto/upload`;

    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', this.uploadPreset);

    return this.http.post<any>(url, formData).toPromise()
      .then(res => res.secure_url);
  }
}
