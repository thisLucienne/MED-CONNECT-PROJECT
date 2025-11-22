import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface CalendarDay {
  date: number;
  isToday: boolean;
  isSelected: boolean;
  isOtherMonth: boolean;
}

interface Appointment {
  id: string;
  time: string;
  patient: string;
  type: string;
  duration: number;
  color: string;
  dayIndex: number;
  hour: string;
}

@Component({
  selector: 'app-agenda',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './agenda.html',
  styleUrl: './agenda.scss',
})
export class Agenda implements OnInit {
  searchQuery = '';
  currentView = 'week';
  
  weekDaysShort = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];
  calendarDays: CalendarDay[] = [];
  
  timeSlots = [
    '08:00', '09:00', '10:00', '11:00', '12:00', 
    '13:00', '14:00', '15:00', '16:00', '17:00', '18:00'
  ];

  filters = {
    showAvailability: true,
    teleConsultOnly: false,
    urgentOnly: false,
    appointmentType: 'all',
    viewFor: 'my'
  };

  todayStats = {
    consultations: 12,
    freeSlots: '21h30'
  };

  nextAppointment = 'Prochain RDV: Marie Dubois dans 15 minutes (9h30, consultation de suivi)';

  appointments: Appointment[] = [
    {
      id: '1',
      time: '10:00',
      patient: 'Marie',
      type: 'Consultation',
      duration: 1,
      color: '#4CAF50',
      dayIndex: 2,
      hour: '10:00'
    },
    {
      id: '2',
      time: '10:00',
      patient: 'Jean Martin',
      type: 'Suivi',
      duration: 0.5,
      color: '#FF9800',
      dayIndex: 2,
      hour: '10:00'
    },
    {
      id: '3',
      time: '10:30',
      patient: 'Claire Petit',
      type: 'Téléconsultation',
      duration: 0.5,
      color: '#2196F3',
      dayIndex: 2,
      hour: '10:00'
    },
    {
      id: '4',
      time: '11:00',
      patient: 'Visite d\'urgence',
      type: 'Urgence',
      duration: 0.5,
      color: '#F44336',
      dayIndex: 2,
      hour: '11:00'
    },
    {
      id: '5',
      time: '11:30',
      patient: 'Réunion clinique',
      type: 'Réunion',
      duration: 0.5,
      color: '#9E9E9E',
      dayIndex: 2,
      hour: '11:00'
    },
    {
      id: '6',
      time: '14:00',
      patient: 'Sophie',
      type: 'Consultation',
      duration: 1,
      color: '#9C27B0',
      dayIndex: 3,
      hour: '14:00'
    },
    {
      id: '7',
      time: '15:00',
      patient: 'Lucie',
      type: 'Suivi',
      duration: 1,
      color: '#00BCD4',
      dayIndex: 3,
      hour: '15:00'
    },
    {
      id: '8',
      time: '17:00',
      patient: 'Emma',
      type: 'Consultation',
      duration: 1,
      color: '#4CAF50',
      dayIndex: 4,
      hour: '17:00'
    },
    {
      id: '9',
      time: '17:00',
      patient: 'Lucas Blanc',
      type: 'Urgence',
      duration: 1,
      color: '#F44336',
      dayIndex: 4,
      hour: '17:00'
    }
  ];

  ngOnInit(): void {
    this.generateCalendar();
  }

  generateCalendar(): void {
    const days: CalendarDay[] = [];
    const today = 14;
    
    // Jours du mois précédent (26-31)
    for (let i = 26; i <= 31; i++) {
      days.push({ date: i, isToday: false, isSelected: false, isOtherMonth: true });
    }
    
    // Jours du mois actuel (1-31)
    for (let i = 1; i <= 31; i++) {
      days.push({ 
        date: i, 
        isToday: i === today, 
        isSelected: i === today, 
        isOtherMonth: false 
      });
    }
    
    this.calendarDays = days;
  }

  selectDay(day: CalendarDay): void {
    this.calendarDays.forEach(d => d.isSelected = false);
    day.isSelected = true;
  }

  previousMonth(): void {
    console.log('Previous month');
  }

  nextMonth(): void {
    console.log('Next month');
  }

  previousWeek(): void {
    console.log('Previous week');
  }

  nextWeek(): void {
    console.log('Next week');
  }

  goToToday(): void {
    console.log('Go to today');
  }

  setView(view: string): void {
    this.currentView = view;
  }

  isToday(dayIndex: number): boolean {
    return dayIndex === 1; // Mardi (index 1) est aujourd'hui
  }

  getDayDate(dayIndex: number): number {
    return 11 + dayIndex;
  }

  getAppointmentsForSlot(dayIndex: number, hour: string): Appointment[] {
    return this.appointments.filter(apt => 
      apt.dayIndex === dayIndex && apt.hour === hour
    );
  }

  openAppointment(appointment: Appointment, event: Event): void {
    event.stopPropagation();
    console.log('Open appointment:', appointment);
    alert(`Rendez-vous avec ${appointment.patient}\nType: ${appointment.type}\nHeure: ${appointment.time}`);
  }

  createAppointmentAt(dayIndex: number, hour: string): void {
    console.log('Create appointment at:', dayIndex, hour);
  }

  addAppointment(): void {
    console.log('Add new appointment');
    alert('Fonctionnalité "Ajouter un rendez-vous" - À implémenter avec un formulaire modal');
  }

  openDatePicker(): void {
    console.log('Open date picker');
  }

  openNotifications(): void {
    console.log('Open notifications');
    alert('4 nouvelles notifications');
  }

  openSettings(): void {
    console.log('Open settings');
  }

  toggleUserMenu(): void {
    console.log('Toggle user menu');
  }

  prepareNext(): void {
    console.log('Prepare next appointment');
    alert('Préparation du rendez-vous avec Marie Dubois...');
  }

  ignoreAlert(): void {
    this.nextAppointment = '';
  }

  openDailyTasks(): void {
    console.log('Open daily tasks');
    alert('Accès aux tâches du jour - À implémenter');
  }
}
