import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService, PendingDoctor } from '../../services/auth.service';

@Component({
  selector: 'app-doctor-validation',
  template: `
    <div class="doctor-validation-container">
      <div class="header">
        <h1>Validation des Médecins</h1>
        <p>Gérez les demandes d'inscription des médecins en attente de validation</p>
      </div>

      <!-- Statistiques -->
      <div class="stats-row">
        <div class="stat-card">
          <div class="stat-number">{{ pendingDoctors.length }}</div>
          <div class="stat-label">En attente</div>
        </div>
        <div class="stat-card">
          <div class="stat-number">{{ approvedToday }}</div>
          <div class="stat-label">Approuvés aujourd'hui</div>
        </div>
        <div class="stat-card">
          <div class="stat-number">{{ rejectedToday }}</div>
          <div class="stat-label">Rejetés aujourd'hui</div>
        </div>
      </div>

      <!-- Message si aucun médecin en attente -->
      <div class="empty-state" *ngIf="!isLoading && pendingDoctors.length === 0">
        <div class="empty-icon">
          <svg width="64" height="64" viewBox="0 0 24 24" fill="none">
            <path d="M9 12L11 14L15 10M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
          </svg>
        </div>
        <h3>Aucune demande en attente</h3>
        <p>Tous les médecins ont été traités. Revenez plus tard pour de nouvelles demandes.</p>
      </div>

      <!-- Loading state -->
      <div class="loading-state" *ngIf="isLoading">
        <div class="spinner"></div>
        <p>Chargement des demandes...</p>
      </div>

      <!-- Liste des médecins en attente -->
      <div class="doctors-grid" *ngIf="!isLoading && pendingDoctors.length > 0">
        <div class="doctor-card" *ngFor="let doctor of pendingDoctors">
          <div class="doctor-header">
            <div class="doctor-avatar">
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none">
                <path d="M16 7C16 9.20914 14.2091 11 12 11C9.79086 11 8 9.20914 8 7C8 4.79086 9.79086 3 12 3C14.2091 3 16 4.79086 16 7Z" stroke="currentColor" stroke-width="2"/>
                <path d="M12 14C8.13401 14 5 17.134 5 21H19C19 17.134 15.866 14 12 14Z" stroke="currentColor" stroke-width="2"/>
              </svg>
            </div>
            <div class="doctor-info">
              <h3>{{ doctor.firstName }} {{ doctor.lastName }}</h3>
              <p class="specialty">{{ doctor.specialty }}</p>
              <p class="email">{{ doctor.email }}</p>
            </div>
          </div>

          <div class="doctor-details">
            <div class="detail-row">
              <span class="label">Numéro de licence:</span>
              <span class="value">{{ doctor.licenseNumber }}</span>
            </div>
            <div class="detail-row" *ngIf="doctor.phone">
              <span class="label">Téléphone:</span>
              <span class="value">{{ doctor.phone }}</span>
            </div>
            <div class="detail-row">
              <span class="label">Date de demande:</span>
              <span class="value">{{ formatDate(doctor.createdAt) }}</span>
            </div>
          </div>

          <div class="doctor-actions">
            <button 
              class="btn-approve" 
              (click)="approveDoctor(doctor)"
              [disabled]="processingDoctors.has(doctor.id)"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <path d="M9 12L11 14L15 10M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="currentColor" stroke-width="2"/>
              </svg>
              <span *ngIf="!processingDoctors.has(doctor.id)">Approuver</span>
              <span *ngIf="processingDoctors.has(doctor.id)">Traitement...</span>
            </button>

            <button 
              class="btn-reject" 
              (click)="openRejectModal(doctor)"
              [disabled]="processingDoctors.has(doctor.id)"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <path d="M6 18L18 6M6 6L18 18" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
              </svg>
              Rejeter
            </button>
          </div>
        </div>
      </div>

      <!-- Modal de rejet -->
      <div class="modal-overlay" *ngIf="showRejectModal" (click)="closeRejectModal()">
        <div class="modal-content" (click)="$event.stopPropagation()">
          <div class="modal-header">
            <h3>Rejeter la demande</h3>
            <button class="close-btn" (click)="closeRejectModal()">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path d="M6 18L18 6M6 6L18 18" stroke="currentColor" stroke-width="2"/>
              </svg>
            </button>
          </div>

          <div class="modal-body">
            <p>Vous êtes sur le point de rejeter la demande de :</p>
            <div class="doctor-summary" *ngIf="selectedDoctor">
              <strong>{{ selectedDoctor.firstName }} {{ selectedDoctor.lastName }}</strong>
              <span>{{ selectedDoctor.specialty }}</span>
            </div>

            <div class="form-group">
              <label for="rejectionReason">Raison du rejet (obligatoire) :</label>
              <textarea 
                id="rejectionReason"
                [(ngModel)]="rejectionReason"
                placeholder="Expliquez pourquoi cette demande est rejetée..."
                rows="4"
                required
              ></textarea>
            </div>
          </div>

          <div class="modal-actions">
            <button class="btn-cancel" (click)="closeRejectModal()">Annuler</button>
            <button 
              class="btn-confirm-reject" 
              (click)="confirmReject()"
              [disabled]="!rejectionReason.trim() || isRejecting"
            >
              <span *ngIf="!isRejecting">Confirmer le rejet</span>
              <span *ngIf="isRejecting">Rejet en cours...</span>
            </button>
          </div>
        </div>
      </div>

      <!-- Messages de notification -->
      <div class="notification" *ngIf="notification" [class]="notification.type">
        <div class="notification-content">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" *ngIf="notification.type === 'success'">
            <path d="M9 12L11 14L15 10M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="currentColor" stroke-width="2"/>
          </svg>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" *ngIf="notification.type === 'error'">
            <path d="M12 9V13M12 17H12.01M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="currentColor" stroke-width="2"/>
          </svg>
          <span>{{ notification.message }}</span>
        </div>
        <button class="notification-close" (click)="closeNotification()">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
            <path d="M6 18L18 6M6 6L18 18" stroke="currentColor" stroke-width="2"/>
          </svg>
        </button>
      </div>
    </div>
  `,
  styles: [`
    .doctor-validation-container {
      padding: 24px;
      max-width: 1200px;
      margin: 0 auto;
    }

    .header {
      margin-bottom: 32px;
      text-align: center;

      h1 {
        font-size: 32px;
        font-weight: 700;
        color: #1e3c72;
        margin: 0 0 8px 0;
      }

      p {
        font-size: 16px;
        color: #666;
        margin: 0;
      }
    }

    .stats-row {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 20px;
      margin-bottom: 32px;
    }

    .stat-card {
      background: white;
      border-radius: 12px;
      padding: 24px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
      text-align: center;

      .stat-number {
        font-size: 36px;
        font-weight: 700;
        color: #1e3c72;
        margin-bottom: 8px;
      }

      .stat-label {
        font-size: 14px;
        color: #666;
        font-weight: 500;
      }
    }

    .empty-state, .loading-state {
      text-align: center;
      padding: 60px 20px;
      color: #666;

      .empty-icon {
        margin-bottom: 20px;
        color: #1e3c72;
      }

      h3 {
        font-size: 24px;
        margin: 0 0 12px 0;
        color: #333;
      }

      p {
        font-size: 16px;
        margin: 0;
      }
    }

    .spinner {
      width: 40px;
      height: 40px;
      border: 4px solid #f3f3f3;
      border-top: 4px solid #1e3c72;
      border-radius: 50%;
      animation: spin 1s linear infinite;
      margin: 0 auto 20px;
    }

    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }

    .doctors-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(400px, 1fr));
      gap: 24px;
    }

    .doctor-card {
      background: white;
      border-radius: 16px;
      padding: 24px;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
      transition: transform 0.2s, box-shadow 0.2s;

      &:hover {
        transform: translateY(-2px);
        box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
      }
    }

    .doctor-header {
      display: flex;
      align-items: center;
      margin-bottom: 20px;

      .doctor-avatar {
        width: 60px;
        height: 60px;
        background: linear-gradient(135deg, #1e3c72, #2a5298);
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        color: white;
        margin-right: 16px;
      }

      .doctor-info {
        flex: 1;

        h3 {
          font-size: 18px;
          font-weight: 600;
          color: #333;
          margin: 0 0 4px 0;
        }

        .specialty {
          font-size: 14px;
          color: #1e3c72;
          font-weight: 500;
          margin: 0 0 4px 0;
        }

        .email {
          font-size: 14px;
          color: #666;
          margin: 0;
        }
      }
    }

    .doctor-details {
      margin-bottom: 24px;

      .detail-row {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 8px 0;
        border-bottom: 1px solid #f0f0f0;

        &:last-child {
          border-bottom: none;
        }

        .label {
          font-size: 14px;
          color: #666;
          font-weight: 500;
        }

        .value {
          font-size: 14px;
          color: #333;
          font-weight: 600;
        }
      }
    }

    .doctor-actions {
      display: flex;
      gap: 12px;

      button {
        flex: 1;
        padding: 12px 16px;
        border: none;
        border-radius: 8px;
        font-size: 14px;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.2s;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 8px;

        &:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }
      }

      .btn-approve {
        background: linear-gradient(135deg, #10b981, #059669);
        color: white;

        &:hover:not(:disabled) {
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
        }
      }

      .btn-reject {
        background: linear-gradient(135deg, #ef4444, #dc2626);
        color: white;

        &:hover:not(:disabled) {
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(239, 68, 68, 0.3);
        }
      }
    }

    /* Modal styles */
    .modal-overlay {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.5);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 1000;
      padding: 20px;
    }

    .modal-content {
      background: white;
      border-radius: 16px;
      max-width: 500px;
      width: 100%;
      max-height: 90vh;
      overflow-y: auto;
    }

    .modal-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 24px 24px 0;
      margin-bottom: 20px;

      h3 {
        font-size: 20px;
        font-weight: 600;
        color: #333;
        margin: 0;
      }

      .close-btn {
        background: none;
        border: none;
        cursor: pointer;
        color: #666;
        padding: 4px;
        border-radius: 4px;

        &:hover {
          background: #f5f5f5;
        }
      }
    }

    .modal-body {
      padding: 0 24px;

      .doctor-summary {
        background: #f8f9fa;
        padding: 16px;
        border-radius: 8px;
        margin: 16px 0;

        strong {
          display: block;
          font-size: 16px;
          color: #333;
          margin-bottom: 4px;
        }

        span {
          font-size: 14px;
          color: #666;
        }
      }

      .form-group {
        margin: 20px 0;

        label {
          display: block;
          font-size: 14px;
          font-weight: 500;
          color: #333;
          margin-bottom: 8px;
        }

        textarea {
          width: 100%;
          padding: 12px;
          border: 1px solid #ddd;
          border-radius: 8px;
          font-size: 14px;
          resize: vertical;
          min-height: 100px;

          &:focus {
            outline: none;
            border-color: #1e3c72;
            box-shadow: 0 0 0 3px rgba(30, 60, 114, 0.1);
          }
        }
      }
    }

    .modal-actions {
      display: flex;
      gap: 12px;
      padding: 24px;
      border-top: 1px solid #f0f0f0;

      button {
        flex: 1;
        padding: 12px 20px;
        border: none;
        border-radius: 8px;
        font-size: 14px;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.2s;

        &:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }
      }

      .btn-cancel {
        background: #f5f5f5;
        color: #666;

        &:hover:not(:disabled) {
          background: #e5e5e5;
        }
      }

      .btn-confirm-reject {
        background: linear-gradient(135deg, #ef4444, #dc2626);
        color: white;

        &:hover:not(:disabled) {
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(239, 68, 68, 0.3);
        }
      }
    }

    /* Notification styles */
    .notification {
      position: fixed;
      top: 20px;
      right: 20px;
      background: white;
      border-radius: 12px;
      padding: 16px 20px;
      box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
      display: flex;
      align-items: center;
      gap: 12px;
      z-index: 1001;
      min-width: 300px;
      animation: slideIn 0.3s ease-out;

      &.success {
        border-left: 4px solid #10b981;
        color: #065f46;

        svg {
          color: #10b981;
        }
      }

      &.error {
        border-left: 4px solid #ef4444;
        color: #991b1b;

        svg {
          color: #ef4444;
        }
      }

      .notification-content {
        display: flex;
        align-items: center;
        gap: 8px;
        flex: 1;
      }

      .notification-close {
        background: none;
        border: none;
        cursor: pointer;
        color: #666;
        padding: 4px;
        border-radius: 4px;

        &:hover {
          background: #f5f5f5;
        }
      }
    }

    @keyframes slideIn {
      from {
        transform: translateX(100%);
        opacity: 0;
      }
      to {
        transform: translateX(0);
        opacity: 1;
      }
    }

    @media (max-width: 768px) {
      .doctor-validation-container {
        padding: 16px;
      }

      .doctors-grid {
        grid-template-columns: 1fr;
      }

      .doctor-actions {
        flex-direction: column;
      }

      .modal-content {
        margin: 20px;
      }
    }
  `],
  standalone: true,
  imports: [CommonModule, FormsModule]
})
export class DoctorValidationComponent implements OnInit {
  pendingDoctors: PendingDoctor[] = [];
  isLoading = true;
  processingDoctors = new Set<string>();
  
  // Modal state
  showRejectModal = false;
  selectedDoctor: PendingDoctor | null = null;
  rejectionReason = '';
  isRejecting = false;

  // Stats
  approvedToday = 0;
  rejectedToday = 0;

  // Notification
  notification: { type: 'success' | 'error', message: string } | null = null;

  constructor(private authService: AuthService) {}

  ngOnInit() {
    this.loadPendingDoctors();
  }

  loadPendingDoctors() {
    this.isLoading = true;
    this.authService.getPendingDoctors().subscribe({
      next: (response) => {
        this.pendingDoctors = response.data;
        this.isLoading = false;
        console.log('Médecins en attente chargés:', this.pendingDoctors);
      },
      error: (error) => {
        console.error('Erreur lors du chargement des médecins en attente:', error);
        this.isLoading = false;
        this.showNotification('error', 'Erreur lors du chargement des demandes');
      }
    });
  }

  approveDoctor(doctor: PendingDoctor) {
    const doctorIdToUse = (doctor as any).doctorId || doctor.id;
    this.processingDoctors.add(doctor.id);
    
    this.authService.validateDoctor(doctorIdToUse, 'approve').subscribe({
      next: (response) => {
        this.processingDoctors.delete(doctor.id);
        this.pendingDoctors = this.pendingDoctors.filter(d => d.id !== doctor.id);
        this.approvedToday++;
        this.showNotification('success', `Dr. ${doctor.firstName} ${doctor.lastName} a été approuvé avec succès`);
        console.log('Médecin approuvé:', response);
      },
      error: (error) => {
        this.processingDoctors.delete(doctor.id);
        console.error('Erreur lors de l\'approbation:', error);
        this.showNotification('error', 'Erreur lors de l\'approbation du médecin');
      }
    });
  }

  openRejectModal(doctor: PendingDoctor) {
    this.selectedDoctor = doctor;
    this.rejectionReason = '';
    this.showRejectModal = true;
  }

  closeRejectModal() {
    this.showRejectModal = false;
    this.selectedDoctor = null;
    this.rejectionReason = '';
    this.isRejecting = false;
  }

  confirmReject() {
    if (!this.selectedDoctor || !this.rejectionReason.trim()) {
      return;
    }

    this.isRejecting = true;
    const doctorIdToUse = (this.selectedDoctor as any).doctorId || this.selectedDoctor.id;
    
    this.authService.validateDoctor(doctorIdToUse, 'reject', this.rejectionReason).subscribe({
      next: (response) => {
        this.pendingDoctors = this.pendingDoctors.filter(d => d.id !== this.selectedDoctor!.id);
        this.rejectedToday++;
        this.showNotification('success', `La demande de Dr. ${this.selectedDoctor!.firstName} ${this.selectedDoctor!.lastName} a été rejetée`);
        this.closeRejectModal();
        console.log('Médecin rejeté:', response);
      },
      error: (error) => {
        this.isRejecting = false;
        console.error('Erreur lors du rejet:', error);
        this.showNotification('error', 'Erreur lors du rejet de la demande');
      }
    });
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  showNotification(type: 'success' | 'error', message: string) {
    this.notification = { type, message };
    setTimeout(() => {
      this.closeNotification();
    }, 5000);
  }

  closeNotification() {
    this.notification = null;
  }
}