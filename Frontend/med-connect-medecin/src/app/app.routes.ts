import { Routes } from '@angular/router';
import { LoginComponent } from './components/login.components/login.components';
import { RegisterComponent } from './components/register/register.component';
import { TwoFAVerificationComponent } from './components/two-fa-verification/two-fa-verification.component';
import { DashboardComponent } from './components/dashboard(medecin)/dashboard.component';
import { PatientDComponent } from './components/patient_d/patient_d.component';
import { Agenda } from './components/agenda/agenda';
import { Messagerie } from './components/messagerie/messagerie';

export const routes: Routes = [
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'verify-2fa', component: TwoFAVerificationComponent },
  { path: 'dashboard', component: DashboardComponent },
  { path: 'patients', component: PatientDComponent },
  { path: 'agenda', component: Agenda },
  { path: 'messages', component: Messagerie },
  { path: 'dossiers', component: DashboardComponent }, // À remplacer par le composant dossiers
  { path: 'statistics', component: DashboardComponent }, // À remplacer par le composant statistiques
  { path: 'settings', component: DashboardComponent }, // À remplacer par le composant paramètres
  { path: '**', redirectTo: '/login' }
];
