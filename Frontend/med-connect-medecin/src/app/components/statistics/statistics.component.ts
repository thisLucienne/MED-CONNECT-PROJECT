import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

interface StatisticCard {
  title: string;
  value: string;
  change: string;
  changeType: 'positive' | 'negative' | 'neutral';
  icon: string;
  color: string;
}

interface ChartData {
  label: string;
  value: number;
  color: string;
}

@Component({
  selector: 'app-statistics',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './statistics.component.html',
  styleUrls: ['./statistics.component.scss']
})
export class StatisticsComponent implements OnInit {
  
  selectedPeriod = 'month';
  selectedChart = 'patients';

  statisticCards: StatisticCard[] = [
    {
      title: 'Patients Totaux',
      value: '147',
      change: '+12%',
      changeType: 'positive',
      icon: 'users',
      color: 'blue'
    },
    {
      title: 'Consultations',
      value: '285',
      change: '+8%',
      changeType: 'positive',
      icon: 'calendar',
      color: 'green'
    },
    {
      title: 'Revenus',
      value: '45,230€',
      change: '+15%',
      changeType: 'positive',
      icon: 'euro',
      color: 'purple'
    },
    {
      title: 'Satisfaction',
      value: '4.8/5',
      change: '+0.2',
      changeType: 'positive',
      icon: 'star',
      color: 'orange'
    }
  ];

  patientsData: ChartData[] = [
    { label: 'Jan', value: 120, color: '#3b82f6' },
    { label: 'Fév', value: 135, color: '#3b82f6' },
    { label: 'Mar', value: 147, color: '#3b82f6' },
    { label: 'Avr', value: 142, color: '#3b82f6' },
    { label: 'Mai', value: 155, color: '#3b82f6' },
    { label: 'Juin', value: 168, color: '#3b82f6' }
  ];

  consultationsData: ChartData[] = [
    { label: 'Lun', value: 45, color: '#10b981' },
    { label: 'Mar', value: 52, color: '#10b981' },
    { label: 'Mer', value: 38, color: '#10b981' },
    { label: 'Jeu', value: 61, color: '#10b981' },
    { label: 'Ven', value: 49, color: '#10b981' },
    { label: 'Sam', value: 28, color: '#10b981' },
    { label: 'Dim', value: 12, color: '#10b981' }
  ];

  pathologiesData: ChartData[] = [
    { label: 'Hypertension', value: 45, color: '#ef4444' },
    { label: 'Diabète', value: 38, color: '#f59e0b' },
    { label: 'Asthme', value: 32, color: '#8b5cf6' },
    { label: 'Migraine', value: 28, color: '#ec4899' },
    { label: 'Arthrose', value: 24, color: '#14b8a6' },
    { label: 'Autres', value: 67, color: '#6b7280' }
  ];

  constructor(private router: Router) {}

  ngOnInit(): void {}

  navigateToPatients(): void {
    this.router.navigate(['/patients']);
  }

  navigateToAgenda(): void {
    this.router.navigate(['/agenda']);
  }

  navigateToDashboard(): void {
    this.router.navigate(['/dashboard']);
  }

  exportReport(): void {
    console.log('Export rapport...');
    // Logique d'export à implémenter
  }

  generateReport(): void {
    console.log('Génération rapport...');
    // Logique de génération à implémenter
  }

  getMaxValue(data: ChartData[]): number {
    return Math.max(...data.map(d => d.value));
  }

  getPercentage(value: number, max: number): number {
    return (value / max) * 100;
  }
}