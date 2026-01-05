
import { Routes } from '@angular/router';
import { LoginComponent } from './components/login/login.component';
import { TwoFAVerificationComponent } from './components/two-fa-verification/two-fa-verification.component';
import { DashboardComponent } from './components/dashboard/dashboard';

export const routes: Routes = [
    {
        path: '',
        redirectTo: '/login',
        pathMatch: 'full'
    },
    {
        path: 'login',
        component: LoginComponent
    },
    {
        path: 'verify-2fa',
        component: TwoFAVerificationComponent
    },
    {
        path: 'dashboard',
        component: DashboardComponent
    },
    {
        path: 'patients',
        loadComponent: () => import('./components/patients/patients').then(m => m.PatientsComponent)
    },
    {
        path: 'medecins',
        loadComponent: () => import('./components/medecins/medecins').then(m => m.MedecinsComponent)
    },
    {
        path: 'validation-medecins',
        loadComponent: () => import('./components/doctor-validation/doctor-validation.component').then(m => m.DoctorValidationComponent)
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
    {
        path: '**',
        redirectTo: '/login'
    }
];