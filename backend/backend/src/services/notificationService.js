const { db } = require('../config/database');
const { notifications, users } = require('../db/schema');
const { eq, and, desc, count } = require('drizzle-orm');
const emailService = require('./emailService');

class NotificationService {
  // Créer une notification système
  async creerNotificationSysteme(destinataireId, titre, contenu, type = 'SYSTEM') {
    try {
      const [notification] = await db.insert(notifications).values({
        destinataire: destinataireId,
        titre,
        contenu,
        type
      }).returning();

      return notification;
    } catch (error) {
      console.error('Erreur lors de la création de la notification:', error);
      throw error;
    }
  }

  // Notifier l'admin d'une nouvelle inscription de médecin
  async notifierNouvelleInscriptionMedecin(medecin) {
    try {
      // Récupérer tous les admins
      const admins = await db
        .select()
        .from(users)
        .where(eq(users.role, 'ADMIN'));

      const notifications = [];
      
      for (const admin of admins) {
        const notification = await this.creerNotificationSysteme(
          admin.id,
          'Nouvelle demande d\'inscription médecin',
          `Le Dr ${medecin.firstName} ${medecin.lastName} (${medecin.specialty}) a soumis une demande d'inscription. Numéro de licence: ${medecin.licenseNumber}`,
          'USER_ACTION'
        );
        notifications.push(notification);

        // Envoyer un email à l'admin
        await this.envoyerEmailNotificationAdmin(admin, medecin);
      }

      return notifications;
    } catch (error) {
      console.error('Erreur lors de la notification d\'inscription médecin:', error);
      throw error;
    }
  }

  // Notifier l'admin d'une nouvelle inscription de patient
  async notifierNouvelleInscriptionPatient(patient) {
    try {
      const admins = await db
        .select()
        .from(users)
        .where(eq(users.role, 'ADMIN'));

      const notifications = [];
      
      for (const admin of admins) {
        const notification = await this.creerNotificationSysteme(
          admin.id,
          'Nouvelle inscription patient',
          `${patient.firstName} ${patient.lastName} s'est inscrit sur la plateforme.`,
          'USER_ACTION'
        );
        notifications.push(notification);
      }

      return notifications;
    } catch (error) {
      console.error('Erreur lors de la notification d\'inscription patient:', error);
      throw error;
    }
  }

  // Récupérer les notifications d'un utilisateur
  async obtenirNotifications(utilisateurId, page = 1, limite = 20, nonLuesUniquement = false) {
    try {
      const offset = (page - 1) * limite;
      
      let query = db
        .select()
        .from(notifications)
        .where(eq(notifications.destinataire, utilisateurId));

      if (nonLuesUniquement) {
        query = query.where(eq(notifications.lu, false));
      }

      const notificationsUtilisateur = await query
        .orderBy(desc(notifications.dateCreation))
        .limit(limite)
        .offset(offset);

      return notificationsUtilisateur;
    } catch (error) {
      console.error('Erreur lors de la récupération des notifications:', error);
      throw error;
    }
  }

  // Marquer une notification comme lue
  async marquerCommeLue(notificationId, utilisateurId) {
    try {
      const [notification] = await db
        .select()
        .from(notifications)
        .where(eq(notifications.id, notificationId))
        .limit(1);

      if (!notification) {
        throw new Error('Notification non trouvée');
      }

      if (notification.destinataire !== utilisateurId) {
        throw new Error('Non autorisé à modifier cette notification');
      }

      await db
        .update(notifications)
        .set({ 
          lu: true,
          dateModification: new Date()
        })
        .where(eq(notifications.id, notificationId));

      return { success: true };
    } catch (error) {
      console.error('Erreur lors du marquage comme lue:', error);
      throw error;
    }
  }

  // Marquer toutes les notifications comme lues
  async marquerToutesCommeLues(utilisateurId) {
    try {
      await db
        .update(notifications)
        .set({ 
          lu: true,
          dateModification: new Date()
        })
        .where(
          and(
            eq(notifications.destinataire, utilisateurId),
            eq(notifications.lu, false)
          )
        );

      return { success: true };
    } catch (error) {
      console.error('Erreur lors du marquage de toutes les notifications:', error);
      throw error;
    }
  }

  // Compter les notifications non lues
  async compterNotificationsNonLues(utilisateurId) {
    try {
      const [result] = await db
        .select({ count: count() })
        .from(notifications)
        .where(
          and(
            eq(notifications.destinataire, utilisateurId),
            eq(notifications.lu, false)
          )
        );

      return result.count;
    } catch (error) {
      console.error('Erreur lors du comptage des notifications non lues:', error);
      throw error;
    }
  }

  // Supprimer une notification
  async supprimerNotification(notificationId, utilisateurId) {
    try {
      const [notification] = await db
        .select()
        .from(notifications)
        .where(eq(notifications.id, notificationId))
        .limit(1);

      if (!notification) {
        throw new Error('Notification non trouvée');
      }

      if (notification.destinataire !== utilisateurId) {
        throw new Error('Non autorisé à supprimer cette notification');
      }

      await db
        .delete(notifications)
        .where(eq(notifications.id, notificationId));

      return { success: true };
    } catch (error) {
      console.error('Erreur lors de la suppression de la notification:', error);
      throw error;
    }
  }

  // Envoyer un email de notification à l'admin
  async envoyerEmailNotificationAdmin(admin, medecin) {
    try {
      const templateData = {
        adminNom: `${admin.firstName} ${admin.lastName}`,
        medecinNom: `${medecin.firstName} ${medecin.lastName}`,
        specialite: medecin.specialty,
        numeroLicence: medecin.licenseNumber,
        email: medecin.email,
        telephone: medecin.phone || 'Non renseigné',
        dateInscription: new Date().toLocaleString('fr-FR')
      };

      await emailService.envoyerEmail(
        admin.email,
        'Nouvelle demande d\'inscription médecin - Med Connect',
        'admin-notification',
        templateData
      );
    } catch (error) {
      console.error('Erreur lors de l\'envoi de l\'email à l\'admin:', error);
    }
  }

  // Créer des notifications pour les activités système importantes
  async notifierActiviteSysteme(titre, contenu, type = 'SYSTEM') {
    try {
      const admins = await db
        .select()
        .from(users)
        .where(eq(users.role, 'ADMIN'));

      const notifications = [];
      
      for (const admin of admins) {
        const notification = await this.creerNotificationSysteme(
          admin.id,
          titre,
          contenu,
          type
        );
        notifications.push(notification);
      }

      return notifications;
    } catch (error) {
      console.error('Erreur lors de la notification d\'activité système:', error);
      throw error;
    }
  }

  // Nettoyer les anciennes notifications (plus de 30 jours)
  async nettoyerAnciennesNotifications() {
    try {
      const dateLimit = new Date();
      dateLimit.setDate(dateLimit.getDate() - 30);

      const result = await db
        .delete(notifications)
        .where(
          and(
            eq(notifications.lu, true),
            // notifications.dateCreation < dateLimit
          )
        );

      console.log(`${result.rowCount} anciennes notifications supprimées`);
      return result.rowCount;
    } catch (error) {
      console.error('Erreur lors du nettoyage des notifications:', error);
      throw error;
    }
  }
}

module.exports = new NotificationService();