import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { PropertyComponent } from '../property/property.component';
import { UserService } from '../../services/user.service';
import { IProperty } from '../../models/property.model';
import { IUser } from '../../models/user.model';
import { PropertyService } from '../../services/property.service';
import { ConfirmationModalComponent } from '../confirmation-modal/confirmation-modal.component';
import { MatDialog } from '@angular/material/dialog';
import { NgxPaginationModule } from 'ngx-pagination';

@Component({
  selector: 'app-userdashboard',
  standalone: true,
  imports: [FormsModule, CommonModule, PropertyComponent, NgxPaginationModule],
  templateUrl: './userdashboard.component.html',
  styleUrls: ['./userdashboard.component.css']
})
export class UserdashboardComponent implements OnInit {
  username: string = '';
  email: string = '';
  user: IUser = {
    name: '',
    email: '',
    password: '',
    property: []
  };
  properties: IProperty[] = [];
  editUser = false;
  addProperty = false;
  editProperty: boolean = false; // Indica si se está editando una propiedad
  editPropertyIndex: number | null = null; // Índice de la propiedad en edición

  newUsername: string = '';
  newPassword: string = '';
  confirmPassword: string = '';

  newProperty: IProperty = {
    owner: '',
    address: '',
    description: ''
  };

  // Variables para paginación
  page: number = 1;
  limit: number = 5; // Número de propiedades por página
  totalProperties: number = 0;
  limitOptions: number[] = [5, 10, 20]; // Opciones para elementos por página

  constructor(
    private propertyService: PropertyService,
    private dialog: MatDialog,
    private userService: UserService,
    private router: Router
  ) {}

  ngOnInit() {
    this.user = this.userService.getUser();
    if (this.user) {
      this.username = this.user.name;
      this.email = this.user.email;
      this.newUsername = this.user.name;
      this.listProperties();
    } else {
      console.error('No se ha encontrado el usuario');
    }
  }

  // Obtener propiedades con paginación
  listProperties(): void {
    if (!this.user || !this.user._id) {
      console.error('No se encontró el usuario o el ID del usuario.');
      return;
    }
  
    this.userService.getUserById(this.user._id).subscribe(
      (fetchedUser: any) => {
        
        console.log('Datos del usuario recibidos:', fetchedUser);
        if (fetchedUser.data.property) {
          this.properties = fetchedUser.data.property;
          console.log('Propiedades del usuario:', this.properties);
        } else {
          console.log('No existen propiedades del usuario:', fetchedUser.data.name);
        }
      },
      (error) => {
        console.error('Error al obtener las propiedades del usuario:', error);
      }
    );
  }
  

  // Manejar el cambio de página
  handlePageChange(page: number): void {
    this.page = page;
    this.listProperties();
  }

  // Manejar cambio de límite por página
  handleLimitChange(event: Event): void {
    const select = event.target as HTMLSelectElement;
    this.limit = parseInt(select.value, 10);
    this.page = 1; // Reiniciar a la primera página
    this.listProperties();
  }

  toggleEditUser() {
    this.editUser = !this.editUser;
    if (this.addProperty) this.addProperty = false;
  }


  updateUser() {
    if (this.newPassword !== this.confirmPassword) {
      alert('Las contraseñas no coinciden');
      return;
    }

    const updatedUser: IUser = {
      ...this.user,
      name: this.newUsername,
      password: this.newPassword,
    };

    this.userService.updateUser(updatedUser).subscribe(
      (response) => {
        console.log('Usuario actualizado:', response);
        this.username = this.newUsername;
        this.cancelEditUser();
      },
      (error) => {
        console.error('Error al actualizar el usuario:', error);
        alert('No se pudo actualizar el usuario. Intenta nuevamente.');
      }
    );
  }

  cancelEditUser() {
    this.editUser = false;
    this.newUsername = this.user.name;
    this.newPassword = '';
    this.confirmPassword = '';
  }

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
  )
  }

  toggleAddProperty() {
    this.addProperty = !this.addProperty;
    if (this.editUser) this.editUser = false;
  }

  addNewProperty() {
    if (!this.newProperty.address.trim()) {
      alert('La dirección es obligatoria.');
      return;
    }

    const propertyData: IProperty = {
      ...this.newProperty,
      owner: this.user._id || '',
    };

    this.propertyService.addProperty(propertyData).subscribe(
      () => {
        alert('Propiedad añadida correctamente.');
        this.listProperties();
        this.cancelAddProperty();
      },
      (error) => {
        console.error('Error al añadir la propiedad:', error);
        alert('No se pudo añadir la propiedad.');
      }
    );
  }

  cancelAddProperty() {
    this.addProperty = false;
    this.newProperty = { owner: '', address: '', description: '' };
  }

  prepararEdicion(property: IProperty, index: number): void {
    this.editProperty = true;
    this.editPropertyIndex = index;
  }
  
  updateProperty(index: number): void {
    const property = this.properties[index];
  
    this.propertyService.updateProperty(property).subscribe(
      () => {
        alert('Propiedad actualizada correctamente.');
        this.cancelEditProperty();
      },
      (error) => {
        console.error('Error al actualizar la propiedad:', error);
        alert('No se pudo actualizar la propiedad.');
      }
    );
  }
  
  cancelEditProperty(): void {
    this.editProperty = false;
    this.editPropertyIndex = null;
    this.listProperties(); // Recarga las propiedades para descartar cambios no guardados
  }

  deleteProperty(propertyId: string) {
    const dialogRef = this.dialog.open(ConfirmationModalComponent, {
      width: '350px',
      data: { mensaje: '¿Estás seguro de que deseas eliminar esta propiedad?' },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.propertyService.deleteProperty(propertyId).subscribe(
          () => {
            alert('Propiedad eliminada correctamente.');
            this.listProperties();
          },
          (error) => {
            console.error('Error al eliminar la propiedad:', error);
            alert('No se pudo eliminar la propiedad.');
          }
        );
      }
    });
  }
}