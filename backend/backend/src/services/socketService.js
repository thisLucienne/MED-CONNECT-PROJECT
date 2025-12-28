const { Server } = require('socket.io');
const JWTUtils = require('../utils/jwt');
const { db } = require('../config/database');
const { users, messages } = require('../db/schema');
const { eq, and, or } = require('drizzle-orm');
const messageService = require('./messageService');

class SocketService {
  constructor() {
    this.io = null;
    // Map pour stocker les utilisateurs connectés: userId -> socketId
    this.connectedUsers = new Map();
    // Map pour stocker les typing indicators: {userId1, userId2} -> timestamp
    this.typingUsers = new Map();
  }

  /**
   * Initialiser Socket.IO avec le serveur HTTP
   */
  initialize(server) {
    this.io = new Server(server, {
      cors: {
        origin: '*', // À configurer selon vos besoins
        methods: ['GET', 'POST'],
        credentials: true
      },
      transports: ['websocket', 'polling']
    });

    // Middleware d'authentification Socket.IO
    this.io.use(async (socket, next) => {
      try {
        const token = socket.handshake.auth.token || socket.handshake.headers.authorization?.replace('Bearer ', '');
        
        if (!token) {
          return next(new Error('Token d\'authentification requis'));
        }

        // Vérifier le token
        const decoded = JWTUtils.verifyToken(token);

        if (!JWTUtils.isAccessToken(token)) {
          return next(new Error('Type de token invalide'));
        }

        // Vérifier si l'utilisateur existe
        const user = await db.select().from(users).where(eq(users.id, decoded.userId)).limit(1);

        if (user.length === 0) {
          return next(new Error('Utilisateur introuvable'));
        }

        const userData = user[0];

        // Vérifier le statut du compte
        if (userData.status === 'BLOCKED' || userData.status === 'REJECTED') {
          return next(new Error('Compte bloqué ou rejeté'));
        }

        // Ajouter les informations utilisateur au socket
        socket.userId = userData.id;
        socket.user = {
          id: userData.id,
          email: userData.email,
          firstName: userData.firstName,
          lastName: userData.lastName,
          role: userData.role,
          profilePicture: userData.profilePicture
        };

        next();
      } catch (error) {
        console.error('Erreur authentification Socket.IO:', error);
        next(new Error('Authentification échouée'));
      }
    });

    // Gestion des connexions
    this.io.on('connection', (socket) => {
      this.handleConnection(socket);
    });

    console.log('✅ Socket.IO initialisé avec succès');
  }

  /**
   * Gérer une nouvelle connexion Socket.IO
   */
  handleConnection(socket) {
    const userId = socket.userId;
    const user = socket.user;

    console.log(`🔌 Utilisateur connecté: ${user.firstName} ${user.lastName} (${userId})`);

    // Enregistrer l'utilisateur comme connecté
    this.connectedUsers.set(userId, socket.id);
    socket.join(`user:${userId}`); // Room pour l'utilisateur

    // Notifier les autres utilisateurs que cet utilisateur est en ligne
    socket.broadcast.emit('user:online', {
      userId,
      user: {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        profilePicture: user.profilePicture
      }
    });

    // Envoyer la liste des utilisateurs en ligne à l'utilisateur qui vient de se connecter
    const onlineUsers = Array.from(this.connectedUsers.keys());
    socket.emit('users:online', onlineUsers);

    // ========== ÉVÉNEMENTS DE MESSAGERIE ==========

    /**
     * Événement: Envoyer un message
     */
    socket.on('message:send', async (data) => {
      try {
        const { destinataireId, contenu, objet } = data;

        if (!destinataireId || !contenu) {
          return socket.emit('message:error', {
            message: 'Destinataire et contenu requis'
          });
        }

        // Envoyer le message via le service
        const message = await messageService.envoyerMessage(
          userId,
          destinataireId,
          contenu,
          objet
        );

        // Préparer les données du message pour l'émission
        const messageData = {
          id: message.id,
          expediteur: {
            id: user.id,
            firstName: user.firstName,
            lastName: user.lastName,
            profilePicture: user.profilePicture
          },
          destinataireId,
          contenu: message.contenu,
          objet: message.objet,
          dateEnvoi: message.dateEnvoi,
          confirmationLecture: message.confirmationLecture
        };

        // Envoyer le message à l'expéditeur (confirmation)
        socket.emit('message:sent', messageData);

        // Envoyer le message au destinataire s'il est en ligne
        const destinataireSocketId = this.connectedUsers.get(destinataireId);
        if (destinataireSocketId) {
          this.io.to(destinataireSocketId).emit('message:received', messageData);
        }

        // Notifier le destinataire même s'il n'est pas en ligne (pour les notifications)
        this.io.to(`user:${destinataireId}`).emit('message:new', messageData);

      } catch (error) {
        console.error('Erreur envoi message Socket.IO:', error);
        socket.emit('message:error', {
          message: error.message || 'Erreur lors de l\'envoi du message'
        });
      }
    });

    /**
     * Événement: Marquer un message comme lu
     */
    socket.on('message:read', async (data) => {
      try {
        const { messageId } = data;

        if (!messageId) {
          return socket.emit('message:error', {
            message: 'ID du message requis'
          });
        }

        // Marquer le message comme lu via le service
        await messageService.marquerCommeLu(messageId, userId);

        // Notifier l'expéditeur que son message a été lu
        const message = await db.select().from(messages).where(eq(messages.id, messageId)).limit(1);
        
        if (message.length > 0 && message[0].expediteur !== userId) {
          const expediteurSocketId = this.connectedUsers.get(message[0].expediteur);
          if (expediteurSocketId) {
            this.io.to(expediteurSocketId).emit('message:read:notification', {
              messageId,
              luPar: userId,
              dateLecture: new Date()
            });
          }
        }

        socket.emit('message:read:confirmed', { messageId });

      } catch (error) {
        console.error('Erreur marquage message lu Socket.IO:', error);
        socket.emit('message:error', {
          message: error.message || 'Erreur lors du marquage du message'
        });
      }
    });

    // ========== ÉVÉNEMENTS DE PRÉSENCE ==========

    /**
     * Événement: Demander le statut d'un utilisateur
     */
    socket.on('user:status', (data) => {
      const { userId: targetUserId } = data;
      
      if (!targetUserId) {
        return socket.emit('user:status:error', {
          message: 'ID utilisateur requis'
        });
      }

      const isOnline = this.connectedUsers.has(targetUserId);
      socket.emit('user:status:response', {
        userId: targetUserId,
        isOnline,
        lastSeen: isOnline ? null : new Date() // Vous pouvez stocker lastSeen en DB
      });
    });

    // ========== ÉVÉNEMENTS TYPING INDICATOR ==========

    /**
     * Événement: Utilisateur commence à écrire
     */
    socket.on('typing:start', (data) => {
      const { destinataireId } = data;

      if (!destinataireId) {
        return;
      }

      const typingKey = `${userId}-${destinataireId}`;
      this.typingUsers.set(typingKey, Date.now());

      // Notifier le destinataire
      const destinataireSocketId = this.connectedUsers.get(destinataireId);
      if (destinataireSocketId) {
        this.io.to(destinataireSocketId).emit('typing:start', {
          userId,
          user: {
            id: user.id,
            firstName: user.firstName,
            lastName: user.lastName
          }
        });
      }

      // Nettoyer après 3 secondes si pas de stop
      setTimeout(() => {
        if (this.typingUsers.has(typingKey)) {
          const timestamp = this.typingUsers.get(typingKey);
          // Si le timestamp n'a pas changé, c'est qu'il n'a pas envoyé de stop
          if (Date.now() - timestamp > 3000) {
            this.typingUsers.delete(typingKey);
            if (destinataireSocketId) {
              this.io.to(destinataireSocketId).emit('typing:stop', { userId });
            }
          }
        }
      }, 3000);
    });

    /**
     * Événement: Utilisateur arrête d'écrire
     */
    socket.on('typing:stop', (data) => {
      const { destinataireId } = data;

      if (!destinataireId) {
        return;
      }

      const typingKey = `${userId}-${destinataireId}`;
      this.typingUsers.delete(typingKey);

      // Notifier le destinataire
      const destinataireSocketId = this.connectedUsers.get(destinataireId);
      if (destinataireSocketId) {
        this.io.to(destinataireSocketId).emit('typing:stop', { userId });
      }
    });

    // ========== GESTION DE LA DÉCONNEXION ==========

    socket.on('disconnect', () => {
      console.log(`🔌 Utilisateur déconnecté: ${user.firstName} ${user.lastName} (${userId})`);

      // Retirer l'utilisateur de la liste des connectés
      this.connectedUsers.delete(userId);

      // Nettoyer les typing indicators
      for (const [key, value] of this.typingUsers.entries()) {
        if (key.startsWith(`${userId}-`) || key.endsWith(`-${userId}`)) {
          this.typingUsers.delete(key);
          
          // Notifier les destinataires
          const parts = key.split('-');
          const otherUserId = parts[0] === userId ? parts[1] : parts[0];
          const otherSocketId = this.connectedUsers.get(otherUserId);
          if (otherSocketId) {
            this.io.to(otherSocketId).emit('typing:stop', { userId });
          }
        }
      }

      // Notifier les autres utilisateurs que cet utilisateur est hors ligne
      socket.broadcast.emit('user:offline', { userId });
    });
  }

  /**
   * Obtenir l'instance Socket.IO
   */
  getIO() {
    return this.io;
  }

  /**
   * Vérifier si un utilisateur est en ligne
   */
  isUserOnline(userId) {
    return this.connectedUsers.has(userId);
  }

  /**
   * Obtenir la liste des utilisateurs en ligne
   */
  getOnlineUsers() {
    return Array.from(this.connectedUsers.keys());
  }

  /**
   * Envoyer un message à un utilisateur spécifique (utilitaire)
   */
  sendToUser(userId, event, data) {
    const socketId = this.connectedUsers.get(userId);
    if (socketId) {
      this.io.to(socketId).emit(event, data);
    }
  }

  /**
   * Envoyer un message à tous les utilisateurs d'un rôle spécifique
   */
  sendToRole(role, event, data) {
    this.io.to(`role:${role}`).emit(event, data);
  }
}

// Export d'une instance singleton
module.exports = new SocketService();

