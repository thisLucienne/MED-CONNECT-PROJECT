import { Platform } from 'react-native';
import Constants from 'expo-constants';

// Fonction pour détecter l'URL du backend selon l'environnement
const getBaseURL = () => {
  // En développement avec Expo
  if (__DEV__) {
    // Si on utilise Expo Go, on peut utiliser le manifest pour détecter l'environnement
    const { manifest } = Constants;
    
    // Pour Expo Go avec tunnel
    if (manifest?.debuggerHost) {
      const debuggerHost = manifest.debuggerHost.split(':').shift();
      return `http://${debuggerHost}:3000/api`;
    }
    
    // Fallback vers l'IP locale
    return 'http://10.190.6.71:3000/api';
  }
  
  // En production
  return 'https://your-production-api.com/api';
};

// Configuration API centralisée
export const API_CONFIG = {
  BASE_URL: getBaseURL(),
  TIMEOUT: 15000, // Augmenté à 15 secondes
  HEADERS: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
};

// Endpoints disponibles
export const ENDPOINTS = {
  // Authentification
  AUTH: {
    LOGIN: '/auth/login',
    REGISTER_PATIENT: '/auth/register/patient',
    LOGOUT: '/auth/logout',
    PROFILE: '/auth/profile',
    VERIFY_2FA: '/auth/verify-2fa',
    RESEND_2FA: '/auth/resend-2fa',
    REFRESH: '/auth/refresh'
  },
  
  // Messages
  MESSAGES: {
    SEND: '/messages',
    CONVERSATIONS: '/messages/conversations',
    CONVERSATION: (userId: string) => `/messages/conversations/${userId}`,
    MARK_READ: (messageId: string) => `/messages/${messageId}/lu`,
    SEARCH_DOCTORS: '/messages/medecins/recherche'
  },
  
  // Dossiers médicaux
  DOSSIERS: {
    CREATE: '/dossiers',
    LIST: '/dossiers',
    GET: (dossierId: string) => `/dossiers/dossier/${dossierId}`,
    ADD_DOCUMENT: (dossierId: string) => `/dossiers/${dossierId}/documents`,
    ADD_COMMENT: (dossierId: string) => `/dossiers/${dossierId}/commentaires`
  },
  
  // Notifications
  NOTIFICATIONS: {
    LIST: '/notifications',
    COUNT: '/notifications/count',
    MARK_READ: (notificationId: string) => `/notifications/${notificationId}/lu`,
    MARK_ALL_READ: '/notifications/marquer-toutes-lues'
  },
  
  // Santé
  HEALTH: {
    DASHBOARD: '/sante/tableau-de-bord',
    PARAMETERS: '/sante/parametres',
    CONNECTED_DOCTORS: '/sante/medecins-connectes'
  }
};