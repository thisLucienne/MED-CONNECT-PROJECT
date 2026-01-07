const { db } = require('../config/database');
const { parametresSante, users } = require('../db/schema');
const { eq } = require('drizzle-orm');

class SanteService {
  // Obtenir ou créer les paramètres de santé d'un patient
  async obtenirParametresSante(patientId) {
    try {
      let [parametres] = await db
        .select()
        .from(parametresSante)
        .where(eq(parametresSante.idPatient, patientId))
        .limit(1);

      // Si aucun paramètre n'existe, retourner des valeurs par défaut
      if (!parametres) {
        return {
          allergies: ['Aucune allergie connue'],
          medicaments: ['Aucun médicament actuel'],
          conditions: ['Aucune condition particulière'],
          groupeSanguin: null,
          contactUrgence: null
        };
      }

      // Formater les données pour le frontend
      return {
        allergies: parametres.allergiesConnues ? 
          parametres.allergiesConnues.split(',').map(a => a.trim()) : 
          ['Aucune allergie connue'],
        medicaments: parametres.medicamentsActuels ? 
          parametres.medicamentsActuels.split(',').map(m => m.trim()) : 
          ['Aucun médicament actuel'],
        conditions: parametres.conditionsMedicales ? 
          parametres.conditionsMedicales.split(',').map(c => c.trim()) : 
          ['Aucune condition particulière'],
        groupeSanguin: parametres.groupeSanguin,
        contactUrgence: parametres.contactUrgence && parametres.telephoneUrgence ? {
          nom: parametres.contactUrgence,
          telephone: parametres.telephoneUrgence
        } : null
      };
    } catch (error) {
      console.error('Erreur lors de la récupération des paramètres:', error);
      throw error;
    }
  }

  // Mettre à jour les paramètres de santé
  async mettreAJourParametres(patientId, donnees) {
    try {
      const {
        groupeSanguin,
        poids,
        taille,
        allergiesConnues,
        medicamentsActuels,
        conditionsMedicales,
        contactUrgence,
        telephoneUrgence
      } = donnees;

      // Vérifier si les paramètres existent
      const [parametresExistants] = await db
        .select()
        .from(parametresSante)
        .where(eq(parametresSante.idPatient, patientId))
        .limit(1);

      let parametres;

      if (parametresExistants) {
        // Mettre à jour
        [parametres] = await db
          .update(parametresSante)
          .set({
            groupeSanguin,
            poids,
            taille,
            allergiesConnues,
            medicamentsActuels,
            conditionsMedicales,
            contactUrgence,
            telephoneUrgence,
            dateModification: new Date()
          })
          .where(eq(parametresSante.idPatient, patientId))
          .returning();
      } else {
        // Créer
        [parametres] = await db.insert(parametresSante).values({
          idPatient: patientId,
          groupeSanguin,
          poids,
          taille,
          allergiesConnues,
          medicamentsActuels,
          conditionsMedicales,
          contactUrgence,
          telephoneUrgence
        }).returning();
      }

      return parametres;
    } catch (error) {
      console.error('Erreur lors de la mise à jour des paramètres:', error);
      throw error;
    }
  }

  // Obtenir le tableau de bord de santé complet
  async obtenirTableauDeBord(patientId) {
    try {
      const { dossiersMedicaux, messages, accesDossiers } = require('../db/schema');
      const { count, gte, and } = require('drizzle-orm');

      // Statistiques des dossiers médicaux
      const [dossiersCount] = await db
        .select({ count: count() })
        .from(dossiersMedicaux)
        .where(eq(dossiersMedicaux.idPatient, patientId));

      // Dossiers récents (derniers 30 jours)
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      
      const [dossiersRecentsCount] = await db
        .select({ count: count() })
        .from(dossiersMedicaux)
        .where(and(
          eq(dossiersMedicaux.idPatient, patientId),
          gte(dossiersMedicaux.dateCreation, thirtyDaysAgo)
        ));

      // Statistiques des messages
      const [messagesCount] = await db
        .select({ count: count() })
        .from(messages)
        .where(eq(messages.destinataire, patientId));

      const [messagesNonLusCount] = await db
        .select({ count: count() })
        .from(messages)
        .where(and(
          eq(messages.destinataire, patientId),
          eq(messages.confirmationLecture, false)
        ));

      // Statistiques des médecins connectés
      const [medecinsConnectesCount] = await db
        .select({ count: count() })
        .from(accesDossiers)
        .where(eq(accesDossiers.idPatient, patientId));

      // Pour les résultats de laboratoire, on simule pour l'instant
      // car il n'y a pas encore de table spécifique
      const resultatsLabo = {
        total: 0,
        recents: 0
      };

      return {
        dossiers: {
          total: dossiersCount.count || 0,
          nouveaux: dossiersRecentsCount.count || 0
        },
        messages: {
          total: messagesCount.count || 0,
          nonLus: messagesNonLusCount.count || 0
        },
        medecins: {
          total: medecinsConnectesCount.count || 0,
          connectes: medecinsConnectesCount.count || 0
        },
        resultatsLabo
      };
    } catch (error) {
      console.error('Erreur lors de la récupération du tableau de bord:', error);
      throw error;
    }
  }

  // Obtenir les médecins connectés (qui ont accès aux dossiers)
  async obtenirMedecinsConnectes(patientId) {
    try {
      const { accesDossiers, doctors, dossiersMedicaux } = require('../db/schema');
      const { and } = require('drizzle-orm');
      
      // Récupérer les médecins qui ont accès aux dossiers du patient
      const medecinsConnectes = await db
        .select({
          id: users.id,
          firstName: users.firstName,
          lastName: users.lastName,
          email: users.email,
          profilePicture: users.profilePicture,
          specialty: doctors.specialty,
          licenseNumber: doctors.licenseNumber,
          dateAutorisation: accesDossiers.dateAutorisation,
          typeAcces: accesDossiers.typeAcces
        })
        .from(accesDossiers)
        .innerJoin(dossiersMedicaux, eq(accesDossiers.idDossier, dossiersMedicaux.id))
        .innerJoin(users, eq(accesDossiers.idMedecin, users.id))
        .leftJoin(doctors, eq(users.id, doctors.userId))
        .where(and(
          eq(dossiersMedicaux.idPatient, patientId),
          eq(accesDossiers.statut, 'ACTIF'),
          eq(users.role, 'DOCTOR')
        ))
        .groupBy(
          users.id,
          users.firstName,
          users.lastName,
          users.email,
          users.profilePicture,
          doctors.specialty,
          doctors.licenseNumber,
          accesDossiers.dateAutorisation,
          accesDossiers.typeAcces
        );

      return medecinsConnectes;
    } catch (error) {
      console.error('Erreur lors de la récupération des médecins connectés:', error);
      // Retourner un tableau vide en cas d'erreur pour éviter les crashes
      return [];
    }
  }
}

module.exports = new SanteService();