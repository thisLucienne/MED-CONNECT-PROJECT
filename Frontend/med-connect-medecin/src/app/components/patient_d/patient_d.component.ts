import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

interface Patient {
  id: string;
  name: string;
  age: number;
  lastConsultation: string;
  conditions: string[];
  status: 'Actif' | 'Urgent' | 'En attente';
  avatar: string;
  selected?: boolean;
}

interface PatientRequest {
  id: string;
  name: string;
  age: number;
  reason: string;
  requestDate: string;
  avatar: string;
}

@Component({
  selector: 'app-patient-d',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './patient_d.component.html',
  styleUrls: ['./patient_d.component.scss']
})
export class PatientDComponent implements OnInit {
  searchQuery = '';
  currentFilter = 'all';
  viewMode: 'grid' | 'list' = 'grid';
  showAddPatientModal = false;

  patients: Patient[] = [
    {
      id: 'MD-1892',
      name: 'Bernard Julien',
      age: 45,
      lastConsultation: '24 Mars 2024',
      conditions: ['Diabète Type 2', 'HTA'],
      status: 'Urgent',
      avatar: 'assets/images/logo.png'
    },
    {
      id: 'MD-2847',
      name: 'Marie Dubois',
      age: 34,
      lastConsultation: '22 Mars 2024',
      conditions: ['Hypothyroïdie'],
      status: 'Actif',
      avatar: 'assets/images/logo.png'
    },
    {
      id: 'MD-4128',
      name: 'Anne Legrand',
      age: 29,
      lastConsultation: '01 Mars 2024',
      conditions: ['Asthme'],
      status: 'Actif',
      avatar: 'assets/images/logo.png'
    },
    {
      id: 'MD-1523',
      name: 'Jean Martin',
      age: 56,
      lastConsultation: '02 Avril 2024',
      conditions: ['Post-Chirurgie'],
      status: 'Actif',
      avatar: 'assets/images/logo.png'
    },
    {
      id: 'MD-3456',
      name: 'Sophie Laurent',
      age: 42,
      lastConsultation: '20 Mars 2024',
      conditions: ['Migraine chronique'],
      status: 'Actif',
      avatar: 'assets/images/logo.png'
    },
    {
      id: 'MD-7890',
      name: 'Pierre Durand',
      age: 67,
      lastConsultation: '25 Mars 2024',
      conditions: ['Insuffisance cardiaque', 'Diabète'],
      status: 'Urgent',
      avatar: 'assets/images/logo.png'
    },
    {
      id: 'MD-5678',
      name: 'Claire Petit',
      age: 31,
      lastConsultation: '18 Mars 2024',
      conditions: ['Grossesse'],
      status: 'Actif',
      avatar: 'assets/images/logo.png'
    },
    {
      id: 'MD-9012',
      name: 'Lucas Blanc',
      age: 28,
      lastConsultation: '15 Mars 2024',
      conditions: ['Allergie'],
      status: 'Actif',
      avatar: 'assets/images/logo.png'
    }
  ];

  pendingPatientRequests: PatientRequest[] = [
    {
      id: 'REQ-001',
      name: 'Emma Rousseau',
      age: 38,
      reason: 'Suivi diabète',
      requestDate: '20 Mars 2024',
      avatar: 'assets/images/logo.png'
    },
    {
      id: 'REQ-002',
      name: 'Thomas Bernard',
      age: 52,
      reason: 'Consultation cardiologie',
      requestDate: '19 Mars 2024',
      avatar: 'assets/images/logo.png'
    },
    {
      id: 'REQ-003',
      name: 'Julie Moreau',
      age: 26,
      reason: 'Suivi grossesse',
      requestDate: '18 Mars 2024',
      avatar: 'assets/images/logo.png'
    }
  ];

  filteredPatients: Patient[] = [];

  constructor(private router: Router) {}

  ngOnInit(): void {
    this.filterPatients();
  }

  get totalPatients(): number {
    return this.patients.length;
  }

  get activePatients(): number {
    return this.patients.filter(p => p.status === 'Actif').length;
  }

  get urgentCases(): number {
    return this.patients.filter(p => p.status === 'Urgent').length;
  }

  get pendingRequests(): number {
    return this.pendingPatientRequests.length;
  }

  filterPatients(): void {
    let filtered = [...this.patients];

    // Filtre par recherche
    if (this.searchQuery.trim()) {
      const query = this.searchQuery.toLowerCase();
      filtered = filtered.filter(p =>
        p.name.toLowerCase().includes(query) ||
        p.id.toLowerCase().includes(query) ||
        p.conditions.some(c => c.toLowerCase().includes(query))
      );
    }

    // Filtre par statut
    if (this.currentFilter !== 'all') {
      if (this.currentFilter === 'active') {
        filtered = filtered.filter(p => p.status === 'Actif');
      } else if (this.currentFilter === 'urgent') {
        filtered = filtered.filter(p => p.status === 'Urgent');
      } else if (this.currentFilter === 'pending') {
        filtered = filtered.filter(p => p.status === 'En attente');
      }
    }

    this.filteredPatients = filtered;
  }

  setFilter(filter: string): void {
    this.currentFilter = filter;
    this.filterPatients();
  }

  setViewMode(mode: 'grid' | 'list'): void {
    this.viewMode = mode;
  }

  toggleSelectAll(event: any): void {
    const checked = event.target.checked;
    this.filteredPatients.forEach(p => p.selected = checked);
  }

  openAddPatient(): void {
    this.showAddPatientModal = true;
  }

  closeAddPatient(): void {
    this.showAddPatientModal = false;
  }

  acceptPatient(request: PatientRequest): void {
    console.log('Accepter patient:', request);
    
    // Ajouter le patient à la liste
    const newPatient: Patient = {
      id: `MD-${Math.floor(Math.random() * 10000)}`,
      name: request.name,
      age: request.age,
      lastConsultation: new Date().toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' }),
      conditions: [request.reason],
      status: 'Actif',
      avatar: request.avatar
    };
    
    this.patients.push(newPatient);
    
    // Retirer de la liste des demandes
    this.pendingPatientRequests = this.pendingPatientRequests.filter(r => r.id !== request.id);
    
    this.filterPatients();
    
    alert(`Patient ${request.name} accepté avec succès !`);
  }

  rejectPatient(request: PatientRequest): void {
    console.log('Refuser patient:', request);
    
    if (confirm(`Êtes-vous sûr de vouloir refuser la demande de ${request.name} ?`)) {
      this.pendingPatientRequests = this.pendingPatientRequests.filter(r => r.id !== request.id);
      alert(`Demande de ${request.name} refusée.`);
    }
  }

  openMessage(patient: Patient): void {
    console.log('Ouvrir messagerie avec:', patient);
    alert(`Ouverture de la messagerie avec ${patient.name}\n\nCette fonctionnalité sera disponible dans la section Messagerie.`);
    // Navigation vers la messagerie avec le patient sélectionné
    // this.router.navigate(['/messages'], { queryParams: { patientId: patient.id } });
  }

  openDossier(patient: Patient): void {
    console.log('Ouvrir dossier de:', patient);
    alert(`Ouverture du dossier médical de ${patient.name}\n\nID: ${patient.id}\nÂge: ${patient.age} ans\nConditions: ${patient.conditions.join(', ')}\n\nCette fonctionnalité sera disponible dans la section Dossiers.`);
    // Navigation vers le dossier du patient
    // this.router.navigate(['/dossiers', patient.id]);
  }
}
