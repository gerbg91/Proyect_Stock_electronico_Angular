import { Component } from '@angular/core';
import { CommonModule } from '@angular/common'; // <-- ¡Añade esta línea!
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { PbService } from '../../services/pb';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule], 
  templateUrl: './login.html',
  styleUrl: './login.scss'
})
export class LoginComponent {
  email = '';
  password = '';

  constructor(private pbService: PbService, private router: Router) {}

  async ingresar() {
    try {
      // Intentamos el login
      await this.pbService.pb.collection('users').authWithPassword(this.email, this.password);
      
      // Si llegamos aquí es que ha funcionado
      console.log('Login exitoso');
      this.router.navigate(['/stock']);
    } catch (error) {
      console.error('Error de login:', error);
      alert('Error: Credenciales no válidas o usuario no verificado');
    }
  }
}