
import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StatsService } from '../../services/stats';
import { Observable } from 'rxjs';
import { Stats, Activity } from '../../models/stats';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss'
})
export class DashboardComponent implements OnInit {
  private statsService = inject(StatsService);

  stats$!: Observable<Stats>;
  activities$!: Observable<Activity[]>;

  ngOnInit(): void {
    // Récupération des statistiques via Observable
    this.stats$ = this.statsService.getStats();
    this.activities$ = this.statsService.getRecentActivities();
  }

  // Actions rapides
  verifierMedecin(): void {
    console.log('Vérifier un médecin');
  }

  genererRapport(): void {
    console.log('Générer un rapport');
  }
}