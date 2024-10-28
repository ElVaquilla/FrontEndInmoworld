import { RouterModule, Routes } from '@angular/router';
import { NgModule } from '@angular/core';
import { UserComponent } from './components/usuaris/user.component';
import { PropertyComponent } from './components/property/property.component';
import { HomeComponent } from './components/home/home.component';
import {NgxPaginationModule} from 'ngx-pagination';
import { ConfirmationModalComponent } from './components/confirmation-modal/confirmation-modal.component';
import { FormsModule } from '@angular/forms'; 
import { CommonModule } from '@angular/common'; 
import { LoginComponent } from './components/login/login.component';

export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' }, 
  { path: 'home', component: HomeComponent },
  { path: 'user', component: UserComponent },
  { path: 'property', component: PropertyComponent },
  { path: 'confirmation-modal', component: ConfirmationModalComponent },
  { path: 'login', component: LoginComponent},
  { path: '**', redirectTo: 'login' } 
];

@NgModule({
  imports: [RouterModule.forRoot(routes, { useHash: true }), NgxPaginationModule,  CommonModule, FormsModule ], 
  exports: [RouterModule]
})
export class AppRoutingModule {}


