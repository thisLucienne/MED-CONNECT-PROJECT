# Guide d'Intégration Socket.IO - Med Connect

Ce guide explique comment intégrer Socket.IO dans votre application frontend pour la messagerie instantanée, la présence en ligne et les indicateurs de frappe.

## 📋 Table des matières

1. [Configuration Backend](#configuration-backend)
2. [Installation Frontend](#installation-frontend)
3. [Connexion au serveur Socket.IO](#connexion-au-serveur)
4. [Messagerie Instantanée](#messagerie-instantanée)
5. [Présence en ligne/hors ligne](#présence-en-ligne)
6. [Indicateur "En train d'écrire"](#indicateur-de-frappe)
7. [Exemples complets](#exemples-complets)

---

## 🔧 Configuration Backend

Le backend est déjà configuré avec Socket.IO. Le serveur écoute sur le même port que l'API REST (par défaut: `5000`).

### URL de connexion Socket.IO

```
http://194.238.25.170:5000
```

---

## 📦 Installation Frontend

### Angular

```bash
npm install socket.io-client
```

### React

```bash
npm install socket.io-client
```

### Vue.js

```bash
npm install socket.io-client
```

---

## 🔌 Connexion au serveur

### Exemple avec Angular

```typescript
// socket.service.ts
import { Injectable } from '@angular/core';
import { io, Socket } from 'socket.io-client';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SocketService {
  private socket: Socket;
  private readonly API_URL = 'http://194.238.25.170:5000';

  constructor() {
    // Récupérer le token depuis le localStorage ou le service d'auth
    const token = localStorage.getItem('accessToken');
    
    this.socket = io(this.API_URL, {
      auth: {
        token: token
      },
      transports: ['websocket', 'polling']
    });

    this.setupEventListeners();
  }

  private setupEventListeners() {
    // Écouter la connexion
    this.socket.on('connect', () => {
      console.log('✅ Connecté à Socket.IO');
    });

    // Écouter les erreurs
    this.socket.on('connect_error', (error) => {
      console.error('❌ Erreur de connexion Socket.IO:', error);
    });

    // Écouter la déconnexion
    this.socket.on('disconnect', () => {
      console.log('🔌 Déconnecté de Socket.IO');
    });
  }

  // Obtenir l'instance du socket
  getSocket(): Socket {
    return this.socket;
  }

  // Se déconnecter
  disconnect() {
    this.socket.disconnect();
  }
}
```

### Exemple avec React

```typescript
// useSocket.ts
import { useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';

const API_URL = 'http://194.238.25.170:5000';

export const useSocket = (token: string) => {
  const [socket, setSocket] = useState<Socket | null>(null);

  useEffect(() => {
    if (!token) return;

    const newSocket = io(API_URL, {
      auth: {
        token: token
      },
      transports: ['websocket', 'polling']
    });

    newSocket.on('connect', () => {
      console.log('✅ Connecté à Socket.IO');
    });

    newSocket.on('connect_error', (error) => {
      console.error('❌ Erreur de connexion:', error);
    });

    setSocket(newSocket);

    return () => {
      newSocket.close();
    };
  }, [token]);

  return socket;
};
```

---

## 💬 Messagerie Instantanée

### Envoyer un message

```typescript
// Angular
sendMessage(destinataireId: string, contenu: string, objet?: string) {
  this.socket.emit('message:send', {
    destinataireId,
    contenu,
    objet
  });
}

// React
const sendMessage = (destinataireId: string, contenu: string, objet?: string) => {
  socket?.emit('message:send', {
    destinataireId,
    contenu,
    objet
  });
};
```

### Recevoir un message

```typescript
// Angular
listenForMessages(): Observable<any> {
  return new Observable(observer => {
    this.socket.on('message:received', (message) => {
      observer.next(message);
    });

    // Nettoyer lors de la déconnexion
    return () => {
      this.socket.off('message:received');
    };
  });
}

// React
useEffect(() => {
  if (!socket) return;

  const handleMessage = (message: any) => {
    console.log('Nouveau message reçu:', message);
    // Mettre à jour votre état de messages
  };

  socket.on('message:received', handleMessage);
  socket.on('message:new', handleMessage); // Pour les notifications

  return () => {
    socket.off('message:received', handleMessage);
    socket.off('message:new', handleMessage);
  };
}, [socket]);
```

### Confirmation d'envoi

```typescript
// Écouter la confirmation d'envoi
socket.on('message:sent', (message) => {
  console.log('Message envoyé avec succès:', message);
  // Mettre à jour l'UI (marquer comme envoyé)
});
```

### Marquer un message comme lu

```typescript
// Marquer un message comme lu
markMessageAsRead(messageId: string) {
  this.socket.emit('message:read', { messageId });
}

// Écouter la confirmation
socket.on('message:read:confirmed', (data) => {
  console.log('Message marqué comme lu:', data.messageId);
});

// Écouter quand quelqu'un a lu votre message
socket.on('message:read:notification', (data) => {
  console.log('Votre message a été lu:', data);
  // Mettre à jour l'UI (afficher "lu")
});
```

---

## 🟢 Présence en ligne/hors ligne

### Vérifier si un utilisateur est en ligne

```typescript
// Demander le statut d'un utilisateur
checkUserStatus(userId: string) {
  this.socket.emit('user:status', { userId });
}

// Écouter la réponse
socket.on('user:status:response', (data) => {
  console.log(`Utilisateur ${data.userId}:`, data.isOnline ? 'En ligne' : 'Hors ligne');
  // Mettre à jour l'UI
});
```

### Écouter les changements de statut

```typescript
// Quand un utilisateur se connecte
socket.on('user:online', (data) => {
  console.log('Utilisateur en ligne:', data.userId);
  // Mettre à jour l'UI (afficher le badge "en ligne")
});

// Quand un utilisateur se déconnecte
socket.on('user:offline', (data) => {
  console.log('Utilisateur hors ligne:', data.userId);
  // Mettre à jour l'UI (retirer le badge "en ligne")
});

// Recevoir la liste des utilisateurs en ligne au démarrage
socket.on('users:online', (userIds: string[]) => {
  console.log('Utilisateurs en ligne:', userIds);
  // Mettre à jour votre état avec la liste des utilisateurs en ligne
});
```

### Exemple d'affichage dans l'UI

```typescript
// Component Angular
export class ChatComponent {
  onlineUsers: Set<string> = new Set();

  constructor(private socketService: SocketService) {
    const socket = this.socketService.getSocket();

    // Écouter les utilisateurs en ligne
    socket.on('users:online', (userIds: string[]) => {
      this.onlineUsers = new Set(userIds);
    });

    socket.on('user:online', (data) => {
      this.onlineUsers.add(data.userId);
    });

    socket.on('user:offline', (data) => {
      this.onlineUsers.delete(data.userId);
    });
  }

  isUserOnline(userId: string): boolean {
    return this.onlineUsers.has(userId);
  }
}
```

```html
<!-- Template Angular -->
<div class="user-item">
  <span>{{ user.firstName }} {{ user.lastName }}</span>
  <span *ngIf="isUserOnline(user.id)" class="badge online">En ligne</span>
  <span *ngIf="!isUserOnline(user.id)" class="badge offline">Hors ligne</span>
</div>
```

---

## ⌨️ Indicateur "En train d'écrire"

### Démarrer l'indicateur de frappe

```typescript
// Quand l'utilisateur commence à taper
onTypingStart(destinataireId: string) {
  this.socket.emit('typing:start', { destinataireId });
}

// Quand l'utilisateur arrête de taper
onTypingStop(destinataireId: string) {
  this.socket.emit('typing:stop', { destinataireId });
}
```

### Écouter l'indicateur de frappe

```typescript
// Écouter quand quelqu'un commence à écrire
socket.on('typing:start', (data) => {
  console.log(`${data.user.firstName} est en train d'écrire...`);
  // Afficher "X est en train d'écrire..."
});

// Écouter quand quelqu'un arrête d'écrire
socket.on('typing:stop', (data) => {
  console.log(`${data.userId} a arrêté d'écrire`);
  // Cacher l'indicateur
});
```

### Exemple d'implémentation dans un composant

```typescript
// Angular Component
export class ChatInputComponent {
  private typingTimeout: any;
  private isTyping = false;

  constructor(private socketService: SocketService) {}

  onInputChange(destinataireId: string) {
    if (!this.isTyping) {
      this.isTyping = true;
      this.socketService.getSocket().emit('typing:start', { destinataireId });
    }

    // Réinitialiser le timeout
    clearTimeout(this.typingTimeout);
    this.typingTimeout = setTimeout(() => {
      this.isTyping = false;
      this.socketService.getSocket().emit('typing:stop', { destinataireId });
    }, 1000); // Arrêter après 1 seconde d'inactivité
  }

  onSendMessage(destinataireId: string) {
    // Arrêter l'indicateur de frappe
    if (this.isTyping) {
      this.isTyping = false;
      this.socketService.getSocket().emit('typing:stop', { destinataireId });
    }
    clearTimeout(this.typingTimeout);
  }
}
```

```html
<!-- Template -->
<div class="typing-indicator" *ngIf="isTyping">
  <span>{{ typingUserName }} est en train d'écrire...</span>
</div>
```

---

## 📝 Exemples complets

### Service Angular complet

```typescript
// socket-chat.service.ts
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { Socket } from 'socket.io-client';
import { SocketService } from './socket.service';

export interface Message {
  id: string;
  expediteur: {
    id: string;
    firstName: string;
    lastName: string;
    profilePicture?: string;
  };
  destinataireId: string;
  contenu: string;
  objet?: string;
  dateEnvoi: Date;
  confirmationLecture: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class SocketChatService {
  private socket: Socket;
  private messages$ = new BehaviorSubject<Message[]>([]);
  private onlineUsers$ = new BehaviorSubject<Set<string>>(new Set());
  private typingUsers$ = new BehaviorSubject<Map<string, string>>(new Map());

  constructor(private socketService: SocketService) {
    this.socket = this.socketService.getSocket();
    this.setupListeners();
  }

  private setupListeners() {
    // Messages
    this.socket.on('message:received', (message: Message) => {
      const current = this.messages$.value;
      this.messages$.next([...current, message]);
    });

    this.socket.on('message:sent', (message: Message) => {
      const current = this.messages$.value;
      this.messages$.next([...current, message]);
    });

    // Présence
    this.socket.on('users:online', (userIds: string[]) => {
      this.onlineUsers$.next(new Set(userIds));
    });

    this.socket.on('user:online', (data: any) => {
      const current = this.onlineUsers$.value;
      current.add(data.userId);
      this.onlineUsers$.next(new Set(current));
    });

    this.socket.on('user:offline', (data: any) => {
      const current = this.onlineUsers$.value;
      current.delete(data.userId);
      this.onlineUsers$.next(new Set(current));
    });

    // Typing
    this.socket.on('typing:start', (data: any) => {
      const current = this.typingUsers$.value;
      current.set(data.userId, `${data.user.firstName} ${data.user.lastName}`);
      this.typingUsers$.next(new Map(current));
    });

    this.socket.on('typing:stop', (data: any) => {
      const current = this.typingUsers$.value;
      current.delete(data.userId);
      this.typingUsers$.next(new Map(current));
    });
  }

  // Méthodes publiques
  sendMessage(destinataireId: string, contenu: string, objet?: string) {
    this.socket.emit('message:send', { destinataireId, contenu, objet });
  }

  markAsRead(messageId: string) {
    this.socket.emit('message:read', { messageId });
  }

  startTyping(destinataireId: string) {
    this.socket.emit('typing:start', { destinataireId });
  }

  stopTyping(destinataireId: string) {
    this.socket.emit('typing:stop', { destinataireId });
  }

  checkUserStatus(userId: string) {
    this.socket.emit('user:status', { userId });
  }

  // Observables
  getMessages(): Observable<Message[]> {
    return this.messages$.asObservable();
  }

  getOnlineUsers(): Observable<Set<string>> {
    return this.onlineUsers$.asObservable();
  }

  getTypingUsers(): Observable<Map<string, string>> {
    return this.typingUsers$.asObservable();
  }
}
```

---

## 🎯 Événements Socket.IO disponibles

### Événements émis (Client → Serveur)

| Événement | Données | Description |
|-----------|---------|-------------|
| `message:send` | `{ destinataireId, contenu, objet? }` | Envoyer un message |
| `message:read` | `{ messageId }` | Marquer un message comme lu |
| `user:status` | `{ userId }` | Demander le statut d'un utilisateur |
| `typing:start` | `{ destinataireId }` | Indiquer qu'on commence à écrire |
| `typing:stop` | `{ destinataireId }` | Indiquer qu'on arrête d'écrire |

### Événements reçus (Serveur → Client)

| Événement | Données | Description |
|-----------|---------|-------------|
| `message:received` | `Message` | Nouveau message reçu |
| `message:sent` | `Message` | Confirmation d'envoi |
| `message:new` | `Message` | Notification de nouveau message |
| `message:read:confirmed` | `{ messageId }` | Confirmation de lecture |
| `message:read:notification` | `{ messageId, luPar, dateLecture }` | Notification qu'un message a été lu |
| `message:error` | `{ message }` | Erreur lors de l'envoi |
| `user:online` | `{ userId, user }` | Un utilisateur s'est connecté |
| `user:offline` | `{ userId }` | Un utilisateur s'est déconnecté |
| `users:online` | `string[]` | Liste des utilisateurs en ligne |
| `user:status:response` | `{ userId, isOnline, lastSeen? }` | Réponse au statut d'un utilisateur |
| `typing:start` | `{ userId, user }` | Un utilisateur commence à écrire |
| `typing:stop` | `{ userId }` | Un utilisateur arrête d'écrire |

---

## 🔒 Authentification

L'authentification se fait via le token JWT dans l'objet `auth` lors de la connexion :

```typescript
const socket = io('http://194.238.25.170:5000', {
  auth: {
    token: 'votre-jwt-token'
  }
});
```

Le token doit être un **access token** valide (pas un refresh token).

---

## 🐛 Dépannage

### Erreur de connexion

- Vérifiez que le token JWT est valide
- Vérifiez que le serveur Socket.IO est démarré
- Vérifiez les CORS si vous avez des erreurs de connexion

### Messages non reçus

- Vérifiez que vous écoutez les bons événements
- Vérifiez que le destinataire est connecté
- Vérifiez les logs du serveur pour les erreurs

### Typing indicator ne fonctionne pas

- Assurez-vous d'émettre `typing:stop` quand l'utilisateur envoie le message
- Vérifiez que le destinataire écoute les événements `typing:start` et `typing:stop`

---

## 📚 Ressources

- [Documentation Socket.IO Client](https://socket.io/docs/v4/client-api/)
- [Socket.IO Angular Guide](https://socket.io/docs/v4/client-api/)
- [Socket.IO React Guide](https://socket.io/docs/v4/client-api/)

