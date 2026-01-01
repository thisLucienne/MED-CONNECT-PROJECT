import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
  standalone: true,
  imports: [CommonModule]
})
export class DashboardComponent implements OnInit {
  // Informations du médecin
  doctorName = 'Martin';

  // Stats rapides
  todayAppointments = 8;
  pendingMessages = 5;
  urgentCases = 2;

  // Stats principales
  totalPatients = 147;
  patientGrowth = 12;
  totalConsultations = 285;
  consultationGrowth = 8;
  closedFiles = 42;
  closedFilesMonth = 12;
  activeTime = 32;

  // Données mensuelles des patients
  monthlyPatients = [
    { name: 'Jan', value: 85, color: '#3b82f6' },
    { name: 'Fév', value: 92, color: '#3b82f6' },
    { name: 'Mar', value: 78, color: '#3b82f6' },
    { name: 'Avr', value: 95, color: '#3b82f6' },
    { name: 'Mai', value: 88, color: '#3b82f6' },
    { name: 'Juin', value: 102, color: '#3b82f6' },
    { name: 'Juil', value: 96, color: '#3b82f6' },
    { name: 'Août', value: 89, color: '#3b82f6' },
    { name: 'Sep', value: 105, color: '#3b82f6' },
    { name: 'Oct', value: 98, color: '#3b82f6' },
    { name: 'Nov', value: 110, color: '#10b981' },
    { name: 'Déc', value: 115, color: '#10b981' }
  ];

  // Pathologies les plus rencontrées
  topPathologies = [
    { name: 'Diabète Type 2', count: 45, percentage: 100, color: '#ef4444' },
    { name: 'Hypertension', count: 38, percentage: 84, color: '#f59e0b' },
    { name: 'Asthme', count: 32, percentage: 71, color: '#3b82f6' },
    { name: 'Migraine chronique', count: 28, percentage: 62, color: '#8b5cf6' },
    { name: 'Hypothyroïdie', count: 24, percentage: 53, color: '#10b981' },
    { name: 'Allergies', count: 20, percentage: 44, color: '#06b6d4' }
  ];

  // Satisfaction patients
  averageRating = 4.8;
  totalReviews = 142;
  ratingBreakdown = [
    { stars: 5, percentage: 78, color: '#10b981' },
    { stars: 4, percentage: 15, color: '#3b82f6' },
    { stars: 3, percentage: 5, color: '#f59e0b' },
    { stars: 2, percentage: 1, color: '#ef4444' },
    { stars: 1, percentage: 1, color: '#dc2626' }
  ];

  // Activité hebdomadaire
  weeklyActivity = [
    { name: 'Lun', y: 180 },
    { name: 'Mar', y: 140 },
    { name: 'Mer', y: 160 },
    { name: 'Jeu', y: 100 },
    { name: 'Ven', y: 120 },
    { name: 'Sam', y: 80 }
  ];

  // État des dossiers
  dossiersStatus = [
    { label: 'Complets', value: 105, color: 'linear-gradient(135deg, #10b981 0%, #059669 100%)' },
    { label: 'En cours', value: 28, color: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)' },
    { label: 'En attente', value: 14, color: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)' }
  ];

  constructor(private router: Router) {}

  ngOnInit(): void {
    // Initialisation
  }

  navigateTo(route: string): void {
    this.router.navigate([route]);
  }
}
