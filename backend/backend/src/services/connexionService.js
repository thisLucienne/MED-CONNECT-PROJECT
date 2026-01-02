const { db } = require('../config/database');
const { demandesConnexion, users, doctors } = require('../db/schema');
const { eq, and, desc } = require('drizzle-orm');
const notificationService = require('./notificationService');

class ConnexionService {
  // Envoyer une demande de connexion à un médecin
  async envoyerDemandeConnexion(patientId, medecinId, message = null) {
    try {
      // Vérifier que le médecin existe et est approuvé
      const [medecin] = await db
        .select({
          id: users.id,
          firstName: users.firstName,
          lastName: users.lastName,
          email: users.email,
          specialty: doctors.specialty
        })
        .from(users)
        .innerJoin(doctors, eq(users.id, doctors.userId))
        .where(and(
          eq(users.id, medecinId),
          eq(users.role, 'DOCTOR'),
          eq(users.status, 'APPROVED')
        ))
        .limit(1);

      if (!medecin) {
        throw new Error('Médecin non trouvé ou non approuvé');
      }

      // Vérifier qu'il n'y a pas déjà une demande en attente
      const [demandeExistante] = await db
        .select()
        .from(demandesConnexion)
        .where(and(
          eq(demandesConnexion.idPatient, patientId),
          eq(demandesConnexion.idMedecin, medecinId),
          eq(demandesConnexion.statut, 'EN_ATTENTE')
        ))
        .limit(1);

      if (demandeExistante) {
        throw new Error('Une demande de connexion est déjà en attente pour ce médecin');
      }

      // Créer la demande
      const [demande] = await db.insert(demandesConnexion).values({
        idPatient: patientId,
        idMedecin: medecinId,
        message: message || `Demande de connexion pour accès au dossier médical`,
        statut: 'EN_ATTENTE'
      }).returning();

      // Notifier le médecin
      const [patient] = await db
        .select()
        .from(users)
        .where(eq(users.id, patientId))
        .limit(1);

      await notificationService.creerNotificationSysteme(
        medecinId,
        'Nouvelle demande de connexion',
        `${patient.firstName} ${patient.lastName} souhaite vous donner accès à son dossier médical.`,
        'USER_ACTION'
      );

      return demande;
    } catch (error) {
      console.error('Erreur lors de l\'envoi de la demande:', error);
      throw error;
    }
  }

  // Répondre à une demande de connexion (médecin)
  async repondreDemandeConnexion(demandeId, medecinId, reponse, raisonRefus = null) {
    try {
      // Vérifier que la demande existe et appartient au médecin
      const [demande] = await db
        .select()
        .from(demandesConnexion)
        .where(and(
          eq(demandesConnexion.id, demandeId),
          eq(demandesConnexion.idMedecin, medecinId),
          eq(demandesConnexion.statut, 'EN_ATTENTE')
        ))
        .limit(1);

      if (!demande) {
        throw new Error('Demande non trouvée ou déjà traitée');
      }

      const nouveauStatut = reponse === 'accepter' ? 'ACCEPTEE' : 'REFUSEE';

      // Mettre à jour la demande
      await db
        .update(demandesConnexion)
        .set({
          statut: nouveauStatut,
          dateReponse: new Date()
        })
        .where(eq(demandesConnexion.id, demandeId));

      // Si acceptée, créer l'accès au dossier
      if (reponse === 'accepter') {
        // Récupérer tous les dossiers du patient
        const { dossiersMedicaux, accesDossiers } = require('../db/schema');
        
        const dossiersPatient = await db
          .select()
          .from(dossiersMedicaux)
          .where(eq(dossiersMedicaux.idPatient, demande.idPatient));

        // Donner accès à tous les dossiers du patient
        for (const dossier of dossiersPatient) {
          await db.insert(accesDossiers).values({
            idDossier: dossier.id,
            idMedecin: medecinId,
            typeAcces: 'LECTURE',
            statut: 'ACTIF'
          }).onConflictDoNothing();
        }
      }

      // Notifier le patient
      const [medecin] = await db
        .select()
        .from(users)
        .where(eq(users.id, medecinId))
        .limit(1);

      const messageNotification = reponse === 'accepter' 
        ? `Le Dr ${medecin.firstName} ${medecin.lastName} a accepté votre demande de connexion.`
        : `Le Dr ${medecin.firstName} ${medecin.lastName} a refusé votre demande de connexion.${raisonRefus ? ' Raison: ' + raisonRefus : ''}`;

      await notificationService.creerNotificationSysteme(
        demande.idPatient,
        `Réponse à votre demande de connexion`,
        messageNotification,
        'USER_ACTION'
      );

      return { success: true, statut: nouveauStatut };
    } catch (error) {
      console.error('Erreur lors de la réponse à la demande:', error);
      throw error;
    }
  }

  // Obtenir les demandes de connexion d'un médecin
  async obtenirDemandesMedecin(medecinId, statut = null) {
    try {
      let query = db
        .select({
          id: demandesConnexion.id,
          message: demandesConnexion.message,
          statut: demandesConnexion.statut,
          dateCreation: demandesConnexion.dateCreation,
          dateReponse: demandesConnexion.dateReponse,
          patient: {
            id: users.id,
            firstName: users.firstName,
            lastName: users.lastName,
            email: users.email,
            profilePicture: users.profilePicture
          }
        })
        .from(demandesConnexion)
        .innerJoin(users, eq(demandesConnexion.idPatient, users.id))
        .where(eq(demandesConnexion.idMedecin, medecinId));

      if (statut) {
        query = query.where(eq(demandesConnexion.statut, statut));
      }

      const demandes = await query.orderBy(desc(demandesConnexion.dateCreation));
      return demandes;
    } catch (error) {
      console.error('Erreur lors de la récupération des demandes:', error);
      throw error;
    }
  }

  // Obtenir les demandes de connexion d'un patient
  async obtenirDemandesPatient(patientId) {
    try {
      const demandes = await db
        .select({
          id: demandesConnexion.id,
          message: demandesConnexion.message,
          statut: demandesConnexion.statut,
          dateCreation: demandesConnexion.dateCreation,
          dateReponse: demandesConnexion.dateReponse,
          medecin: {
            id: users.id,
            firstName: users.firstName,
            lastName: users.lastName,
            profilePicture: users.profilePicture,
            specialty: doctors.specialty
          }
        })
        .from(demandesConnexion)
        .innerJoin(users, eq(demandesConnexion.idMedecin, users.id))
        .innerJoin(doctors, eq(users.id, doctors.userId))
        .where(eq(demandesConnexion.idPatient, patientId))
        .orderBy(desc(demandesConnexion.dateCreation));

      return demandes;
    } catch (error) {
      console.error('Erreur lors de la récupération des demandes patient:', error);
      throw error;
    }
  }
}

module.exports = new ConnexionService();