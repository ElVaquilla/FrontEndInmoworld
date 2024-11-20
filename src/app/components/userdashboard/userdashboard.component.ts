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
      const dialogRef = this.dialog.open(ConfirmationModalComponent, {
        width: '350px',
        data: { 
          titulo: 'Error',
          mensaje: 'Las contraseñas no coinciden.',
          confirmable: false
        }
      });
      
      return;
    }
  
    const updatedUser: IUser = {
      ...this.user,
      name: this.newUsername,
      password: this.newPassword
    };
  
    this.userService.updateUser(updatedUser).subscribe(
      () => {
        const successDialog = this.dialog.open(ConfirmationModalComponent, {
          width: '350px',
          data: {
            titulo: 'Usuario actualizado',
            mensaje: 'Tus datos han sido actualizados correctamente.',
            confirmable: false // Solo botón de cerrar
          }
        });
  
        successDialog.afterClosed().subscribe(() => {
          this.username = this.newUsername;
          this.cancelEditUser();
        });
      },
      error => {
        console.error('Error al actualizar el usuario:', error);
        const errorDialog = this.dialog.open(ConfirmationModalComponent, {
          width: '350px',
          data: {
            titulo: 'Error',
            mensaje: 'Hubo un error al intentar actualizar tus datos. Por favor, inténtalo nuevamente.',
            confirmable: false // Solo botón de cerrar
          }
        });
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
      const dialogRef = this.dialog.open(ConfirmationModalComponent, {
        width: '350px',
        data: { 
          titulo: 'Error',
          mensaje: 'No se encontró el usuario',
          confirmable: false
        }
      });
      
      return;
    }
  
    // Mostrar el diálogo de confirmación
    const dialogRef = this.dialog.open(ConfirmationModalComponent, {
      width: '350px',
      data: {
        titulo: 'Eliminar cuenta',
        mensaje: `¿Estás seguro de que deseas eliminar tu cuenta, ${user.name}?`,
        confirmable: true // Con opciones de Confirmar y Cerrar
      }
    });
  
    // Suscribirse al cierre del diálogo
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.userService.deleteUserById(user._id).subscribe(
          () => {
            const successDialog = this.dialog.open(ConfirmationModalComponent, {
              width: '350px',
              data: {
                titulo: 'Cuenta eliminada',
                mensaje: 'Tu cuenta ha sido eliminada correctamente.',
                confirmable: false // Solo botón de cerrar
              }
            });
  
            successDialog.afterClosed().subscribe(() => {
              this.userService.setUser(null); // Eliminar el usuario de localStorage
              this.router.navigate(['/']); // Redirigir a la página de inicio
            });
          },
          error => {
            console.error('Error al eliminar la cuenta:', error);
            const errorDialog = this.dialog.open(ConfirmationModalComponent, {
              width: '350px',
              data: {
                titulo: 'Error',
                mensaje: 'Hubo un error al intentar eliminar tu cuenta. Por favor, inténtalo nuevamente.',
                confirmable: false // Solo botón de cerrar
              }
            });
          }
        );
      }
    });
  }

  toggleAddProperty() {
    this.addProperty = !this.addProperty;
    if (this.editUser) this.editUser = false;
  }

  addNewProperty() {
    if (!this.newProperty.address.trim()) {
      const dialogRef = this.dialog.open(ConfirmationModalComponent, {
        width: '350px',
        data: { 
          titulo: 'Error',
          mensaje: 'La dirección es obligatoria.',
          confirmable: false
        }
      });
            return;
    }
  
    const propertyData: IProperty = {
      ...this.newProperty,
      owner: this.user._id || '',
    };
  
    this.propertyService.addProperty(propertyData).subscribe(
      () => {
        // Mostrar modal informativo
        const dialogRef = this.dialog.open(ConfirmationModalComponent, {
          width: '350px',
          data: { 
            titulo: 'Propiedad creada',
            mensaje: `La propiedad en "${this.newProperty.address}" se ha añadido correctamente.`,
            confirmable: false // Sin botón Confirmar
          }
        });
  
        dialogRef.afterClosed().subscribe(() => {
          this.listProperties();
          this.cancelAddProperty();
        });
      },
      (error) => {
        console.error('Error al añadir la propiedad:', error);
        const dialogRef = this.dialog.open(ConfirmationModalComponent, {
          width: '350px',
          data: { 
            titulo: 'Error',
            mensaje: 'No se pudo añadir la propiedad.',
            confirmable: false
          }
        });
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
        // Mostrar modal informativo
        const dialogRef = this.dialog.open(ConfirmationModalComponent, {
          width: '350px',
          data: {
            titulo: 'Propiedad actualizada',
            mensaje: `La propiedad en "${property.address}" se ha actualizado correctamente.`,
            confirmable: false // Sin botón Confirmar
          }
        });
  
        dialogRef.afterClosed().subscribe(() => {
          this.cancelEditProperty();
        });
      },
      (error) => {
        console.error('Error al actualizar la propiedad:', error);
        const dialogRef = this.dialog.open(ConfirmationModalComponent, {
          width: '350px',
          data: { 
            titulo: 'Error',
            mensaje: 'No se pudo actualizar la propiedad.',
            confirmable: false
          }
        });
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
      data: {
        titulo: 'Eliminar propiedad',
        mensaje: '¿Estás seguro de que deseas eliminar esta propiedad?',
        confirmable: true
      },
    });
  
    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.propertyService.deleteProperty(propertyId).subscribe(
          () => {
            const dialogRef = this.dialog.open(ConfirmationModalComponent, {
              width: '350px',
              data: { 
                titulo: 'Eliminada',
                mensaje: 'Propiedad eliminada correctamente.',
                confirmable: false
              }
            });
            
            this.listProperties();
          },
          (error) => {
            console.error('Error al eliminar la propiedad:', error);
            const dialogRef = this.dialog.open(ConfirmationModalComponent, {
              width: '350px',
              data: { 
                titulo: 'Error',
                mensaje: 'No se pudo eliminar la propiedad.',
                confirmable: false
              }
            });
          }
        );
      }
    });
  }  
}