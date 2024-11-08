export interface IUser {
  _id?: string;      // MongoDB genera automáticamente este campo al insertar
  name: string;
  email: string;     // Añadir el campo email
  password: string;
  property?: string[];    // Este campo es la "Property"
 

  
}



