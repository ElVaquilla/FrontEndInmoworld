import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { UserService } from '../../services/user.service';
import { Router } from '@angular/router';
import { IUser } from '../../models/user.model';

@Component({
  selector: 'app-login',
  standalone: true,
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
  imports: [FormsModule, CommonModule]
})
export class LoginComponent {
  username: string = '';
  password: string = '';
  confirmPassword: string = '';
  email: string = '';
  isRegisterMode: boolean = false;
  submitted: boolean = false;

  constructor(private userService: UserService, private router: Router) {}

  toggleMode() {
    this.isRegisterMode = !this.isRegisterMode;
    this.clearForm();
  }

  clearForm() {
    this.username = '';
    this.password = '';
    this.confirmPassword = '';
    this.email = '';
    this.submitted = false;
  }

  onSubmit() {
    this.submitted = true;
    if (this.isRegisterMode) {
      this.onRegisterSubmit();
    } else {
      this.onLoginSubmit();
    }
  }

  onLoginSubmit() {
    if (this.username && this.password) {
      this.userService.login(this.username, this.password).subscribe(
        (response: any) => {
          console.log("Respuesta del servidor:", response);  // Log para depuración
          if (response.data) { // Verifica si hay datos de usuario en la respuesta
            const user = response.data; // Obtén los datos del usuario
            this.userService.setUser(user);  // Guarda el usuario en localStorage
            
            // Navega según el tipo de usuario
            if (response.message === 'Admin') {
              this.router.navigate(['/home']);
            } else {
              this.router.navigate(['userdashboard']);
            }
          } else {
            alert('Usuario no encontrado');
          }
        },
        error => {
          console.error('Error en el inicio de sesión:', error);  // Log para errores
          alert('Error en el inicio de sesión');
        }
      );
    } else {
      alert('Todos los campos son obligatorios');
    }
  }

  onRegisterSubmit() {
    if (this.password !== this.confirmPassword) {
      alert('Las contraseñas no coinciden');
      return;
    }
    
    if (this.username && this.email && this.password) {
      // Validación del formato del correo
      const emailPattern = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/;
      if (!emailPattern.test(this.email)) {
        alert('El formato del correo electrónico no es válido');
        return;
      }

      // Validación de longitud de la contraseña
      if (this.password.length < 7) {
        alert('La contraseña debe tener al menos 7 caracteres');
        return;
      }

      const nuevoUser: IUser = {
        name: this.username,
        email: this.email,
        password: this.password,
      };

      this.userService.register(nuevoUser).subscribe(
        response => alert('Usuario registrado exitosamente'),
        error => alert('Error en el registro')
      );
    } else {
      alert('Todos los campos son obligatorios');
    }
  }
}
