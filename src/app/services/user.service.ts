import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { IUser, IUserResponse } from '../models/user.model';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private apiUrl = "http://localhost:3001/user";  // Usar apiUrl desde environment

  constructor(private http: HttpClient) {}

  // Obtener todos los usuarios
  getUsers(page: Number, limit: Number  ): Observable<IUserResponse> {
    return this.http.get<IUserResponse >(`${this.apiUrl}/${page}/${limit}`);
  }

  login(usuario: string, password: string) {
    const body = { usuario, password }
    return this.http.post<IUserResponse>(`${this.apiUrl}/login`, body);
  }

  register(usuario: IUser): Observable<{ user: IUser }> {
    return this.http.post<{ user:IUser }>(`${this.apiUrl}/register`, usuario)
  }

  // Agregar un nuevo usuario
  addUser(usuario: IUser): Observable<{ user: IUser }> {
    return this.http.post<{ user: IUser }>(this.apiUrl, usuario);
  }  

  // Actualizar un usuario existente
  updateUser(usuario: IUser): Observable<IUser > {
    return this.http.put<IUser>(`${this.apiUrl}/${usuario._id}`, usuario);
  }

  // Eliminar un usuario por su _id
  deleteUserById(id: string): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/${id}`);
  }
}


