import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss'
})
export class DashboardComponent {
   constructor(private router: Router) {}

  logout() {
    localStorage.removeItem("driver");          // ❌ Remove session
    this.router.navigate(["/driver/login"]);    // 🔄 Redirect to login
  }
}
