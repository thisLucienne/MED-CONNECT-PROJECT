import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

interface NotificationSetting {
  id: string;
  title: string;
  description: string;
  enabled: boolean;
  type: 'email' | 'push' | 'sms';
}

interface SecuritySetting {
  id: string;
  title: string;
  description: string;
  enabled: boolean;
  status: 'active' | 'inactive' | 'pending';
}

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.scss']
})
export class SettingsComponent implements OnInit {
  
  activeTab = 'profile';
  
  // Profil médecin
  doctorProfile = {
    nom: 'Martin',
    prenom: 'Dr. Sophie',
    specialite: 'Médecine générale',
    numeroOrdre: 'RPPS123456789',
    telephone: '+33 1 23 45 67 89',
    email: 'sophie.martin@medecin.fr',
    adresse: '123 Rue de la Santé, 75014 Paris',
    experience: '15 ans',
    langues: ['Français', 'Anglais', 'Espagnol'],
    diplomes: ['Doctorat en Médecine - Université Paris Descartes', 'DES Médecine Générale'],
    bio: 'Médecin généraliste avec 15 ans d\'expérience, spécialisée dans le suivi des maladies chroniques et la médecine préventive.'
  };

  // Paramètres de notification
  notificationSettings: NotificationSetting[] = [
    {
      id: 'new-message',
      title: 'Nouveaux messages',
      description: 'Recevoir une notification pour chaque nouveau message patient',
      enabled: true,
      type: 'push'
    },
    {
      id: 'appointment-reminder',
      title: 'Rappels de rendez-vous',
      description: 'Notifications 30 minutes avant chaque rendez-vous',
      enabled: true,
      type: 'email'
    },
    {
      id: 'urgent-documents',
      title: 'Documents urgents',
      description: 'Alerte immédiate pour les documents marqués comme urgents',
      enabled: true,
      type: 'sms'
    },
    {
      id: 'weekly-report',
      title: 'Rapport hebdomadaire',
      description: 'Résumé des activités de la semaine chaque lundi',
      enabled: false,
      type: 'email'
    },
    {
      id: 'patient-requests',
      title: 'Demandes de connexion',
      description: 'Notification lors de nouvelles demandes de patients',
      enabled: true,
      type: 'push'
    }
  ];

  // Paramètres de sécurité
  securitySettings: SecuritySetting[] = [
    {
      id: '2fa',
      title: 'Authentification à deux facteurs',
      description: 'Protection supplémentaire avec code SMS ou application',
      enabled: true,
      status: 'active'
    },
    {
      id: 'session-timeout',
      title: 'Déconnexion automatique',
      description: 'Déconnexion après 30 minutes d\'inactivité',
      enabled: true,
      status: 'active'
    },
    {
      id: 'login-alerts',
      title: 'Alertes de connexion',
      description: 'Notification par email lors de nouvelles connexions',
      enabled: false,
      status: 'inactive'
    },
    {
      id: 'data-encryption',
      title: 'Chiffrement des données',
      description: 'Chiffrement end-to-end des communications',
      enabled: true,
      status: 'active'
    }
  ];

  // Préférences d'interface
  interfaceSettings = {
    theme: 'light',
    language: 'fr',
    timezone: 'Europe/Paris',
    dateFormat: 'DD/MM/YYYY',
    timeFormat: '24h',
    density: 'comfortable'
  };

  constructor(private router: Router) {}

  ngOnInit(): void {}

  setActiveTab(tab: string): void {
    this.activeTab = tab;
  }

  saveProfile(): void {
    console.log('Sauvegarde du profil...', this.doctorProfile);
    // Logique de sauvegarde à implémenter
    this.showSuccessMessage('Profil mis à jour avec succès');
  }

  saveNotifications(): void {
    console.log('Sauvegarde des notifications...', this.notificationSettings);
    // Logique de sauvegarde à implémenter
    this.showSuccessMessage('Préférences de notification mises à jour');
  }

  saveSecurity(): void {
    console.log('Sauvegarde de la sécurité...', this.securitySettings);
    // Logique de sauvegarde à implémenter
    this.showSuccessMessage('Paramètres de sécurité mis à jour');
  }

  saveInterface(): void {
    console.log('Sauvegarde de l\'interface...', this.interfaceSettings);
    // Logique de sauvegarde à implémenter
    this.showSuccessMessage('Préférences d\'interface mises à jour');
  }

  toggleNotification(setting: NotificationSetting): void {
    setting.enabled = !setting.enabled;
    console.log(`Notification ${setting.id} ${setting.enabled ? 'activée' : 'désactivée'}`);
  }

  toggleSecurity(setting: SecuritySetting): void {
    setting.enabled = !setting.enabled;
    setting.status = setting.enabled ? 'active' : 'inactive';
    console.log(`Sécurité ${setting.id} ${setting.enabled ? 'activée' : 'désactivée'}`);
  }

  setup2FA(): void {
    console.log('Configuration 2FA...');
    // Logique de configuration 2FA à implémenter
  }

  changePassword(): void {
    console.log('Changement de mot de passe...');
    // Logique de changement de mot de passe à implémenter
  }

  exportData(): void {
    console.log('Export des données...');
    // Logique d'export à implémenter
  }

  deleteAccount(): void {
    if (confirm('Êtes-vous sûr de vouloir supprimer votre compte ? Cette action est irréversible.')) {
      console.log('Suppression du compte...');
      // Logique de suppression à implémenter
    }
  }

  navigateToDashboard(): void {
    this.router.navigate(['/dashboard']);
  }

  private showSuccessMessage(message: string): void {
    // Logique d'affichage de message de succès à implémenter
    console.log('Succès:', message);
  }
}