
import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PatientService } from '../../services/patient';
import { Observable } from 'rxjs';
import { Patient, PatientForm } from '../../models/patient';

@Component({
  selector: 'app-patients',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './patients.html',
  styleUrl: './patients.scss'
})
export class PatientsComponent implements OnInit {
  private patientService = inject(PatientService);

  // Observables
  patients$!: Observable<Patient[]>;

  // État du formulaire
  showForm: boolean = false;
  isEditing: boolean = false;
  editingPatientId: string | null = null;

  // Formulaire
  patientForm: PatientForm = this.getEmptyForm();

  // Recherche
  searchQuery: string = '';

  ngOnInit(): void {
    this.loadPatients();
  }

  // Charger la liste des patients
  loadPatients(): void {
    if (this.searchQuery.trim()) {
      this.patients$ = this.patientService.searchPatients(this.searchQuery);
    } else {
      this.patients$ = this.patientService.getPatients();
    }
  }

  // Rechercher des patients
  onSearch(): void {
    this.loadPatients();
  }

  // Ouvrir le formulaire d'ajout
  openAddForm(): void {
    this.showForm = true;
    this.isEditing = false;
    this.patientForm = this.getEmptyForm();
  }

  // Fermer le formulaire
  closeForm(): void {
    this.showForm = false;
    this.isEditing = false;
    this.editingPatientId = null;
    this.patientForm = this.getEmptyForm();
  }

  // Soumettre le formulaire
  onSubmit(): void {
    // Validation basique
    if (!this.validateForm()) {
      alert('Veuillez remplir tous les champs obligatoires');
      return;
    }

    if (this.isEditing && this.editingPatientId) {
      // Mise à jour
      this.patientService.updatePatient(this.editingPatientId, this.patientForm as Patient);
      alert('Patient mis à jour avec succès !');
    } else {
      // Ajout
      this.patientService.addPatient(this.patientForm);
      alert('Patient ajouté avec succès !');
    }

    this.closeForm();
    this.loadPatients();
  }

  // Éditer un patient
  editPatient(patient: Patient): void {
    this.showForm = true;
    this.isEditing = true;
    this.editingPatientId = patient.id;
    this.patientForm = {
      nom: patient.nom,
      prenom: patient.prenom,
      dateNaissance: patient.dateNaissance,
      sexe: patient.sexe,
      telephone: patient.telephone,
      email: patient.email,
      adresse: patient.adresse,
      numeroSecuriteSociale: patient.numeroSecuriteSociale,
      groupeSanguin: patient.groupeSanguin
    };
  }

  // Supprimer un patient
  deletePatient(patient: Patient): void {
    if (confirm(`Êtes-vous sûr de vouloir supprimer ${patient.prenom} ${patient.nom} ?`)) {
      this.patientService.deletePatient(patient.id);
      alert('Patient supprimé avec succès !');
      this.loadPatients();
    }
  }

  // Changer le statut
  toggleStatus(patient: Patient): void {
    this.patientService.togglePatientStatus(patient.id);
  }

  // Validation du formulaire
  private validateForm(): boolean {
    return !!(
      this.patientForm.nom &&
      this.patientForm.prenom &&
      this.patientForm.dateNaissance &&
      this.patientForm.sexe &&
      this.patientForm.telephone &&
      this.patientForm.email
    );
  }

  // Formulaire vide
  private getEmptyForm(): PatientForm {
    return {
      nom: '',
      prenom: '',
      dateNaissance: '',
      sexe: '',
      telephone: '',
      email: '',
      adresse: '',
      numeroSecuriteSociale: '',
      groupeSanguin: ''
    };
  }

  // Calculer l'âge
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