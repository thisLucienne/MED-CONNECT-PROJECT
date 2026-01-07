import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';

interface Patient {
  id: string;
  nom: string;
  prenom: string;
  age: number;
  sexe: 'M' | 'F';
  email: string;
  telephone: string;
  adresse: string;
  dateNaissance: string;
  groupeSanguin: string;
  allergies: string[];
  conditionsChroniques: string[];
  contactUrgence: {
    nom: string;
    relation: string;
    telephone: string;
  };
  avatar?: string;
}

interface DocumentMedical {
  id: string;
  titre: string;
  type: 'resultats-labo' | 'imagerie' | 'ordonnance' | 'vaccin' | 'bilan' | 'consultation' | 'certificat';
  patientId: string;
  patient: Patient;
  dateCreation: string;
  dateModification: string;
  statut: 'nouveau' | 'consulte' | 'modifie' | 'partage';
  taille: string;
  description: string;
  fichier?: string;
  creePar: string; // ID du médecin qui a créé le document
  modifiePar?: string; // ID du médecin qui a modifié en dernier
  partageAvec?: string[]; // IDs des médecins avec qui le document est partagé
  confidentialite: 'normal' | 'confidentiel' | 'urgent';
  selected?: boolean; // Pour la sélection multiple
}

interface MedecinContact {
  id: string;
  nom: string;
  prenom: string;
  specialite: string;
  email: string;
  telephone: string;
}

@Component({
  selector: 'app-dossiers-globaux',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './dossiers-globaux.component.html',
  styleUrls: ['./dossiers-globaux.component.scss']
})
export class DossiersGlobauxComponent implements OnInit {
  // Médecin connecté (simulé)
  medecinConnecte = {
    id: 'MED001',
    nom: 'Martin',
    prenom: 'Dr. Sophie',
    specialite: 'Médecine générale'
  };

  // État de l'interface
  activeTab: 'tous' | 'nouveau' | 'resultats-labo' | 'imagerie' | 'ordonnance' | 'consultation' = 'tous';
  selectedDocument: DocumentMedical | null = null;
  showDocumentModal: boolean = false;
  showShareModal: boolean = false;
  
  // Filtres et recherche
  searchQuery: string = '';
  sortBy: 'plus-recent' | 'plus-ancien' | 'patient' | 'type' = 'plus-recent';
  filterByStatus: 'tous' | 'nouveau' | 'consulte' | 'modifie' = 'tous';
  
  // Pagination
  currentPage: number = 1;
  itemsPerPage: number = 10;

  // Données
  mesPatients: Patient[] = [
    {
      id: 'PAT001',
      nom: 'Dubois',
      prenom: 'Marie',
      age: 34,
      sexe: 'F',
      email: 'marie.dubois@email.com',
      telephone: '+33 6 12 34 56 78',
      adresse: '123 Rue de la Santé, Paris',
      dateNaissance: '15/01/1990',
      groupeSanguin: 'A+',
      allergies: ['Pénicilline', 'Arachides'],
      conditionsChroniques: ['Hypothyroïdie', 'Migraine'],
      contactUrgence: {
        nom: 'Pierre Dubois',
        relation: 'Conjoint',
        telephone: '+33 6 98 76 54 32'
      }
    },
    {
      id: 'PAT002',
      nom: 'Martin',
      prenom: 'Jean',
      age: 45,
      sexe: 'M',
      email: 'jean.martin@email.com',
      telephone: '+33 6 87 65 43 21',
      adresse: '456 Avenue de la République, Lyon',
      dateNaissance: '22/08/1979',
      groupeSanguin: 'O-',
      allergies: ['Aspirine'],
      conditionsChroniques: ['Hypertension'],
      contactUrgence: {
        nom: 'Claire Martin',
        relation: 'Épouse',
        telephone: '+33 6 11 22 33 44'
      }
    }
  ];

  // Patients connectés (ceux qui ont accepté la connexion avec le médecin)
  patientsConnectes: Patient[] = this.mesPatients; // Tous les patients sont connectés pour la démo

  // Documents partagés uniquement (respectant la logique Med-Connect)
  documents: DocumentMedical[] = [
    {
      id: 'DOC001',
      titre: 'Résultats analyse sanguine complète',
      type: 'resultats-labo',
      patientId: 'PAT001',
      patient: this.mesPatients[0],
      dateCreation: '15 mars 2024',
      dateModification: '15 mars 2024',
      statut: 'nouveau',
      taille: '2.4 MB',
      description: 'Analyse complète avec numération formule sanguine, bilan lipidique - Partagé par le patient',
      creePar: 'PAT001', // Créé par le patient
      confidentialite: 'normal',
      partageAvec: ['MED001'] // Partagé avec le médecin
    },
    {
      id: 'DOC002',
      titre: 'Consultation de suivi - Hypothyroïdie',
      type: 'consultation',
      patientId: 'PAT001',
      patient: this.mesPatients[0],
      dateCreation: '10 mars 2024',
      dateModification: '12 mars 2024',
      statut: 'modifie',
      taille: '1.8 MB',
      description: 'Rapport de consultation envoyé au patient',
      creePar: 'MED001', // Créé par le médecin
      modifiePar: 'MED001',
      confidentialite: 'normal',
      partageAvec: ['PAT001'] // Partagé avec le patient
    },
    {
      id: 'DOC003',
      titre: 'Ordonnance Levothyrox 75µg',
      type: 'ordonnance',
      patientId: 'PAT001',
      patient: this.mesPatients[0],
      dateCreation: '5 mars 2024',
      dateModification: '5 mars 2024',
      statut: 'partage',
      taille: '1.2 MB',
      description: 'Prescription envoyée au patient via la plateforme',
      creePar: 'MED001',
      partageAvec: ['PAT001'],
      confidentialite: 'normal'
    },
    {
      id: 'DOC004',
      titre: 'Bilan cardiologique complet',
      type: 'bilan',
      patientId: 'PAT002',
      patient: this.mesPatients[1],
      dateCreation: '1 mars 2024',
      dateModification: '1 mars 2024',
      statut: 'consulte',
      taille: '3.5 MB',
      description: 'ECG, échographie cardiaque - Document partagé par le patient',
      creePar: 'PAT002', // Créé par le patient
      confidentialite: 'confidentiel',
      partageAvec: ['MED001'] // Partagé avec le médecin
    }
  ];

  medecinsContacts: MedecinContact[] = [
    {
      id: 'MED002',
      nom: 'Dupont',
      prenom: 'Dr. Pierre',
      specialite: 'Cardiologie',
      email: 'pierre.dupont@hopital.fr',
      telephone: '+33 1 23 45 67 89'
    },
    {
      id: 'MED003',
      nom: 'Leroy',
      prenom: 'Dr. Anne',
      specialite: 'Endocrinologie',
      email: 'anne.leroy@clinique.fr',
      telephone: '+33 1 98 76 54 32'
    }
  ];

  // Formulaires
  newDocument = {
    titre: '',
    type: 'consultation',
    patientId: '',
    description: '',
    confidentialite: 'normal',
    fichier: null as File | null
  };

  // Nouveau formulaire pour les actions de document
  documentAction = {
    type: 'recuperer', // 'recuperer' ou 'envoyer'
    patientId: '',
    message: '',
    titre: '',
    typeDocument: '',
    description: '',
    confidentialite: 'normal',
    fichier: null as File | null
  };

  shareForm = {
    destinataire: 'patient', // 'patient' ou 'medecin'
    medecinId: '',
    message: '',
    copiePatient: false
  };

  constructor(private router: Router, private route: ActivatedRoute) {}

  ngOnInit(): void {
    // Initialisation des données
    this.applyFilters();
  }

  // Navigation methods
  navigateToPatients(): void {
    this.router.navigate(['/patients']);
  }

  navigateToMessages(patientId?: string): void {
    if (patientId) {
      this.router.navigate(['/messages'], { queryParams: { patientId } });
    } else {
      this.router.navigate(['/messages']);
    }
  }

  navigateToAgenda(): void {
    this.router.navigate(['/agenda']);
  }

  navigateToDashboard(): void {
    this.router.navigate(['/dashboard']);
  }

  navigateToPatient(patientId: string): void {
    this.router.navigate(['/patients'], { queryParams: { patientId } });
  }

  // Méthodes pour le format tableau
  getTotalDocuments(): number {
    return this.documents.length;
  }

  getNewDocuments(): number {
    return this.documents.filter(doc => doc.statut === 'nouveau').length;
  }

  getDocumentsByType(type: string): number {
    return this.documents.filter(doc => doc.type === type).length;
  }

  getFilteredDocuments(): DocumentMedical[] {
    // Ne montrer que les documents partagés (respectant la logique Med-Connect)
    let filtered = this.documents.filter(doc => 
      doc.partageAvec && (
        doc.partageAvec.includes(this.medecinConnecte.id) || // Partagé avec le médecin
        doc.partageAvec.includes(doc.patientId) // Envoyé au patient par le médecin
      )
    );

    // Filtre par onglet
    if (this.activeTab !== 'tous') {
      if (this.activeTab === 'nouveau') {
        filtered = filtered.filter(doc => doc.statut === 'nouveau');
      } else {
        filtered = filtered.filter(doc => doc.type === this.activeTab);
      }
    }

    // Filtre par recherche
    if (this.searchQuery.trim()) {
      const query = this.searchQuery.toLowerCase();
      filtered = filtered.filter(doc => 
        doc.titre.toLowerCase().includes(query) ||
        doc.description.toLowerCase().includes(query) ||
        doc.patient.nom.toLowerCase().includes(query) ||
        doc.patient.prenom.toLowerCase().includes(query)
      );
    }

    // Tri
    filtered.sort((a, b) => {
      switch (this.sortBy) {
        case 'plus-recent':
          return new Date(b.dateModification).getTime() - new Date(a.dateModification).getTime();
        case 'plus-ancien':
          return new Date(a.dateModification).getTime() - new Date(b.dateModification).getTime();
        case 'patient':
          return a.patient.nom.localeCompare(b.patient.nom);
        case 'type':
          return a.type.localeCompare(b.type);
        default:
          return 0;
      }
    });

    return filtered;
  }

  applyFilters(): void {
    // Méthode pour appliquer les filtres (appelée lors des changements)
  }

  // Gestion de la sélection
  toggleDocumentSelection(document: DocumentMedical, event: any): void {
    document.selected = event.target.checked;
  }

  toggleSelectAll(event: any): void {
    const checked = event.target.checked;
    this.getFilteredDocuments().forEach(doc => doc.selected = checked);
  }

  areAllSelected(): boolean {
    const filtered = this.getFilteredDocuments();
    return filtered.length > 0 && filtered.every(doc => doc.selected);
  }

  getSelectedDocuments(): DocumentMedical[] {
    return this.documents.filter(doc => doc.selected);
  }

  // Méthodes pour les labels et classes CSS
  getTypeLabel(type: string): string {
    switch (type) {
      case 'resultats-labo': return 'Laboratoire';
      case 'imagerie': return 'Imagerie';
      case 'ordonnance': return 'Ordonnance';
      case 'consultation': return 'Consultation';
      case 'vaccin': return 'Vaccin';
      case 'bilan': return 'Bilan';
      default: return type;
    }
  }

  getTypeClass(type: string): string {
    switch (type) {
      case 'resultats-labo': return 'laboratoire';
      case 'imagerie': return 'imagerie';
      case 'ordonnance': return 'ordonnance';
      case 'consultation': return 'consultation';
      case 'vaccin': return 'vaccin';
      case 'bilan': return 'bilan';
      default: return 'consultation';
    }
  }

  getStatusLabel(statut: string, type: string): string {
    switch (statut) {
      case 'nouveau': return 'NOUVEAU';
      case 'consulte': return 'CONSULTÉ';
      case 'modifie': return 'MODIFIÉ';
      case 'partage': return 'PARTAGÉ';
      default: return statut.toUpperCase();
    }
  }

  getStatusClass(statut: string, type: string): string {
    switch (statut) {
      case 'nouveau': return 'nouveau';
      case 'consulte': return 'consulte';
      case 'modifie': return 'modifie';
      case 'partage': return 'partage';
      default: return 'nouveau';
    }
  }

  getSecondaryStatusLabel(type: string): string {
    switch (type) {
      case 'resultats-labo': return 'LABO';
      case 'ordonnance': return 'ORDO';
      case 'consultation': return 'CONSULTATION';
      default: return '';
    }
  }

  getSecondaryStatusClass(type: string): string {
    switch (type) {
      case 'resultats-labo': return 'labo';
      case 'ordonnance': return 'ordo';
      case 'consultation': return 'consultation';
      default: return '';
    }
  }

  getSourceLabel(type: string): string {
    switch (type) {
      case 'resultats-labo': return 'Biolab Paris';
      case 'ordonnance': return 'Cabinet Médical';
      case 'imagerie': return 'Centre Imagerie';
      case 'consultation': return 'Cabinet Cardiologie';
      default: return 'Cabinet Médical';
    }
  }

  openDocumentActions(document: DocumentMedical): void {
    console.log('Actions pour:', document.titre);
    // Logique pour ouvrir le menu d'actions
  }

  // Filtrage des documents - méthode simplifiée pour le nouveau format
  setActiveTab(tab: 'tous' | 'nouveau' | 'resultats-labo' | 'imagerie' | 'ordonnance' | 'consultation'): void {
    this.activeTab = tab;
  }

  // Actions sur les documents
  selectDocument(document: DocumentMedical): void {
    this.selectedDocument = document;
    if (document.statut === 'nouveau') {
      document.statut = 'consulte';
      document.dateModification = new Date().toLocaleDateString('fr-FR');
    }
  }

  // Gestion des nouveaux documents
  openDocumentModal(): void {
    this.showDocumentModal = true;
    this.resetDocumentActionForm();
  }

  closeDocumentModal(): void {
    this.showDocumentModal = false;
    this.resetDocumentActionForm();
  }

  onFileSelected(event: any): void {
    const file = event.target.files[0];
    if (file) {
      this.documentAction.fichier = file;
    }
  }

  submitDocumentAction(): void {
    if (!this.documentAction.patientId) {
      alert('Veuillez sélectionner un patient connecté');
      return;
    }

    const patient = this.patientsConnectes.find(p => p.id === this.documentAction.patientId);
    if (!patient) {
      alert('Patient non trouvé');
      return;
    }

    if (this.documentAction.type === 'recuperer') {
      this.envoyerDemandeAcces(patient);
    } else if (this.documentAction.type === 'envoyer') {
      this.envoyerDocumentPatient(patient);
    }
  }

  private envoyerDemandeAcces(patient: Patient): void {
    // Logique pour envoyer une demande d'accès aux documents du patient
    console.log('Demande d\'accès envoyée à:', patient.prenom, patient.nom);
    console.log('Message:', this.documentAction.message);
    
    alert(`Demande d'accès envoyée à ${patient.prenom} ${patient.nom}.\n\nLe patient recevra une notification et pourra choisir de partager ses documents avec vous.`);
    
    this.closeDocumentModal();
  }

  private envoyerDocumentPatient(patient: Patient): void {
    if (!this.documentAction.titre || !this.documentAction.typeDocument) {
      alert('Veuillez remplir tous les champs obligatoires');
      return;
    }

    if (!this.documentAction.fichier) {
      alert('Veuillez sélectionner un fichier à envoyer');
      return;
    }

    // Créer un nouveau document envoyé au patient
    const newDoc: DocumentMedical = {
      id: 'DOC' + (this.documents.length + 1).toString().padStart(3, '0'),
      titre: this.documentAction.titre,
      type: this.documentAction.typeDocument as any,
      patientId: patient.id,
      patient: patient,
      dateCreation: new Date().toLocaleDateString('fr-FR'),
      dateModification: new Date().toLocaleDateString('fr-FR'),
      statut: 'partage',
      taille: this.formatFileSize(this.documentAction.fichier.size),
      description: this.documentAction.description + ' - Document envoyé au patient',
      creePar: this.medecinConnecte.id,
      confidentialite: this.documentAction.confidentialite as any,
      partageAvec: [patient.id] // Partagé avec le patient
    };

    this.documents.push(newDoc);
    
    alert(`Document "${this.documentAction.titre}" envoyé avec succès à ${patient.prenom} ${patient.nom}.\n\nLe patient recevra une notification et pourra consulter le document dans son espace personnel.`);
    
    this.closeDocumentModal();
  }

  getConnectionStatus(patientId: string): string {
    // Simuler le statut de connexion
    const statuses = ['Connecté', 'En ligne', 'Actif'];
    return statuses[Math.floor(Math.random() * statuses.length)];
  }

  // Gestion du partage
  openShareModal(document: DocumentMedical): void {
    this.selectedDocument = document;
    this.showShareModal = true;
    this.resetShareForm();
  }

  closeShareModal(): void {
    this.showShareModal = false;
    this.selectedDocument = null;
    this.resetShareForm();
  }

  shareDocument(): void {
    if (!this.selectedDocument) return;

    if (this.shareForm.destinataire === 'patient') {
      this.selectedDocument.partageAvec = this.selectedDocument.partageAvec || [];
      if (!this.selectedDocument.partageAvec.includes(this.selectedDocument.patientId)) {
        this.selectedDocument.partageAvec.push(this.selectedDocument.patientId);
      }
      alert(`Document partagé avec ${this.selectedDocument.patient.prenom} ${this.selectedDocument.patient.nom}`);
    } else if (this.shareForm.medecinId) {
      const medecin = this.medecinsContacts.find(m => m.id === this.shareForm.medecinId);
      this.selectedDocument.partageAvec = this.selectedDocument.partageAvec || [];
      if (!this.selectedDocument.partageAvec.includes(this.shareForm.medecinId)) {
        this.selectedDocument.partageAvec.push(this.shareForm.medecinId);
      }
      
      if (this.shareForm.copiePatient) {
        if (!this.selectedDocument.partageAvec.includes(this.selectedDocument.patientId)) {
          this.selectedDocument.partageAvec.push(this.selectedDocument.patientId);
        }
      }
      
      alert(`Document partagé avec ${medecin?.prenom} ${medecin?.nom}${this.shareForm.copiePatient ? ' et le patient' : ''}`);
    }

    this.selectedDocument.statut = 'partage';
    this.selectedDocument.dateModification = new Date().toLocaleDateString('fr-FR');
    this.closeShareModal();
  }

  // Utilitaires
  private resetShareForm(): void {
    this.shareForm = {
      destinataire: 'patient',
      medecinId: '',
      message: '',
      copiePatient: false
    };
  }

  private resetDocumentActionForm(): void {
    this.documentAction = {
      type: 'recuperer',
      patientId: '',
      message: '',
      titre: '',
      typeDocument: '',
      description: '',
      confidentialite: 'normal',
      fichier: null
    };
  }

  private formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  }
}