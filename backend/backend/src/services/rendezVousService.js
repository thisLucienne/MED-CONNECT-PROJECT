const { db } = require('../config/database');
const { rendezVous, users, accesDossiers, dossiersMedicaux } = require('../db/schema');
const { eq, and, desc, gte } = require('drizzle-orm');
const notificationService = require('./notificationService');

class RendezVousService {
  // Créer un rendez-vous (médecin uniquement)
  async creerRendezVous(medecinId, patientId, dateRendezVous, duree, motif) {
    try {
      // Vérifier que le médecin a accès aux dossiers du patient
      const [acces] = await db
        .select()
        .from(accesDossiers)
        .innerJoin(dossiersMedicaux, eq(accesDossiers.idDossier, dossiersMedicaux.id))
        .where(and(
          eq(dossiersMedicaux.idPatient, patientId),
          eq(accesDossiers.idMedecin, medecinId),
          eq(accesDossiers.statut, 'ACTIF')
        ))
        .limit(1);

      if (!acces) {
        throw new Error('Vous n\'avez pas accès aux dossiers de ce patient');
      }

      // Créer le rendez-vous
      const [rdv] = await db.insert(rendezVous).values({
        idPatient: patientId,
        idMedecin: medecinId,
        dateRendezVous: new Date(dateRendezVous),
        duree: duree || 30,
        motif,
        statut: 'PLANIFIE'
      }).returning();

      // Notifier le patient
      const [medecin] = await db
        .select()
        .from(users)
        .where(eq(users.id, medecinId))
        .limit(1);

      await notificationService.creerNotificationSysteme(
        patientId,
        'Nouveau rendez-vous planifié',
        `Le Dr ${medecin.firstName} ${medecin.lastName} a planifié un rendez-vous pour le ${new Date(dateRendezVous).toLocaleDateString('fr-FR')} à ${new Date(dateRendezVous).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}.`,
        'MEDICAL'
      );

      return rdv;
    } catch (error) {
      console.error('Erreur lors de la création du rendez-vous:', error);
      throw error;
    }
  }

  // Obtenir les rendez-vous d'un patient
  async obtenirRendezVousPatient(patientId, futursUniquement = false) {
    try {
      let query = db
        .select({
          id: rendezVous.id,
          dateRendezVous: rendezVous.dateRendezVous,
          duree: rendezVous.duree,
          motif: rendezVous.motif,
          statut: rendezVous.statut,
          notes: rendezVous.notes,
          dateCreation: rendezVous.dateCreation,
          medecin: {
            id: users.id,
            firstName: users.firstName,
            lastName: users.lastName,
            profilePicture: users.profilePicture
          }
        })
        .from(rendezVous)
        .innerJoin(users, eq(rendezVous.idMedecin, users.id))
        .where(eq(rendezVous.idPatient, patientId));

      if (futursUniquement) {
        query = query.where(gte(rendezVous.dateRendezVous, new Date()));
      }

      const rdvs = await query.orderBy(desc(rendezVous.dateRendezVous));
      return rdvs;
    } catch (error) {
      console.error('Erreur lors de la récupération des rendez-vous patient:', error);
      throw error;
    }
  }

  // Obtenir les rendez-vous d'un médecin
  async obtenirRendezVousMedecin(medecinId, futursUniquement = false) {
    try {
      let query = db
        .select({
          id: rendezVous.id,
          dateRendezVous: rendezVous.dateRendezVous,
          duree: rendezVous.duree,
          motif: rendezVous.motif,
          statut: rendezVous.statut,
          notes: rendezVous.notes,
          dateCreation: rendezVous.dateCreation,
          patient: {
            id: users.id,
            firstName: users.firstName,
            lastName: users.lastName,
            profilePicture: users.profilePicture
          }
        })
        .from(rendezVous)
        .innerJoin(users, eq(rendezVous.idPatient, users.id))
        .where(eq(rendezVous.idMedecin, medecinId));

      if (futursUniquement) {
        query = query.where(gte(rendezVous.dateRendezVous, new Date()));
      }

      const rdvs = await query.orderBy(desc(rendezVous.dateRendezVous));
      return rdvs;
    } catch (error) {
      console.error('Erreur lors de la récupération des rendez-vous médecin:', error);
      throw error;
    }
  }

  // Mettre à jour le statut d'un rendez-vous
  async mettreAJourStatut(rdvId, nouveauStatut, utilisateurId, notes = null) {
    try {
      // Vérifier que l'utilisateur a le droit de modifier ce rendez-vous
      const [rdv] = await db
        .select()
        .from(rendezVous)
        .where(eq(rendezVous.id, rdvId))
        .limit(1);

      if (!rdv) {
        throw new Error('Rendez-vous non trouvé');
      }

      // Seul le médecin ou le patient concerné peut modifier
      if (rdv.idMedecin !== utilisateurId && rdv.idPatient !== utilisateurId) {
        throw new Error('Non autorisé à modifier ce rendez-vous');
      }

      const updateData = {
        statut: nouveauStatut,
        dateModification: new Date()
      };

      // Seul le médecin peut ajouter des notes
      if (notes && rdv.idMedecin === utilisateurId) {
        updateData.notes = notes;
      }

      await db
        .update(rendezVous)
        .set(updateData)
        .where(eq(rendezVous.id, rdvId));

      // Notifier l'autre partie
      const destinataireId = rdv.idMedecin === utilisateurId ? rdv.idPatient : rdv.idMedecin;
      const [utilisateur] = await db
        .select()
        .from(users)
        .where(eq(users.id, utilisateurId))
        .limit(1);

      const message = `${utilisateur.firstName} ${utilisateur.lastName} a ${nouveauStatut.toLowerCase()} le rendez-vous du ${new Date(rdv.dateRendezVous).toLocaleDateString('fr-FR')}.`;

      await notificationService.creerNotificationSysteme(
        destinataireId,
        'Mise à jour de rendez-vous',
        message,
        'MEDICAL'
      );

      return { success: true };
    } catch (error) {
      console.error('Erreur lors de la mise à jour du rendez-vous:', error);
      throw error;
    }
  }

  // Annuler un rendez-vous
  async annulerRendezVous(rdvId, utilisateurId, raison = null) {
    try {
      return await this.mettreAJourStatut(rdvId, 'ANNULE', utilisateurId, raison);
    } catch (error) {
      console.error('Erreur lors de l\'annulation du rendez-vous:', error);
      throw error;
    }
  }
}

module.exports = new RendezVousService();