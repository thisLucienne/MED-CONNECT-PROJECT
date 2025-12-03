import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { Stats, Activity } from '../models/stats';

@Injectable({
  providedIn: 'root'
})
export class StatsService {
  // BehaviorSubject pour les statistiques (programmation réactive - CHAP 3)
  private stats$: BehaviorSubject<Stats> = new BehaviorSubject<Stats>({
    totalPatients: 2847,
    patientsGrowth: 12.5,
    medecinsActifs: 342,
    medecinsGrowth: 8.2,
    dossiersMedicaux: 15234,
    dossiersGrowth: 24.3,
    consultations: 1284,
    consultationsGrowth: 5.7
  });

  // BehaviorSubject pour les activités récentes
  private activities$: BehaviorSubject<Activity[]> = new BehaviorSubject<Activity[]>([
    {
      id: 1,
      description: 'Nouveau patient inscrit: Marie Dubois',
      time: 'Il y a 5 minutes',
      isRecent: true
    },
    {
      id: 2,
      description: 'Dr. Jean Martin a validé son compte',
      time: 'Il y a 15 minutes',
      isRecent: true
    },
    {
      id: 3,
      description: '12 nouveaux dossiers médicaux créés',
      time: 'Il y a 1 heure',
      isRecent: false
    },
    {
      id: 4,
      description: 'Rapport mensuel généré avec succès',
      time: 'Il y a 2 heures',
      isRecent: false
    },
    {
      id: 5,
      description: 'Dr. Sophie Laurent a rejoint la plateforme',
      time: 'Il y a 3 heures',
      isRecent: false
    }
  ]);

  constructor() { }

  // Récupérer les statistiques (Observable)
  getStats(): Observable<Stats> {
    return this.stats$.asObservable();
  }

  // Mettre à jour les statistiques
  updateStats(newStats: Stats): void {
    this.stats$.next(newStats);
  }

  // Récupérer les activités récentes
  getRecentActivities(): Observable<Activity[]> {
    return this.activities$.asObservable();
  }

  // Ajouter une nouvelle activité
  addActivity(activity: Activity): void {
    const currentActivities = this.activities$.value;
    this.activities$.next([activity, ...currentActivities]);
  }

  // Simuler une mise à jour en temps réel (pour démo)
  simulateRealTimeUpdate(): void {
    setInterval(() => {
      const currentStats = this.stats$.value;
      this.updateStats({
        ...currentStats,
        totalPatients: currentStats.totalPatients + Math.floor(Math.random() * 3),
        consultations: currentStats.consultations + Math.floor(Math.random() * 2)
      });
    }, 10000); // Mise à jour toutes les 10 secondes
  }
}