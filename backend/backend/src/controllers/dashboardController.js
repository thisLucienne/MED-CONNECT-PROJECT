const { db } = require('../config/database');
const { dossiersMedicaux, messages, users, parametresSante, accesDossiers } = require('../db/schema');
const { eq, and, count, desc, gte } = require('drizzle-orm');

class DashboardController {
  /**
   * Obtenir les statistiques du tableau de bord
   * GET /api/sante/tableau-de-bord
   */
  static async getDashboardStats(req, res) {
    try {
      const userId = req.user.id;
      const userRole = req.user.role;

      // Statistiques des dossiers médicaux
      const [dossiersCount] = await db
        .select({ count: count() })
        .from(dossiersMedicaux)
        .where(eq(dossiersMedicaux.idPatient, userId));

      // Dossiers récents (derniers 30 jours)
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      
      const [dossiersRecentsCount] = await db
        .select({ count: count() })
        .from(dossiersMedicaux)
        .where(and(
          eq(dossiersMedicaux.idPatient, userId),
          gte(dossiersMedicaux.dateCreation, thirtyDaysAgo)
        ));

      // Statistiques des messages
      const [messagesCount] = await db
        .select({ count: count() })
        .from(messages)
        .where(eq(messages.destinataire, userId));

      const [messagesNonLusCount] = await db
        .select({ count: count() })
        .from(messages)
        .where(and(
          eq(messages.destinataire, userId),
          eq(messages.confirmationLecture, false)
        ));

      // Statistiques des médecins connectés
      const [medecinsConnectesCount] = await db
        .select({ count: count() })
        .from(accesDossiers)
        .where(eq(accesDossiers.idPatient, userId));

      // Pour les résultats de laboratoire, on simule pour l'instant
      // car il n'y a pas encore de table spécifique
      const resultatsLabo = {
        total: 0,
        recents: 0
      };

      const stats = {
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

      res.json({
        success: true,
        data: stats
      });

    } catch (error) {
      console.error('Erreur lors de la récupération des statistiques:', error);
      res.status(500).json({
        success: false,
        message: 'Erreur lors de la récupération des statistiques'
      });
    }
  }

  /**
   * Obtenir les paramètres de santé de l'utilisateur
   * GET /api/sante/parametres
   */
  static async getUserHealthParameters(req, res) {
    try {
      const userId = req.user.id;

      // Récupérer les paramètres de santé
      const [parametres] = await db
        .select()
        .from(parametresSante)
        .where(eq(parametresSante.idPatient, userId))
        .limit(1);

      if (!parametres) {
        // Retourner des valeurs par défaut si aucun paramètre n'est trouvé
        return res.json({
          success: true,
          data: {
            allergies: ['Aucune allergie connue'],
            medicaments: ['Aucun médicament actuel'],
            conditions: ['Aucune condition particulière'],
            groupeSanguin: null,
            contactUrgence: null
          }
        });
      }

      const healthInfo = {
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

      res.json({
        success: true,
        data: healthInfo
      });

    } catch (error) {
      console.error('Erreur lors de la récupération des paramètres de santé:', error);
      res.status(500).json({
        success: false,
        message: 'Erreur lors de la récupération des paramètres de santé'
      });
    }
  }

  /**
   * Obtenir la liste des médecins connectés
   * GET /api/sante/medecins-connectes
   */
  static async getConnectedDoctors(req, res) {
    try {
      const userId = req.user.id;

      // Récupérer les médecins qui ont accès aux dossiers du patient
      const medecinsConnectes = await db
        .select({
          id: users.id,
          firstName: users.firstName,
          lastName: users.lastName,
          profilePicture: users.profilePicture,
          dateAutorisation: accesDossiers.dateAutorisation,
          typeAcces: accesDossiers.typeAcces
        })
        .from(accesDossiers)
        .innerJoin(users, eq(accesDossiers.idMedecin, users.id))
        .where(and(
          eq(accesDossiers.idPatient, userId),
          eq(accesDossiers.statut, 'ACTIF'),
          eq(users.role, 'DOCTOR')
        ))
        .orderBy(desc(accesDossiers.dateAutorisation));

      res.json({
        success: true,
        data: medecinsConnectes
      });

    } catch (error) {
      console.error('Erreur lors de la récupération des médecins connectés:', error);
      res.status(500).json({
        success: false,
        message: 'Erreur lors de la récupération des médecins connectés'
      });
    }
  }
}

module.exports = DashboardController;