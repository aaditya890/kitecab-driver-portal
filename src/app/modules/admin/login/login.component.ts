import { Component, inject } from '@angular/core';
import { AdminService } from '../../../shared/services/admin.service';
import { FormBuilder, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { APP_ROUTES } from '../../../routes.constant';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule, FormsModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent {

  private fb = inject(FormBuilder);
  private adminService = inject(AdminService);
  private router = inject(Router);

loading = false;
error: string | null = null;

form = this.fb.group({
  email: ['', [Validators.required, Validators.email]],
  password: ['', [Validators.required]]
});

ngOnInit() {
  const admin = localStorage.getItem('admin');
  if (admin) {
    this.router.navigate([
      APP_ROUTES.ADMIN.BASE,
      APP_ROUTES.ADMIN.DASHBOARD
    ]);
  }
}

async login() {
  if (this.form.invalid) return;

  this.loading = true;
  this.error = null;
  console.log(this.form.value);

  const email:any = this.form.value.email;
  const password:any = this.form.value.password;

  const admin = await this.adminService.login(email, password);

  if (!admin) {
    this.error = 'Invalid email or password';
    this.loading = false;
    return;
  }

  localStorage.setItem('admin', JSON.stringify(admin));

  this.router.navigate([
    APP_ROUTES.ADMIN.BASE,
    APP_ROUTES.ADMIN.DASHBOARD
  ]);

  this.loading = false;
}


}

