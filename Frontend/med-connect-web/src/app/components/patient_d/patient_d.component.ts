import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

interface Patient {
  id: string;
  name: string;
  age: number;
  lastConsultation: string;
  conditions: string[];
  status: 'Actif' | 'Inactif' | 'Urgent';
  avatar?: string;
}

@Component({
  selector: 'app-patient-d',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './patient_d.component.html',
  styleUrls: ['./patient_d.component.scss']
})
export class PatientDComponent {
  search = '';
  patients: Patient[] = [
    { id: 'MD-1892', name: 'Bernard Julien', age: 45, lastConsultation: '2024-03-24', conditions: ['Diabète Type 2', 'HTA'], status: 'Urgent', avatar: 'assets/images/logo.png' },
    { id: 'MD-2847', name: 'Marie Dubois', age: 34, lastConsultation: '2024-03-22', conditions: ['Hypothyroïdie'], status: 'Actif', avatar: 'assets/images/logo.png' },
    { id: 'MD-4128', name: 'Anne Legrand', age: 29, lastConsultation: '2024-03-01', conditions: ['Asthme'], status: 'Actif', avatar: 'assets/images/logo.png' },
    { id: 'MD-1523', name: 'Jean Martin', age: 56, lastConsultation: '2024-04-02', conditions: ['Chirurgie'], status: 'Actif', avatar: 'assets/images/logo.png' }
  ];

  get filtered() {
    const term = this.search.trim().toLowerCase();
    if (!term) return this.patients;
    return this.patients.filter(p =>
      p.name.toLowerCase().includes(term) || p.id.toLowerCase().includes(term)
    );
  }
}
