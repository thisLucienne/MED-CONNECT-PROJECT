import { Routes } from '@angular/router';
import { LoginComponent } from './components/login.components/login.components';
import { DashboardComponent } from './components/dashboard(medecin)/dashboard.component';
import { PatientDComponent } from './components/patient_d/patient_d.component';
import { Agenda } from './components/agenda/agenda';
import { Messagerie } from './components/messagerie/messagerie';
import { DossiersGlobauxComponent } from './components/dossiers-globaux/dossiers-globaux.component';
import { StatisticsComponent } from './components/statistics/statistics.component';
import { SettingsComponent } from './components/settings/settings.component';

export const routes: Routes = [
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  { path: 'dashboard', component: DashboardComponent },
  { path: 'patients', component: PatientDComponent },
  { path: 'agenda', component: Agenda },
  { path: 'messages', component: Messagerie },
  { path: 'dossiers', component: DossiersGlobauxComponent },
  { path: 'statistics', component: StatisticsComponent },
  { path: 'settings', component: SettingsComponent },
  { path: '**', redirectTo: '/login' }
];
