/**
 * EXPLICATION :
 * Ce composant est le "CONTROLLER" dans l'architecture MVC.
 * Il fait le lien entre la Vue (HTML) et le Modèle (Service).
 * 
 * Standalone: true = Composant autonome (nouveau dans Angular 17+)
 * Plus besoin de NgModule !
 * 
 * Imports nécessaires :
 * - CommonModule : Pour les directives *ngIf, *ngFor
 * - FormsModule : Pour le [(ngModel)] dans les formulaires
 */

import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MedecinService } from '../../services/medecin';
import { ThemeService } from '../../services/theme.service';
import { Observable } from 'rxjs';
import { Medecin, MedecinForm, SPECIALITES } from '../../models/medecin';

@Component({
  selector: 'app-medecins',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './medecins.html',
  styleUrl: './medecins.scss'
})
export class MedecinsComponent implements OnInit {

  /**
   * Injection du service MedecinService
   * inject() est la nouvelle façon d'injecter (au lieu du constructor)
   */
  private medecinService = inject(MedecinService);
  private themeService = inject(ThemeService);

  /**
   * Observable pour la liste des médecins
   * Le $ à la fin est une convention pour indiquer que c'est un Observable
   * 
   * Dans le HTML, on utilise le pipe async pour s'abonner :
   * <div *ngFor="let medecin of medecins$ | async">
   */
  medecins$!: Observable<Medecin[]>;
  
  /**
   * Observable pour les médecins en attente de validation
   */
  pendingMedecins$!: Observable<Medecin[]>;

  /**
   * Statistiques des médecins
   */
  get medecinStats() {
    return this.medecinService.getMedecinStats();
  }

  // Accès au service de thème
  get isDarkMode() {
    return this.themeService.darkMode;
  }

  /**
   * État de l'interface utilisateur
   */
  showForm: boolean = false;           // Afficher/masquer le formulaire modal
  isEditing: boolean = false;          // Mode édition ou ajout
  editingMedecinId: string | null = null;  // ID du médecin en cours d'édition

  /**
   * Données du formulaire
   * On utilise l'interface MedecinForm pour typer
   */
  medecinForm: MedecinForm = this.getEmptyForm();

  /**
   * Recherche et filtres
   */
  searchQuery: string = '';
  selectedSpecialite: string = '';

  /**
   * Liste des spécialités (importée du modèle)
   * Accessible dans le template HTML
   */
  specialites = SPECIALITES;

  /**
   * Cycle de vie Angular : ngOnInit()
   * S'exécute après la création du composant
   * C'est ici qu'on charge les données initiales
   */
  ngOnInit(): void {
    this.loadMedecins();
    this.loadPendingMedecins();
  }

  /**
   * Charge la liste des médecins
   * Applique les filtres de recherche si nécessaire
   */
  loadMedecins(): void {
    if (this.searchQuery.trim()) {
      // Si recherche active, utilise la méthode de recherche
      this.medecins$ = this.medecinService.searchMedecins(this.searchQuery);
    } else if (this.selectedSpecialite) {
      // Si filtre spécialité actif
      this.medecins$ = this.medecinService.getMedecinsBySpecialite(this.selectedSpecialite);
    } else {
      // Sinon, charge tous les médecins
      this.medecins$ = this.medecinService.getMedecins();
    }
  }

  /**
   * Charge les médecins en attente de validation
   */
  loadPendingMedecins(): void {
    this.pendingMedecins$ = this.medecinService.getPendingMedecins();
  }

  /**
   * Gestion de la recherche
   * Appelée à chaque saisie dans le champ de recherche
   */
  onSearch(): void {
    this.loadMedecins();
  }

  /**
   * Filtre par spécialité
   */
  onFilterBySpecialite(): void {
    this.loadMedecins();
  }

  /**
   * Réinitialise tous les filtres
   */
  resetFilters(): void {
    this.searchQuery = '';
    this.selectedSpecialite = '';
    this.loadMedecins();
  }

  /**
   * Ouvre le formulaire d'ajout
   */
  openAddForm(): void {
    this.showForm = true;
    this.isEditing = false;
    this.medecinForm = this.getEmptyForm();
  }

  /**
   * Ferme le formulaire
   */
  closeForm(): void {
    this.showForm = false;
    this.isEditing = false;
    this.editingMedecinId = null;
    this.medecinForm = this.getEmptyForm();
  }

  /**
   * Soumet le formulaire (ajout ou modification)
   */
  onSubmit(): void {
    // Validation
    if (!this.validateForm()) {
      alert('Veuillez remplir tous les champs obligatoires');
      return;
    }

    if (this.isEditing && this.editingMedecinId) {
      // Mode édition
      this.medecinService.updateMedecin(this.editingMedecinId, this.medecinForm as Medecin);
      alert('Médecin mis à jour avec succès !');
    } else {
      // Mode ajout
      this.medecinService.addMedecin(this.medecinForm);
      alert('Médecin ajouté avec succès ! En attente de vérification.');
    }

    this.closeForm();
    this.loadMedecins();
  }

  /**
   * Éditer un médecin
   * Remplit le formulaire avec les données du médecin
   */
  editMedecin(medecin: Medecin): void {
    this.showForm = true;
    this.isEditing = true;
    this.editingMedecinId = medecin.id;

    // Copie les données du médecin dans le formulaire
    this.medecinForm = {
      nom: medecin.nom,
      prenom: medecin.prenom,
      specialite: medecin.specialite,
      telephone: medecin.telephone,
      email: medecin.email,
      numeroOrdre: medecin.numeroOrdre
    };
  }

  /**
   * Supprime un médecin
   * Demande confirmation avant suppression
   */
  deleteMedecin(medecin: Medecin): void {
    const confirmation = confirm(
      `Êtes-vous sûr de vouloir supprimer Dr. ${medecin.prenom} ${medecin.nom} ?`
    );

    if (confirmation) {
      this.medecinService.deleteMedecin(medecin.id);
      alert('Médecin supprimé avec succès !');
      this.loadMedecins();
    }
  }

  /**
   * Change le statut actif/inactif
   */
  toggleStatus(medecin: Medecin): void {
    this.medecinService.toggleMedecinStatus(medecin.id);
  }

  /**
   * Vérifie un médecin (passe verified à true)
   */
  verifyMedecin(medecin: Medecin): void {
    const confirmation = confirm(
      `Voulez-vous vérifier le compte de Dr. ${medecin.prenom} ${medecin.nom} ?`
    );

    if (confirmation) {
      this.medecinService.verifyMedecin(medecin.id);
      alert('Médecin vérifié avec succès !');
    }
  }

  /**
   * Approuve un médecin en attente
   * Change le statut à 'actif' et verified à true
   */
  approveMedecin(medecin: Medecin): void {
    const confirmation = confirm(
      `Voulez-vous approuver Dr. ${medecin.prenom} ${medecin.nom} ?\n\nCela activera son compte et lui donnera accès à la plateforme.`
    );

    if (confirmation) {
      this.medecinService.approveMedecin(medecin.id);
      alert(`Dr. ${medecin.prenom} ${medecin.nom} a été approuvé avec succès !`);
      this.loadPendingMedecins();
      this.loadMedecins();
    }
  }

  /**
   * Rejette un médecin en attente
   * Supprime le médecin de la base de données
   */
  rejectMedecin(medecin: Medecin): void {
    const confirmation = confirm(
      `Êtes-vous sûr de vouloir rejeter la demande de Dr. ${medecin.prenom} ${medecin.nom} ?\n\nCette action supprimera définitivement son compte.`
    );

    if (confirmation) {
      const reason = prompt('Raison du rejet (optionnel):');
      this.medecinService.rejectMedecin(medecin.id, reason || '');
      alert(`La demande de Dr. ${medecin.prenom} ${medecin.nom} a été rejetée.`);
      this.loadPendingMedecins();
    }
  }

  /**
   * Suspend un médecin
   * Change le statut à 'suspendu'
   */
  suspendMedecin(medecin: Medecin): void {
    const confirmation = confirm(
      `Êtes-vous sûr de vouloir suspendre Dr. ${medecin.prenom} ${medecin.nom} ?\n\nCela désactivera temporairement son accès à la plateforme.`
    );

    if (confirmation) {
      const reason = prompt('Raison de la suspension (optionnel):');
      this.medecinService.suspendMedecin(medecin.id, reason || '');
      alert(`Dr. ${medecin.prenom} ${medecin.nom} a été suspendu.`);
      this.loadMedecins();
    }
  }

  /**
   * Validation du formulaire
   * Vérifie que tous les champs requis sont remplis
   */
  private validateForm(): boolean {
    return !!(
      this.medecinForm.nom &&
      this.medecinForm.prenom &&
      this.medecinForm.specialite &&
      this.medecinForm.telephone &&
      this.medecinForm.email &&
      this.medecinForm.numeroOrdre
    );
  }

  /**
   * Retourne un formulaire vide
   */
  private getEmptyForm(): MedecinForm {
    return {
      nom: '',
      prenom: '',
      specialite: '',
      telephone: '',
      email: '',
      numeroOrdre: ''
    };
  }

  /**
   * Calcule l'âge à partir de la date de naissance
   */
  calculateAge(dateNaissance: string): number {
    const today = new Date();
    const birthDate = new Date(dateNaissance);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();

    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }

    return age;
  }
}