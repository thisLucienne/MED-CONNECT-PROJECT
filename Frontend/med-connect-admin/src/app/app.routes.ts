
import { Routes } from '@angular/router';
import { DashboardComponent } from './components/dashboard/dashboard';

export const routes: Routes = [
    {
        path: '',
        redirectTo: '/dashboard',
        pathMatch: 'full'
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
        redirectTo: '/dashboard'
    }
];