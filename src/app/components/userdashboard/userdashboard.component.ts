import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { PropertyComponent } from '../property/property.component';
import { UserService } from '../../services/user.service';
import { HttpClient } from '@angular/common/http';
import { IUser } from '../../models/user.model';
import { ConfirmationModalComponent } from '../confirmation-modal/confirmation-modal.component';
import { MatDialog } from '@angular/material/dialog';

interface Property {
  address: string;
  description: string;
}

@Component({
  selector: 'app-userdashboard',
  standalone: true,
  imports: [FormsModule, CommonModule, PropertyComponent],
  templateUrl: './userdashboard.component.html',
  styleUrls: ['./userdashboard.component.css']
})
export class UserdashboardComponent implements OnInit {
  username: string = '';
  email: string = ''; // Añade el email del usuario
  properties: Property[] = [];  

  editUser = false;
  addProperty = false;

  newUsername: string = '';
  newPassword: string = '';
  confirmPassword: string = '';

  newProperty: Property = { address: '', description: '' };

  constructor(private dialog: MatDialog, private userService: UserService, private http: HttpClient, private router: Router) { }

  ngOnInit() {
    const user = this.userService.getUser();
    if (user) {
      console.log('Usuario cargado:', user);
      this.username = user.name;
      this.email = user.email; // Añade el email del usuario
      this.newUsername = user.name;
      this.properties = user.property || [];
    } else {
      console.error('No se ha encontrado el usuario');
    }
  }
  
  toggleEditUser() {
    console.log('Toggle Edit User function called');
    this.editUser = !this.editUser;
    console.log('editUser state:', this.editUser);
    if (this.addProperty) this.addProperty = false;
  }

  updateUser() {
    const user = this.userService.getUser();
    if (!user) {
      alert('No se encontró el usuario');
      return;
    }
  
    if (this.newPassword !== this.confirmPassword) {
      alert('Las contraseñas no coinciden');
      return;
    }

    const updatedUser: IUser = {
      _id: user._id,
      name: this.newUsername,
      password: this.newPassword,
      email: this.email
    };

    this.http.put<IUser>(`${this.userService.getApiUrl()}/${updatedUser._id}`, updatedUser).subscribe(response => {
      console.log(response);
      alert('Usuario actualizado correctamente');
      this.username = this.newUsername;
      this.cancelEditUser();
    }, error => {
      console.error(error);
      alert('Error al actualizar el usuario');
    });
  }

  cancelEditUser() {
    this.editUser = false;
    this.newUsername = this.username;
    this.newPassword = '';
    this.confirmPassword = '';
  }

  toggleAddProperty() {
    this.addProperty = !this.addProperty;
    if (this.editUser) this.editUser = false;
  }

  addNewProperty() {
    this.properties.push({ ...this.newProperty });
    alert('Propiedad añadida correctamente');
    this.cancelAddProperty();
  }

  cancelAddProperty() {
    this.addProperty = false;
    this.newProperty = { address: '', description: '' };
  }

  // Método para eliminar la cuenta del usuario
  deleteUser() {
    const user = this.userService.getUser();
    if (!user) {
      alert('No se encontró el usuario');
      return;
    }
    // Mostrar el diálogo de confirmación
    const dialogRef = this.dialog.open(ConfirmationModalComponent, {
      width: '350px',
      data: { mensaje: `¿Estás seguro de que deseas eliminar a ${user.name}?` }
    });

    // Suscribirse al cierre del diálogo
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
      this.userService.deleteUserById(user._id).subscribe(response => {
        alert('Cuenta eliminada correctamente');
        this.userService.setUser(null); // Eliminar el usuario de localStorage
        this.router.navigate(['/']); // Redirigir a la página de inicio
      }, error => {
        console.error(error);
        alert('Error al eliminar la cuenta');
      });
    }

  }
);
}



}
