import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { UserService } from '../../services/user.service';
import { Router } from '@angular/router';
import { IUser } from '../../models/user.model';
import { ConfirmationModalComponent } from '../confirmation-modal/confirmation-modal.component';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';

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

  constructor(private userService: UserService, private router: Router, private dialog: MatDialog) {}

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
          if (response.data) {
            const user = response.data;
            this.userService.setUser(user);
  
            // Navegar al dashboard según el rol
            const route = response.message === 'Admin' ? '/home' : 'userdashboard';
            this.router.navigate([route]);
  
            // Mostrar modal de éxito
            this.dialog.open(ConfirmationModalComponent, {
              data: {
                mensaje: '¡Inicio de sesión exitoso! Bienvenido.'
              }
            });
          } else {
            this.showErrorModal('Usuario no encontrado.');
          }
        },
        error => this.showErrorModal('Error en el inicio de sesión.')
      );
    } else {
      this.showErrorModal('Todos los campos son obligatorios.');
    }
  }
  
  onRegisterSubmit() {
    if (this.password !== this.confirmPassword) {
      this.showErrorModal('Las contraseñas no coinciden.');
      return;
    }
  
    if (this.username && this.email && this.password) {
      const nuevoUser = {
        name: this.username,
        email: this.email,
        password: this.password,
        property: []
      };
  
      this.userService.register(nuevoUser).subscribe(
        () => {
          // Mostrar modal de éxito
          this.dialog.open(ConfirmationModalComponent, {
            data: {
              mensaje: '¡Usuario registrado exitosamente!'
            }
          });
          this.clearForm();
        },
        () => this.showErrorModal('Error en el registro.')
      );
    } else {
      this.showErrorModal('Todos los campos son obligatorios.');
    }
  }
  
  // Método para mostrar errores
  showErrorModal(message: string) {
    this.dialog.open(ConfirmationModalComponent, {
      data: {
        mensaje: message
      }
    });
  }
 

}
