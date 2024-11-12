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

  getApiUrl() {
    return this.apiUrl; // Método para obtener apiUrl 
  }

  // Obtener todos los usuarios
  getUsers(page: number, limit: number): Observable<IUser[]> {
    return this.http.get<IUser[]>(`${this.apiUrl}/${page}/${limit}`);
  }

  // Obtener un usuario por su ID
  getUserById(id: string): Observable<IUser> {
    return this.http.get<IUser>(`${this.apiUrl}/${id}`);
  }

  login(username: string, password: string): Observable<IUserResponse> {
    const body = { username, password };
    return this.http.post<IUserResponse>(`${this.apiUrl}/login`, body);
  }  

  register(usuario: IUser): Observable<{ user: IUser }> {
    return this.http.post<{ user: IUser }>(`${this.apiUrl}/register`, usuario);
  }

  // Agregar un nuevo usuario
  addUser(usuario: IUser): Observable<{ user: IUser }> {
    return this.http.post<{ user: IUser }>(this.apiUrl, usuario);
  }  

  // Actualizar un usuario existente
  updateUser(usuario: IUser): Observable<IUser> {
    return this.http.put<IUser>(`${this.apiUrl}/${usuario._id}`, usuario);
  }

  // Eliminar un usuario por su _id
  deleteUserById(id: string): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/${id}`);
  }

  // Establecer el usuario actual (para simplificar la autenticación)
  setUser(user: any) {
    localStorage.setItem('currentUser', JSON.stringify(user));
  }

  // Obtener el usuario actual
  getUser(): any {
    const user = localStorage.getItem('currentUser');
    return user ? JSON.parse(user) : null;
  }
  // Eliminar el usuario actual del almacenamiento local 
  clearUser() { 
    localStorage.removeItem('currentUser');
  }
}





