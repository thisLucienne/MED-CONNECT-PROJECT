const { db } = require('../config/database');
const { messages, users, notifications } = require('../db/schema');
const { eq, and, or, desc, asc } = require('drizzle-orm');
const emailService = require('./emailService');

class MessageService {
  // Envoyer un message
  async envoyerMessage(expediteurId, destinataireId, contenu, objet = null) {
    try {
      // Vérifier que les utilisateurs existent
      const expediteur = await db.select().from(users).where(eq(users.id, expediteurId)).limit(1);
      const destinataire = await db.select().from(users).where(eq(users.id, destinataireId)).limit(1);

      if (!expediteur.length || !destinataire.length) {
        throw new Error('Utilisateur non trouvé');
      }

      // Créer le message
      const [nouveauMessage] = await db.insert(messages).values({
        contenu,
        expediteur: expediteurId,
        destinataire: destinataireId,
        objet: objet || `Message de ${expediteur[0].firstName} ${expediteur[0].lastName}`,
        type: 'MESSAGE'
      }).returning();

      // Créer une notification pour le destinataire si c'est un médecin
      if (destinataire[0].role === 'DOCTOR') {
        await this.creerNotificationMessage(destinataireId, expediteur[0], nouveauMessage);
      }

      return nouveauMessage;
    } catch (error) {
      console.error('Erreur lors de l\'envoi du message:', error);
      throw error;
    }
  }

  // Récupérer les messages d'une conversation
  async obtenirConversation(utilisateur1Id, utilisateur2Id, page = 1, limite = 50) {
    try {
      const offset = (page - 1) * limite;

      const messagesConversation = await db
        .select({
          id: messages.id,
          contenu: messages.contenu,
          objet: messages.objet,
          dateEnvoi: messages.dateEnvoi,
          confirmationLecture: messages.confirmationLecture,
          expediteur: {
            id: users.id,
            firstName: users.firstName,
            lastName: users.lastName,
            role: users.role,
            profilePicture: users.profilePicture
          }
        })
        .from(messages)
        .innerJoin(users, eq(messages.expediteur, users.id))
        .where(
          or(
            and(eq(messages.expediteur, utilisateur1Id), eq(messages.destinataire, utilisateur2Id)),
            and(eq(messages.expediteur, utilisateur2Id), eq(messages.destinataire, utilisateur1Id))
          )
        )
        .orderBy(desc(messages.dateEnvoi))
        .limit(limite)
        .offset(offset);

      return messagesConversation;
    } catch (error) {
      console.error('Erreur lors de la récupération de la conversation:', error);
      throw error;
    }
  }

  // Marquer un message comme lu
  async marquerCommeLu(messageId, utilisateurId) {
    try {
      const [message] = await db
        .select()
        .from(messages)
        .where(eq(messages.id, messageId))
        .limit(1);

      if (!message) {
        throw new Error('Message non trouvé');
      }

      if (message.destinataire !== utilisateurId) {
        throw new Error('Non autorisé à marquer ce message comme lu');
      }

      await db
        .update(messages)
        .set({ 
          confirmationLecture: true,
          dateModification: new Date()
        })
        .where(eq(messages.id, messageId));

      return { success: true };
    } catch (error) {
      console.error('Erreur lors du marquage comme lu:', error);
      throw error;
    }
  }

  // Obtenir les conversations d'un utilisateur
  async obtenirConversations(utilisateurId) {
    try {
      // Récupérer les derniers messages de chaque conversation
      const conversations = await db
        .select({
          id: messages.id,
          contenu: messages.contenu,
          objet: messages.objet,
          dateEnvoi: messages.dateEnvoi,
          confirmationLecture: messages.confirmationLecture,
          expediteur: {
            id: users.id,
            firstName: users.firstName,
            lastName: users.lastName,
            role: users.role,
            profilePicture: users.profilePicture
          },
          destinataire: messages.destinataire
        })
        .from(messages)
        .innerJoin(users, eq(messages.expediteur, users.id))
        .where(
          or(
            eq(messages.expediteur, utilisateurId),
            eq(messages.destinataire, utilisateurId)
          )
        )
        .orderBy(desc(messages.dateEnvoi));

      // Grouper par conversation (utilisateur)
      const conversationsGroupees = {};
      
      conversations.forEach(message => {
        const autreUtilisateur = message.expediteur.id === utilisateurId 
          ? message.destinataire 
          : message.expediteur.id;
        
        if (!conversationsGroupees[autreUtilisateur]) {
          conversationsGroupees[autreUtilisateur] = {
            utilisateur: message.expediteur.id === utilisateurId ? null : message.expediteur,
            dernierMessage: message,
            messagesNonLus: 0
          };
        }

        // Compter les messages non lus
        if (message.destinataire === utilisateurId && !message.confirmationLecture) {
          conversationsGroupees[autreUtilisateur].messagesNonLus++;
        }
      });

      // Récupérer les infos des autres utilisateurs pour les conversations où on est expéditeur
      for (const [autreUtilisateurId, conversation] of Object.entries(conversationsGroupees)) {
        if (!conversation.utilisateur) {
          const [autreUtilisateur] = await db
            .select({
              id: users.id,
              firstName: users.firstName,
              lastName: users.lastName,
              role: users.role,
              profilePicture: users.profilePicture
            })
            .from(users)
            .where(eq(users.id, autreUtilisateurId))
            .limit(1);
          
          conversation.utilisateur = autreUtilisateur;
        }
      }

      return Object.values(conversationsGroupees);
    } catch (error) {
      console.error('Erreur lors de la récupération des conversations:', error);
      throw error;
    }
  }

  // Créer une notification pour un nouveau message
  async creerNotificationMessage(destinataireId, expediteur, message) {
    try {
      await db.insert(notifications).values({
        destinataire: destinataireId,
        titre: `Nouveau message de ${expediteur.firstName} ${expediteur.lastName}`,
        contenu: message.contenu.substring(0, 100) + (message.contenu.length > 100 ? '...' : ''),
        type: 'USER_ACTION'
      });
    } catch (error) {
      console.error('Erreur lors de la création de la notification:', error);
    }
  }



  // Rechercher des médecins pour un patient
  async rechercherMedecins(patientId, specialite = null, nom = null) {
    try {
      let query = db
        .select({
          id: users.id,
          firstName: users.firstName,
          lastName: users.lastName,
          profilePicture: users.profilePicture,
          specialty: doctors.specialty,
          licenseNumber: doctors.licenseNumber
        })
        .from(users)
        .innerJoin(doctors, eq(users.id, doctors.userId))
        .where(
          and(
            eq(users.role, 'DOCTOR'),
            eq(users.status, 'APPROVED')
          )
        );

      if (specialite) {
        query = query.where(eq(doctors.specialty, specialite));
      }

      if (nom) {
        query = query.where(
          or(
            eq(users.firstName, nom),
            eq(users.lastName, nom)
          )
        );
      }

      const medecins = await query.limit(20);
      return medecins;
    } catch (error) {
      console.error('Erreur lors de la recherche de médecins:', error);
      throw error;
    }
  }
}

module.exports = new MessageService();