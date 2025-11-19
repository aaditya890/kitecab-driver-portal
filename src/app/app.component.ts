import { Component, OnInit } from '@angular/core';
import { RouterLink, RouterOutlet } from '@angular/router';
import { firebaseAuth } from './firebase.config';



@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterLink, RouterOutlet],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent implements OnInit {
  title = 'kitecab-driver-portal';

  ngOnInit() {
    console.log("Firebase Auth:", firebaseAuth);
  }
}
