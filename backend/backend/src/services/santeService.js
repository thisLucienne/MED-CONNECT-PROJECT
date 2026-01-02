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

      // Si aucun paramètre n'existe, créer un enregistrement vide
      if (!parametres) {
        [parametres] = await db.insert(parametresSante).values({
          idPatient: patientId
        }).returning();
      }

      return parametres;
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
      // Récupérer les paramètres de santé
      const parametres = await this.obtenirParametresSante(patientId);

      // Récupérer les informations du patient
      const [patient] = await db
        .select({
          id: users.id,
          firstName: users.firstName,
          lastName: users.lastName,
          email: users.email,
          phone: users.phone,
          profilePicture: users.profilePicture
        })
        .from(users)
        .where(eq(users.id, patientId))
        .limit(1);

      // Récupérer les statistiques des dossiers
      const { dossiersMedicaux, documentsMedicaux, allergies } = require('../db/schema');
      
      const [statsDossiers] = await db
        .select({ count: dossiersMedicaux.id })
        .from(dossiersMedicaux)
        .where(eq(dossiersMedicaux.idPatient, patientId));

      const [statsDocuments] = await db
        .select({ count: documentsMedicaux.id })
        .from(documentsMedicaux)
        .innerJoin(dossiersMedicaux, eq(documentsMedicaux.idDossier, dossiersMedicaux.id))
        .where(eq(dossiersMedicaux.idPatient, patientId));

      const [statsAllergies] = await db
        .select({ count: allergies.id })
        .from(allergies)
        .innerJoin(dossiersMedicaux, eq(allergies.idDossier, dossiersMedicaux.id))
        .where(eq(dossiersMedicaux.idPatient, patientId));

      return {
        patient,
        parametresSante: parametres,
        statistiques: {
          nombreDossiers: statsDossiers?.count || 0,
          nombreDocuments: statsDocuments?.count || 0,
          nombreAllergies: statsAllergies?.count || 0
        }
      };
    } catch (error) {
      console.error('Erreur lors de la récupération du tableau de bord:', error);
      throw error;
    }
  }

  // Obtenir les médecins connectés (qui ont accès aux dossiers)
  async obtenirMedecinsConnectes(patientId) {
    try {
      const { accesDossiers, doctors } = require('../db/schema');
      
      const medecinsConnectes = await db
        .select({
          id: users.id,
          firstName: users.firstName,
          lastName: users.lastName,
          profilePicture: users.profilePicture,
          specialty: doctors.specialty,
          licenseNumber: doctors.licenseNumber,
          dateAutorisation: accesDossiers.dateAutorisation,
          typeAcces: accesDossiers.typeAcces
        })
        .from(accesDossiers)
        .innerJoin(users, eq(accesDossiers.idMedecin, users.id))
        .innerJoin(doctors, eq(users.id, doctors.userId))
        .innerJoin(dossiersMedicaux, eq(accesDossiers.idDossier, dossiersMedicaux.id))
        .where(and(
          eq(dossiersMedicaux.idPatient, patientId),
          eq(accesDossiers.statut, 'ACTIF')
        ))
        .groupBy(users.id, doctors.specialty, doctors.licenseNumber, accesDossiers.dateAutorisation, accesDossiers.typeAcces);

      return medecinsConnectes;
    } catch (error) {
      console.error('Erreur lors de la récupération des médecins connectés:', error);
      throw error;
    }
  }
}

module.exports = new SanteService();