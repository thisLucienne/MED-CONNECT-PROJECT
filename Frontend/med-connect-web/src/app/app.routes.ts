import { Routes } from '@angular/router';
import { LoginComponent } from './components/login.components/login.components';
import { DashboardComponent } from './components/dashboard(medecin)/dashboard.component';
import { PatientDComponent } from './components/patient_d/patient_d.component';
import { Agenda } from './components/agenda/agenda';
import { Messagerie } from './components/messagerie/messagerie';

export const routes: Routes = [
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  { path: 'dashboard', component: DashboardComponent },
  { path: 'patients', component: PatientDComponent },
  { path: 'agenda', component: Agenda },
  { path: 'messages', component: Messagerie },
  {
    path: 'medecins',
    loadComponent: () => import('./components/medecins/medecins').then(m => m.MedecinsComponent)
  },
  {
    path: 'dossiers',
    loadComponent: () => import('./components/dossiers/dossiers').then(m => m.DossiersComponent)
  },
  {
    path: 'messagerie',
    loadComponent: () => import('./components/messagerie/messagerie').then(m => m.MessagerieComponent)
  },
  {
    path: 'parametres',
    loadComponent: () => import('./components/parametres/parametres').then(m => m.ParametresComponent)
  },
  { path: '**', redirectTo: '/login' }
];