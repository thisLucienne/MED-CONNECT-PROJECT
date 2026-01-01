/**
 * EXPLICATION :
 * Page de paramètres avec navigation par onglets.
 * 
 * Sections :
 * 1. Profil Admin
 * 2. Notifications
 * 3. Sécurité
 * 4. Apparence
 * 5. Système
 * 
 * Chaque section a ses propres paramètres et formulaires.
 */

import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Observable } from 'rxjs';
import { ParametreService } from '../../services/parametre';
import {
  AdminProfile,
  NotificationSettings,
  SecuritySettings,
  AppearanceSettings,
  SystemSettings,
  LANGUES,
  FUSEAUX_HORAIRES,
  FORMATS_DATE
} from '../../models/parametre';

@Component({
  selector: 'app-parametres',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './parametres.html',
  styleUrl: './parametres.scss'
})
export class ParametresComponent implements OnInit {
  private parametreService = inject(ParametreService);

  // Onglet actif
  activeTab: 'profil' | 'notifications' | 'securite' | 'apparence' | 'systeme' = 'profil';

  // Observables pour chaque section
  adminProfile$!: Observable<AdminProfile>;
  notificationSettings$!: Observable<NotificationSettings>;
  securitySettings$!: Observable<SecuritySettings>;
  appearanceSettings$!: Observable<AppearanceSettings>;
  systemSettings$!: Observable<SystemSettings>;
  usageStats$!: Observable<any>;

  // Formulaires locaux (pour édition)
  profileForm: Partial<AdminProfile> = {};
  passwordForm = {
    oldPassword: '',
    newPassword: '',
    confirmPassword: ''
  };

  // Options pour les selects
  langues = LANGUES;
  fuseauxHoraires = FUSEAUX_HORAIRES;
  formatsDate = FORMATS_DATE;

  // États UI
  isEditingProfile = false;
  showPasswordModal = false;

  ngOnInit(): void {
    this.loadSettings();
  }

  /**
   * Charge tous les paramètres
   */
  loadSettings(): void {
    this.adminProfile$ = this.parametreService.getAdminProfile();
    this.notificationSettings$ = this.parametreService.getNotificationSettings();
    this.securitySettings$ = this.parametreService.getSecuritySettings();
    this.appearanceSettings$ = this.parametreService.getAppearanceSettings();
    this.systemSettings$ = this.parametreService.getSystemSettings();
    this.usageStats$ = this.parametreService.getUsageStats();
  }

  /**
   * Change d'onglet
   */
  switchTab(tab: 'profil' | 'notifications' | 'securite' | 'apparence' | 'systeme'): void {
    this.activeTab = tab;
  }

  // ========== PROFIL ADMIN ==========

  /**
   * Active le mode édition du profil
   */
  editProfile(profile: AdminProfile): void {
    this.isEditingProfile = true;
    this.profileForm = { ...profile };
  }

  /**
   * Annule l'édition du profil
   */
  cancelProfileEdit(): void {
    this.isEditingProfile = false;
    this.profileForm = {};
  }

  /**
   * Sauvegarde le profil
   */
  saveProfile(): void {
    this.parametreService.updateAdminProfile(this.profileForm);
    this.isEditingProfile = false;
    this.profileForm = {};
    alert('Profil mis à jour avec succès !');
  }

  /**
   * Ouvre le modal de changement de mot de passe
   */
  openPasswordModal(): void {
    this.showPasswordModal = true;
  }

  /**
   * Ferme le modal de mot de passe
   */
  closePasswordModal(): void {
    this.showPasswordModal = false;
    this.passwordForm = {
      oldPassword: '',
      newPassword: '',
      confirmPassword: ''
    };
  }

  /**
   * Change le mot de passe
   */
  changePassword(): void {
    // Validation
    if (!this.passwordForm.oldPassword || !this.passwordForm.newPassword) {
      alert('Veuillez remplir tous les champs');
      return;
    }

    if (this.passwordForm.newPassword !== this.passwordForm.confirmPassword) {
      alert('Les mots de passe ne correspondent pas');
      return;
    }

    if (this.passwordForm.newPassword.length < 8) {
      alert('Le mot de passe doit contenir au moins 8 caractères');
      return;
    }

    this.parametreService.changePassword(
      this.passwordForm.oldPassword,
      this.passwordForm.newPassword
    ).subscribe(success => {
      if (success) {
        alert('Mot de passe changé avec succès !');
        this.closePasswordModal();
      } else {
        alert('Erreur lors du changement de mot de passe');
      }
    });
  }

  // ========== NOTIFICATIONS ==========

  /**
   * Met à jour un paramètre de notification
   */
  updateNotification(key: keyof NotificationSettings, value: boolean): void {
    this.parametreService.updateNotificationSettings({ [key]: value });
  }

  // ========== SÉCURITÉ ==========

  /**
   * Met à jour un paramètre de sécurité
   */
  updateSecurity(key: keyof SecuritySettings, value: any): void {
    this.parametreService.updateSecuritySettings({ [key]: value });
  }

  // ========== APPARENCE ==========

  /**
   * Met à jour un paramètre d'apparence
   */
  updateAppearance(key: keyof AppearanceSettings, value: any): void {
    this.parametreService.updateAppearanceSettings({ [key]: value });
  }

  // ========== SYSTÈME ==========

  /**
   * Met à jour un paramètre système
   */
  updateSystem(key: keyof SystemSettings, value: any): void {
    this.parametreService.updateSystemSettings({ [key]: value });
  }

  /**
   * Lance une sauvegarde manuelle
   */
  triggerBackup(): void {
    if (confirm('Lancer une sauvegarde manuelle maintenant ?')) {
      this.parametreService.triggerBackup().subscribe(success => {
        if (success) {
          alert('✅ Sauvegarde effectuée avec succès !');
        }
      });
    }
  }

  /**
   * Bascule le mode maintenance
   */
  toggleMaintenanceMode(event: any): void {
    const active = event.target.checked;

    if (active) {
      const confirmation = confirm(
        '⚠️ Activer le mode maintenance ?\nLes utilisateurs ne pourront plus accéder à l\'application.'
      );

      if (!confirmation) {
        event.target.checked = false;
        return;
      }
    }

    this.parametreService.toggleMaintenanceMode(active);
    alert(active ? '🔧 Mode maintenance activé' : '✅ Mode maintenance désactivé');
  }

  // ========== ACTIONS GLOBALES ==========

  /**
   * Réinitialise tous les paramètres
   */
  resetSettings(): void {
    this.parametreService.resetToDefaults();
    this.loadSettings();
  }

  /**
   * Exporte les paramètres
   */
  exportSettings(): void {
    this.parametreService.exportSettings();
    alert('📥 Paramètres exportés avec succès !');
  }

  /**
   * Vide le cache
   */
  clearCache(): void {
    if (confirm('Vider le cache de l\'application ?')) {
      localStorage.clear();
      alert('🗑️ Cache vidé avec succès !');
      window.location.reload();
    }
  }
}