/**
 * Types TypeScript pour l'application mobile Med-Connect
 */

// Types d'authentification
export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  profilePicture?: string;
  role: 'PATIENT' | 'DOCTOR' | 'ADMIN';
  status: 'ACTIVE' | 'PENDING' | 'APPROVED' | 'REJECTED' | 'BLOCKED';
  isActive2FA?: boolean;
  createdAt: string;
  updatedAt?: string;
}

export interface Patient extends User {
  role: 'PATIENT';
  dateOfBirth?: string;
  bloodType?: string;
  address?: string;
  city?: string;
  postalCode?: string;
  country?: string;
  allergies?: string[];
  medications?: Medication[];
  conditions?: string[];
  emergencyContact?: EmergencyContact;
}

export interface Doctor {
  id: string;
  firstName: string;
  lastName: string;
  specialty: string;
  licenseNumber: string;
  rating?: number;
  reviewCount?: number;
  address?: string;
  phone?: string;
  email?: string;
  verified: boolean;
  available?: boolean;
  distance?: number;
  profilePicture?: string;
  bio?: string;
  languages?: string[];
  acceptedInsurance?: string[];
  createdAt: string;
}

// Types pour les médicaments
export interface Medication {
  id: string;
  name: string;
  dosage: string;
  frequency: string;
  startDate: string;
  endDate?: string;
  prescribedBy?: string;
  notes?: string;
}

// Contact d'urgence
export interface EmergencyContact {
  name: string;
  relationship: string;
  phone: string;
  email?: string;
}

// Types pour les dossiers médicaux
export interface MedicalRecord {
  id: string;
  patientId: string;
  title: string;
  type: 'consultation' | 'ordonnance' | 'analyse' | 'imagerie' | 'vaccination' | 'autre';
  doctorId?: string;
  doctorName?: string;
  date: string;
  fileUrl?: string;
  fileName?: string;
  fileSize?: number;
  notes?: string;
  createdAt: string;
  updatedAt?: string;
}

// Types pour la messagerie
export interface Conversation {
  id: string;
  patientId: string;
  doctorId: string;
  doctorName: string;
  doctorSpecialty: string;
  doctorProfilePicture?: string;
  lastMessage?: Message;
  unreadCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  senderType: 'patient' | 'doctor';
  content?: string;
  type: 'text' | 'file' | 'info';
  fileUrl?: string;
  fileName?: string;
  fileSize?: number;
  timestamp: string;
  read: boolean;
  readAt?: string;
}

// Types pour les rendez-vous
export interface Appointment {
  id: string;
  patientId: string;
  doctorId: string;
  doctorName: string;
  doctorSpecialty: string;
  date: string;
  time: string;
  duration: number; // en minutes
  type: 'consultation' | 'suivi' | 'urgence';
  status: 'scheduled' | 'confirmed' | 'cancelled' | 'completed';
  notes?: string;
  location?: string;
  isVirtual: boolean;
  createdAt: string;
  updatedAt?: string;
}

// Types pour les notifications
export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'success' | 'error';
  category: 'appointment' | 'message' | 'medical' | 'system';
  read: boolean;
  actionUrl?: string;
  createdAt: string;
}

// Types pour les statistiques du dashboard
export interface DashboardStats {
  totalRecords: number;
  unreadMessages: number;
  totalDoctors: number;
  pendingAppointments: number;
  recentActivity: ActivityItem[];
}

export interface ActivityItem {
  id: string;
  type: 'record' | 'message' | 'appointment' | 'medication';
  title: string;
  description: string;
  date: string;
  icon: string;
}

// Types pour les filtres et recherche
export interface DoctorFilters {
  specialty?: string;
  distance?: number;
  rating?: number;
  availability?: boolean;
  verified?: boolean;
  search?: string;
}

export interface MedicalRecordFilters {
  type?: string;
  doctorId?: string;
  dateFrom?: string;
  dateTo?: string;
  search?: string;
}

// Types pour les formulaires
export interface LoginForm {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface RegisterForm {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  confirmPassword: string;
  phone?: string;
  acceptTerms: boolean;
}

export interface ProfileUpdateForm {
  firstName: string;
  lastName: string;
  phone?: string;
  dateOfBirth?: string;
  bloodType?: string;
  address?: string;
  city?: string;
  postalCode?: string;
  country?: string;
}

export interface PasswordChangeForm {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

// Types pour les réponses API
export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: any;
  };
}

export interface PaginatedResponse<T = any> {
  success: boolean;
  data: {
    items: T[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
      hasNext: boolean;
      hasPrev: boolean;
    };
  };
}

// Types pour la navigation
export type ScreenType = 
  | 'splash'
  | 'login'
  | 'register'
  | 'dashboard'
  | 'findDoctor'
  | 'doctorProfile'
  | 'profile'
  | 'medicalRecords'
  | 'uploadDocument'
  | 'messaging'
  | 'chat'
  | 'appointments'
  | 'notifications'
  | 'settings';

export interface NavigationProps {
  currentScreen: ScreenType;
  navigateToScreen: (screen: ScreenType, params?: any) => void;
  goBack: () => void;
}

// Types pour les erreurs
export interface AppError {
  code: string;
  message: string;
  details?: any;
  timestamp: string;
}

// Types pour l'état de l'application
export interface AppState {
  isLoading: boolean;
  error: AppError | null;
  user: User | null;
  isAuthenticated: boolean;
  currentScreen: ScreenType;
  navigationHistory: ScreenType[];
}

// Types pour les préférences utilisateur
export interface UserPreferences {
  notifications: {
    appointments: boolean;
    messages: boolean;
    medications: boolean;
    general: boolean;
  };
  privacy: {
    shareDataWithDoctors: boolean;
    allowAnalytics: boolean;
    showOnlineStatus: boolean;
  };
  display: {
    theme: 'light' | 'dark' | 'auto';
    language: 'fr' | 'en';
    fontSize: 'small' | 'medium' | 'large';
  };
}

// Types pour les constantes
export interface Colors {
  primary: string;
  secondary: string;
  success: string;
  warning: string;
  error: string;
  info: string;
  background: string;
  surface: string;
  text: string;
  textSecondary: string;
  border: string;
}

export interface Spacing {
  xs: number;
  sm: number;
  md: number;
  lg: number;
  xl: number;
}

export interface Typography {
  h1: {
    fontSize: number;
    fontWeight: string;
    lineHeight: number;
  };
  h2: {
    fontSize: number;
    fontWeight: string;
    lineHeight: number;
  };
  h3: {
    fontSize: number;
    fontWeight: string;
    lineHeight: number;
  };
  body: {
    fontSize: number;
    fontWeight: string;
    lineHeight: number;
  };
  caption: {
    fontSize: number;
    fontWeight: string;
    lineHeight: number;
  };
}