import { Component, OnInit , Output, Input, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';  // Import FormsModule y NgForm para manejar el formulario
import { IUser,IUserResponse } from '../../models/user.model'; // Importar el modelo User desde la subcarpeta services
import { UserService } from '../../services/user.service'; // Importar el servicio UserService desde la subcarpeta services
import { TruncatePipe } from '../../pipes/truncate.pipe';
import { MaskEmailPipe } from '../../pipes/maskEmail.pipe';
import { NgxPaginationModule} from 'ngx-pagination';



@Component({
  selector: 'app-user',
  templateUrl: './user.component.html',
  styleUrls: ['./user.component.css'],
  standalone: true,  // Esto convierte el componente en independiente
  imports: [CommonModule, FormsModule, TruncatePipe, MaskEmailPipe, NgxPaginationModule]  // Importar CommonModule y FormsModule

})

export class UserComponent implements OnInit {
  users: IUser[] = []; // Lista de usuarios con tipado User
  desplegado: boolean[] = []; // Controla si el desplegable de cada usuario está abierto o cerrado
  mostrarPassword: boolean[] = []; // Array para controlar la visibilidad de la contraseña
  @Input() totalUsers:any;
@Input()currentPage:any;
@Input()limit:any=2;
@Input()total:any;
  @Output()
  pageChange!: EventEmitter<number>;
totalPages:any;

  nuevoUser: IUser = {
    name: '',
    email: '', // Añadir el campo email
    password: '',
  };
  

  count:number=0;
  page: number=1 ;
  limitUsers = [2,3, 6, 9];

  confirmarPassword: string = ''; // Campo para confirmar la contraseña
  userEdicion: IUser | null = null; // Usuario en proceso de edición
  indiceEdicion: number | null = null; // Almacena el índice del usuario en edición
  formSubmitted: boolean = false; // Indica si se ha enviado el formulario

  constructor(private userService: UserService) {}

  ngOnInit(): void {
    // Cargar usuarios desde el UserService
    this.userService.getUsers(this.page, this.limit)
      .subscribe(data => {
        this.users = data.users;          // Lista de usuarios
        this.totalUsers = data.totalUsers; // Total de usuarios
        this.totalPages = data.totalPages; // Total de páginas
        this.desplegado = new Array(this.users.length).fill(false);
      }, error => {
        console.error('Error al obtener los usuarios', error);
      });
  }

  handlePageChange(event: number): void {
    console.log(this.count);
    this.page = event;
    console.log(this.page);
    this.ngOnInit();
  }

  handleLimitChange(event: any): void {
    this.limit = event.target.value;
    this.page = 1;
    this.ngOnInit();
  }

  // Función para agregar o modificar un usuario
  agregarElemento(userForm: NgForm): void {
    this.formSubmitted = true;
  
    // Verificar si las contraseñas coinciden
    if (this.nuevoUser.password !== this.confirmarPassword) {
      alert('Las contraseñas no coinciden. Por favor, inténtalo de nuevo.');
      return;
    }
  
    if (this.indiceEdicion !== null) {
      // Estamos en modo edición, modificar el usuario existente
      this.users[this.indiceEdicion] = { ...this.nuevoUser, _id: this.users[this.indiceEdicion]._id };
  
      // Actualizar el usuario en la API
      this.userService.updateUser(this.users[this.indiceEdicion]).subscribe(response => {
        console.log('Usuario actualizado:', response);
      });
  
      // Limpiar el estado de edición
      this.indiceEdicion = null;
    } else {
      // Modo agregar nuevo usuario
      const userJSON: IUser = {
        name: this.nuevoUser.name,
        email: this.nuevoUser.email,
        password: this.nuevoUser.password,
      };
  
      // Enviar el usuario a la API a través del UserService
      this.userService.addUser(userJSON).subscribe(response => {
        console.log('Usuario agregado:', response);
        
        // Agregar el usuario con el _id generado por la API al array de usuarios en el frontend
        this.users.push({ ...userJSON, _id: response.user._id });
        this.desplegado.push(false); // Añadir un nuevo estado de desplegado
      });
    }
  
    // Limpiar los campos del formulario y restablecer su estado
    this.resetForm(userForm);
  }
  

  // Función para limpiar el formulario
  resetForm(userForm: NgForm): void { // Aceptar userForm como parámetro
    this.nuevoUser = {
      name: '',
      email: '', // Limpiar el campo email
      password: '',
    };
    this.confirmarPassword = ''; // Reiniciar el campo de confirmar contraseña
    this.formSubmitted = false; // Restablecer el estado del formulario para no mostrar errores
    userForm.resetForm(); // Reiniciar el formulario en la vista
  }

  // Función para preparar la edición de un usuario
  prepararEdicion(usuario: IUser, index: number): void {
    this.userEdicion = { ...usuario }; // Clonar el usuario para la edición
    this.nuevoUser = { ...usuario }; // Cargar los datos del usuario en el formulario
    this.indiceEdicion = index; // Almacenar el índice del usuario en edición
    this.desplegado[index] = true; // Abrir el desplegable del usuario que se está editando
  }

  // Función para eliminar un usuario usando el _id
  eliminarElemento(index: number): void {
    const userAEliminar = this.users[index];
  
    if (!userAEliminar._id) {
      console.error('El usuario no tiene un _id válido. No se puede eliminar.');
      alert('El usuario no se puede eliminar porque no está registrado en la base de datos.');
      return;
    }
  
    if (confirm(`¿Estás seguro de que deseas eliminar a ${userAEliminar.name}?`)) {
      // Eliminar a través del UserService usando el _id como identificador
      this.userService.deleteUserById(userAEliminar._id).subscribe(
        response => {
          console.log('Usuario eliminado:', response);
          this.users.splice(index, 1);
          this.desplegado.splice(index, 1);
        },
        error => {
          console.error('Error al eliminar el usuario:', error);
          alert('Error al eliminar el usuario. Por favor, inténtalo de nuevo.');
        }
      );
    }
  }
  

  // Función para alternar la visualización del desplegable
  toggleDesplegable(index: number): void {
    this.desplegado[index] = !this.desplegado[index];
  }
  

  // Función para alternar la visibilidad de la contraseña
  togglePassword(index: number): void {
    this.mostrarPassword[index] = !this.mostrarPassword[index]; // Cambiamos entre true y false
  }

}


