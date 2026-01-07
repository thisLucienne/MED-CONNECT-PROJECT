import httpService from './httpService';
import { ENDPOINTS } from '../config/api';

// Types pour la messagerie
export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  senderName: string;
  senderType: 'patient' | 'doctor';
  content: string;
  timestamp: string;
  isRead: boolean;
}

export interface Conversation {
  id: string;
  participantId: string;
  participantName: string;
  participantType: 'patient' | 'doctor';
  lastMessage: string;
  lastMessageTime: string;
  unreadCount: number;
  isActive: boolean;
  messages?: Message[];
}

export interface SendMessageData {
  destinataireId: string;
  contenu: string;
  objet?: string;
}

export interface Doctor {
  id: string;
  nom: string;
  prenom: string;
  specialite: string;
  email: string;
  verified: boolean;
}

class MessageService {
  // Envoyer un message
  async sendMessage(messageData: SendMessageData): Promise<{ success: boolean; message: string; data: Message }> {
    try {
      const response = await httpService.post(ENDPOINTS.MESSAGES.SEND, messageData);
      return response;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Erreur lors de l\'envoi du message');
    }
  }

  // Obtenir toutes les conversations
  async getConversations(): Promise<{ success: boolean; data: Conversation[] }> {
    try {
      const response = await httpService.get(ENDPOINTS.MESSAGES.CONVERSATIONS);
      return response;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Erreur lors de la récupération des conversations');
    }
  }

  // Obtenir une conversation spécifique
  async getConversation(
    userId: string, 
    page: number = 1, 
    limit: number = 50
  ): Promise<{ success: boolean; data: Message[]; pagination: any }> {
    try {
      const response = await httpService.get(
        `${ENDPOINTS.MESSAGES.CONVERSATION(userId)}?page=${page}&limite=${limit}`
      );
      return response;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Erreur lors de la récupération de la conversation');
    }
  }

  // Marquer un message comme lu
  async markMessageAsRead(messageId: string): Promise<{ success: boolean; message: string }> {
    try {
      const response = await httpService.patch(ENDPOINTS.MESSAGES.MARK_READ(messageId));
      return response;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Erreur lors du marquage comme lu');
    }
  }

  // Rechercher des médecins (pour les patients)
  async searchDoctors(specialite?: string, nom?: string): Promise<{ success: boolean; data: Doctor[] }> {
    try {
      const params = new URLSearchParams();
      if (specialite) params.append('specialite', specialite);
      if (nom) params.append('nom', nom);
      
      const queryString = params.toString();
      const url = queryString ? `${ENDPOINTS.MESSAGES.SEARCH_DOCTORS}?${queryString}` : ENDPOINTS.MESSAGES.SEARCH_DOCTORS;
      
      const response = await httpService.get(url);
      return response;
    } catch (error: any) {
      console.warn('API non disponible, utilisation de données de test');
      
      // Données de test en cas d'erreur API
      const testDoctors: Doctor[] = [
        {
          id: '1',
          prenom: 'Jean',
          nom: 'Martin',
          specialite: 'Cardiologie',
          email: 'dr.martin@medconnect.com',
          verified: true
        },
        {
          id: '2',
          prenom: 'Marie',
          nom: 'Dubois',
          specialite: 'Dermatologie',
          email: 'dr.dubois@medconnect.com',
          verified: true
        },
        {
          id: '3',
          prenom: 'Pierre',
          nom: 'Bernard',
          specialite: 'Médecine générale',
          email: 'dr.bernard@medconnect.com',
          verified: true
        },
        {
          id: '4',
          prenom: 'Sophie',
          nom: 'Moreau',
          specialite: 'Pédiatrie',
          email: 'dr.moreau@medconnect.com',
          verified: true
        },
        {
          id: '5',
          prenom: 'Antoine',
          nom: 'Roux',
          specialite: 'Orthopédie',
          email: 'dr.roux@medconnect.com',
          verified: true
        }
      ];

      // Filtrer par nom si spécifié
      let filteredDoctors = testDoctors;
      if (nom) {
        const searchTerm = nom.toLowerCase();
        filteredDoctors = testDoctors.filter(doctor => 
          doctor.prenom.toLowerCase().includes(searchTerm) ||
          doctor.nom.toLowerCase().includes(searchTerm)
        );
      }

      // Filtrer par spécialité si spécifiée
      if (specialite) {
        filteredDoctors = filteredDoctors.filter(doctor => 
          doctor.specialite.toLowerCase().includes(specialite.toLowerCase())
        );
      }

      return {
        success: true,
        data: filteredDoctors
      };
    }
  }
}

export default new MessageService();