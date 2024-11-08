import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms'; // Importa FormsModule

@Component({
  selector: 'app-userdashboard',
  standalone: true,
  imports: [FormsModule], // Agrega FormsModule aquí
  templateUrl: './userdashboard.component.html',
  styleUrls: ['./userdashboard.component.css']
})
export class UserdashboardComponent { 
  username: string = 'Miguel'; // Ejemplo de nombre de usuario inicial
  properties = [
    { address: '123 Calle Principal', description: 'Apartamento en el centro' }
  ]; // Propiedades iniciales

  // Variables para controlar la visibilidad de los formularios
  editUser = false;
  addProperty = false;

  // Variables para el formulario de edición de usuario
  newUsername: string = this.username;
  newPassword: string = '';
  confirmPassword: string = '';

  // Variables para el formulario de nueva propiedad
  newProperty = { address: '', description: '' };

  // Función para alternar la visibilidad del formulario de edición de usuario
  toggleEditUser() {
    this.editUser = !this.editUser;
    if (this.addProperty) this.addProperty = false; // Cierra el formulario de añadir propiedad si está abierto
  }

  // Función para cancelar la edición del usuario
  cancelEditUser() {
    this.editUser = false;
    this.newUsername = this.username;
    this.newPassword = '';
    this.confirmPassword = '';
  }

  // Función para actualizar el usuario
  updateUser() {
    if (this.newPassword !== this.confirmPassword) {
      alert('Las contraseñas no coinciden');
      return;
    }
    this.username = this.newUsername;
    alert('Usuario actualizado correctamente');
    this.cancelEditUser();
  }

  // Función para alternar la visibilidad del formulario de añadir propiedad
  toggleAddProperty() {
    this.addProperty = !this.addProperty;
    if (this.editUser) this.editUser = false; // Cierra el formulario de edición de usuario si está abierto
  }

  // Función para cancelar la adición de nueva propiedad
  cancelAddProperty() {
    this.addProperty = false;
    this.newProperty = { address: '', description: '' };
  }

  // Función para añadir una nueva propiedad
  addNewProperty() {
    this.properties.push({ ...this.newProperty });
    alert('Propiedad añadida correctamente');
    this.cancelAddProperty();
  }
}
