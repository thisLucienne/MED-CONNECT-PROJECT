import { Routes } from '@angular/router';
import { LoginComponent } from './components/login.components/login.components';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { PatientDComponent } from './components/patient_d/patient_d.component';

export const routes: Routes = [
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  { path: 'dashboard', component: DashboardComponent },
  { path: 'patients', component: PatientDComponent },
  { path: '**', redirectTo: '/login' }
];
