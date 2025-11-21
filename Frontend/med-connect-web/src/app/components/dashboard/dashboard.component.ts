import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NavbarComponent } from '../navbar/navbar.component';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
  standalone: true,
  imports: [CommonModule, NavbarComponent]
})
export class DashboardComponent implements OnInit {
  // Statistiques
  patientStats = {
    total: 147,
    trend: '+12%',
    change: 'par rapport au mois dernier'
  };

  consultationStats = {
    total: 285,
    trend: '+8%',
    change: 'par rapport au mois dernier'
  };

  appointmentStats = {
    total: 35,
    trend: '+5%',
    change: 'pour cette semaine'
  };

  // Données pour les graphiques
  patientsChart = {
    labels: ['Sem 1', 'Sem 2', 'Sem 3', 'Sem 4'],
    values: [120, 135, 128, 147]
  };

  consultationsChart = {
    labels: ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Jun'],
    values: [240, 260, 245, 280, 270, 285]
  };

  appointmentsChart = {
    labels: ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven'],
    values: [8, 10, 7, 12, 9]
  };

  messagesStats = {
    total: 128,
    unread: '5 non lus'
  };

  incompleteRecords = {
    total: 12,
    alert: 'En attente de documentation'
  };

  teleconsultations = {
    total: 42,
    tooltip: 'Cliquez pour voir les détails'
  };

  constructor() {}

  ngOnInit(): void {}

  viewDetails(section: string): void {
    console.log('Afficher les détails pour:', section);
  }
}
