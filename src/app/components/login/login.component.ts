import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { UserService } from '../../services/user.service';
import { IUser, IUserResponse } from '../../models/user.model';

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

  constructor(private userService: UserService) {}

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
      this.userService.login(this.username, this.password);
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
      const nuevoUser: IUser = {
        name: this.username,
        email: this.email, // Añadir el campo email
        password: this.password,
      };
      this.userService.register(nuevoUser);
    } else {
      alert('Todos los campos son obligatorios');
    }
  }
}
