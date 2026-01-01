import { Component, OnInit, ViewChild, ElementRef, AfterViewChecked } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';

interface Message {
  id: string;
  content: string;
  time: string;
  isSent: boolean;
  isRead: boolean;
  type: 'text' | 'image' | 'file';
  fileName?: string;
  fileSize?: string;
}

interface Conversation {
  id: string;
  name: string;
  avatar: string;
  lastMessage: string;
  lastMessageTime: string;
  unreadCount: number;
  isOnline: boolean;
  isTyping: boolean;
  isArchived: boolean;
  role: string;
  patientId: string;
  age: number;
  lastConsultation: string;
  messages: Message[];
}

@Component({
  selector: 'app-messagerie',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './messagerie.html',
  styleUrl: './messagerie.scss',
})
export class Messagerie implements OnInit, AfterViewChecked {
  @ViewChild('messagesContainer') private messagesContainer!: ElementRef;

  searchQuery = '';
  currentFilter = 'all';
  messageText = '';
  selectedConversation: Conversation | null = null;
  showInfoPanel = false;
  private shouldScrollToBottom = false;

  conversations: Conversation[] = [
    {
      id: '1',
      name: 'Marie Dubois',
      avatar: 'assets/images/logo.png',
      lastMessage: 'Merci docteur, je me sens beaucoup mieux !',
      lastMessageTime: '10:30',
      unreadCount: 2,
      isOnline: true,
      isTyping: false,
      isArchived: false,
      role: 'Patient',
      patientId: 'MD-2847',
      age: 34,
      lastConsultation: '22 Mars 2024',
      messages: [
        {
          id: 'm1',
          content: 'Bonjour Docteur, j\'ai une question concernant mon traitement',
          time: '09:15',
          isSent: false,
          isRead: true,
          type: 'text'
        },
        {
          id: 'm2',
          content: 'Bonjour Marie, je vous écoute. De quoi s\'agit-il ?',
          time: '09:20',
          isSent: true,
          isRead: true,
          type: 'text'
        },
        {
          id: 'm3',
          content: 'Je voulais savoir si je peux prendre mon médicament le matin au lieu du soir',
          time: '09:22',
          isSent: false,
          isRead: true,
          type: 'text'
        },
        {
          id: 'm4',
          content: 'Oui, pas de problème. Vous pouvez le prendre le matin avec le petit-déjeuner.',
          time: '09:25',
          isSent: true,
          isRead: true,
          type: 'text'
        },
        {
          id: 'm5',
          content: 'Merci docteur, je me sens beaucoup mieux !',
          time: '10:30',
          isSent: false,
          isRead: false,
          type: 'text'
        }
      ]
    },
    {
      id: '2',
      name: 'Jean Martin',
      avatar: 'assets/images/logo.png',
      lastMessage: 'D\'accord, je prends rendez-vous',
      lastMessageTime: 'Hier',
      unreadCount: 0,
      isOnline: false,
      isTyping: false,
      isArchived: false,
      role: 'Patient',
      patientId: 'MD-1523',
      age: 56,
      lastConsultation: '02 Avril 2024',
      messages: [
        {
          id: 'm1',
          content: 'Bonjour Docteur, mes résultats d\'analyse sont arrivés',
          time: '14:30',
          isSent: false,
          isRead: true,
          type: 'text'
        },
        {
          id: 'm2',
          content: 'Parfait, je les ai reçus également. Nous devons en discuter lors d\'une consultation.',
          time: '14:35',
          isSent: true,
          isRead: true,
          type: 'text'
        },
        {
          id: 'm3',
          content: 'D\'accord, je prends rendez-vous',
          time: '14:40',
          isSent: false,
          isRead: true,
          type: 'text'
        }
      ]
    },
    {
      id: '3',
      name: 'Sophie Laurent',
      avatar: 'assets/images/logo.png',
      lastMessage: 'Vous : Prenez soin de vous',
      lastMessageTime: 'Hier',
      unreadCount: 0,
      isOnline: true,
      isTyping: false,
      isArchived: false,
      role: 'Patient',
      patientId: 'MD-3456',
      age: 42,
      lastConsultation: '20 Mars 2024',
      messages: [
        {
          id: 'm1',
          content: 'Bonjour, j\'ai des migraines depuis 3 jours',
          time: '11:00',
          isSent: false,
          isRead: true,
          type: 'text'
        },
        {
          id: 'm2',
          content: 'Bonjour Sophie. Avez-vous pris votre traitement habituel ?',
          time: '11:05',
          isSent: true,
          isRead: true,
          type: 'text'
        },
        {
          id: 'm3',
          content: 'Oui mais ça ne passe pas',
          time: '11:10',
          isSent: false,
          isRead: true,
          type: 'text'
        },
        {
          id: 'm4',
          content: 'Je vous prescris un traitement plus fort. Reposez-vous et évitez les écrans.',
          time: '11:15',
          isSent: true,
          isRead: true,
          type: 'text'
        },
        {
          id: 'm5',
          content: 'Prenez soin de vous',
          time: '11:16',
          isSent: true,
          isRead: true,
          type: 'text'
        }
      ]
    },
    {
      id: '4',
      name: 'Pierre Durand',
      avatar: 'assets/images/logo.png',
      lastMessage: 'Merci pour votre suivi',
      lastMessageTime: '2 jours',
      unreadCount: 1,
      isOnline: false,
      isTyping: false,
      isArchived: false,
      role: 'Patient',
      patientId: 'MD-7890',
      age: 67,
      lastConsultation: '25 Mars 2024',
      messages: [
        {
          id: 'm1',
          content: 'Bonjour Docteur, comment vont mes résultats ?',
          time: '16:00',
          isSent: false,
          isRead: true,
          type: 'text'
        },
        {
          id: 'm2',
          content: 'Bonjour Pierre. Vos résultats sont stables, c\'est une bonne nouvelle.',
          time: '16:30',
          isSent: true,
          isRead: true,
          type: 'text'
        },
        {
          id: 'm3',
          content: 'Merci pour votre suivi',
          time: '16:35',
          isSent: false,
          isRead: false,
          type: 'text'
        }
      ]
    },
    {
      id: '5',
      name: 'Anne Legrand',
      avatar: 'assets/images/logo.png',
      lastMessage: 'Vous : À bientôt',
      lastMessageTime: '3 jours',
      unreadCount: 0,
      isOnline: false,
      isTyping: false,
      isArchived: false,
      role: 'Patient',
      patientId: 'MD-4128',
      age: 29,
      lastConsultation: '01 Mars 2024',
      messages: [
        {
          id: 'm1',
          content: 'Bonjour, je voudrais renouveler mon ordonnance',
          time: '10:00',
          isSent: false,
          isRead: true,
          type: 'text'
        },
        {
          id: 'm2',
          content: 'Bonjour Anne. Je vous la prépare, vous pouvez passer la récupérer.',
          time: '10:15',
          isSent: true,
          isRead: true,
          type: 'text'
        },
        {
          id: 'm3',
          content: 'Parfait, merci !',
          time: '10:20',
          isSent: false,
          isRead: true,
          type: 'text'
        },
        {
          id: 'm4',
          content: 'À bientôt',
          time: '10:21',
          isSent: true,
          isRead: true,
          type: 'text'
        }
      ]
    },
    {
      id: '6',
      name: 'Bernard Julien',
      avatar: 'assets/images/logo.png',
      lastMessage: 'J\'ai besoin d\'un rendez-vous urgent',
      lastMessageTime: '1 sem',
      unreadCount: 3,
      isOnline: false,
      isTyping: false,
      isArchived: false,
      role: 'Patient',
      patientId: 'MD-1892',
      age: 45,
      lastConsultation: '24 Mars 2024',
      messages: [
        {
          id: 'm1',
          content: 'Bonjour Docteur',
          time: '08:00',
          isSent: false,
          isRead: true,
          type: 'text'
        },
        {
          id: 'm2',
          content: 'J\'ai besoin d\'un rendez-vous urgent',
          time: '08:05',
          isSent: false,
          isRead: false,
          type: 'text'
        }
      ]
    }
  ];

  filteredConversations: Conversation[] = [];

  constructor(
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.filterConversations();
    
    // Vérifier si un patient est passé en paramètre
    this.route.queryParams.subscribe(params => {
      if (params['patientId']) {
        const conversation = this.conversations.find(c => c.patientId === params['patientId']);
        if (conversation) {
          this.selectConversation(conversation);
        }
      }
    });
  }

  ngAfterViewChecked(): void {
    if (this.shouldScrollToBottom) {
      this.scrollToBottom();
      this.shouldScrollToBottom = false;
    }
  }

  get unreadCount(): number {
    return this.conversations.filter(c => c.unreadCount > 0 && !c.isArchived).length;
  }

  filterConversations(): void {
    let filtered = [...this.conversations];

    // Filtre par recherche
    if (this.searchQuery.trim()) {
      const query = this.searchQuery.toLowerCase();
      filtered = filtered.filter(c =>
        c.name.toLowerCase().includes(query) ||
        c.lastMessage.toLowerCase().includes(query)
      );
    }

    // Filtre par statut
    if (this.currentFilter === 'unread') {
      filtered = filtered.filter(c => c.unreadCount > 0);
    } else if (this.currentFilter === 'archived') {
      filtered = filtered.filter(c => c.isArchived);
    } else {
      filtered = filtered.filter(c => !c.isArchived);
    }

    this.filteredConversations = filtered;
  }

  setFilter(filter: string): void {
    this.currentFilter = filter;
    this.filterConversations();
  }

  selectConversation(conversation: Conversation): void {
    this.selectedConversation = conversation;
    
    // Marquer les messages comme lus
    if (conversation.unreadCount > 0) {
      conversation.unreadCount = 0;
      conversation.messages.forEach(m => {
        if (!m.isSent) {
          m.isRead = true;
        }
      });
    }

    this.shouldScrollToBottom = true;
  }

  sendMessage(): void {
    if (!this.messageText.trim() || !this.selectedConversation) return;

    const newMessage: Message = {
      id: `m${Date.now()}`,
      content: this.messageText,
      time: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
      isSent: true,
      isRead: false,
      type: 'text'
    };

    this.selectedConversation.messages.push(newMessage);
    this.selectedConversation.lastMessage = `Vous : ${this.messageText}`;
    this.selectedConversation.lastMessageTime = 'À l\'instant';

    this.messageText = '';
    this.shouldScrollToBottom = true;

    // Simuler une réponse après 2 secondes
    setTimeout(() => {
      this.simulateTyping();
    }, 2000);
  }

  simulateTyping(): void {
    if (!this.selectedConversation) return;

    this.selectedConversation.isTyping = true;

    setTimeout(() => {
      if (!this.selectedConversation) return;
      
      this.selectedConversation.isTyping = false;
      
      const responses = [
        'Merci pour votre message !',
        'D\'accord, je comprends.',
        'Je vous remercie pour ces informations.',
        'Parfait, je note.',
        'Entendu, merci docteur.'
      ];

      const randomResponse = responses[Math.floor(Math.random() * responses.length)];

      const responseMessage: Message = {
        id: `m${Date.now()}`,
        content: randomResponse,
        time: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
        isSent: false,
        isRead: false,
        type: 'text'
      };

      this.selectedConversation.messages.push(responseMessage);
      this.selectedConversation.lastMessage = randomResponse;
      this.selectedConversation.lastMessageTime = 'À l\'instant';
      this.selectedConversation.unreadCount++;

      this.shouldScrollToBottom = true;
    }, 1500);
  }

  handleEnterKey(event: KeyboardEvent): void {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      this.sendMessage();
    }
  }

  handleTyping(): void {
    // Logique pour indiquer que l'utilisateur est en train d'écrire
    console.log('User is typing...');
  }

  scrollToBottom(): void {
    try {
      if (this.messagesContainer) {
        this.messagesContainer.nativeElement.scrollTop = this.messagesContainer.nativeElement.scrollHeight;
      }
    } catch (err) {
      console.error('Scroll error:', err);
    }
  }

  openNewMessage(): void {
    console.log('Open new message dialog');
    alert('Fonctionnalité "Nouveau message" - À implémenter avec une liste de patients');
  }

  attachFile(): void {
    console.log('Attach file');
    alert('Fonctionnalité "Joindre un fichier" - À implémenter');
  }

  openEmoji(): void {
    console.log('Open emoji picker');
    alert('Fonctionnalité "Emoji" - À implémenter avec un sélecteur d\'emoji');
  }

  startVideoCall(): void {
    if (!this.selectedConversation) return;
    console.log('Start video call with:', this.selectedConversation.name);
    alert(`Démarrage de l'appel vidéo avec ${this.selectedConversation.name}\n\nCette fonctionnalité nécessite l'intégration d'un service de visioconférence.`);
  }

  startAudioCall(): void {
    if (!this.selectedConversation) return;
    console.log('Start audio call with:', this.selectedConversation.name);
    alert(`Démarrage de l'appel audio avec ${this.selectedConversation.name}\n\nCette fonctionnalité nécessite l'intégration d'un service d'appel.`);
  }

  openPatientDossier(): void {
    if (!this.selectedConversation) return;
    console.log('Open patient dossier:', this.selectedConversation.patientId);
    alert(`Ouverture du dossier de ${this.selectedConversation.name}\nID: ${this.selectedConversation.patientId}\n\nNavigation vers /dossiers/${this.selectedConversation.patientId}`);
    // this.router.navigate(['/dossiers', this.selectedConversation.patientId]);
  }

  scheduleAppointment(): void {
    if (!this.selectedConversation) return;
    console.log('Schedule appointment with:', this.selectedConversation.name);
    alert(`Prise de rendez-vous avec ${this.selectedConversation.name}\n\nNavigation vers /agenda avec le patient pré-sélectionné`);
    // this.router.navigate(['/agenda'], { queryParams: { patientId: this.selectedConversation.patientId } });
  }

  archiveConversation(): void {
    if (!this.selectedConversation) return;
    
    if (confirm(`Voulez-vous archiver la conversation avec ${this.selectedConversation.name} ?`)) {
      this.selectedConversation.isArchived = true;
      this.selectedConversation = null;
      this.filterConversations();
      alert('Conversation archivée avec succès');
    }
  }

  toggleChatOptions(): void {
    this.showInfoPanel = !this.showInfoPanel;
  }

  closeInfoPanel(): void {
    this.showInfoPanel = false;
  }

  closeMobileChat(): void {
    this.selectedConversation = null;
  }
}
