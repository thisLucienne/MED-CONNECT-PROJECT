const { db } = require('../config/database');
const { users, doctors } = require('../db/schema');
const { eq, and, ilike, or } = require('drizzle-orm');

class MedecinController {
  /**
   * Rechercher des médecins
   * GET /api/medecins/recherche
   */
  static async rechercherMedecins(req, res) {
    try {
      const { q } = req.query;
      
      if (!q || q.length < 2) {
        return res.json({
          success: true,
          data: []
        });
      }

      const searchTerm = `%${q}%`;
      
      const medecins = await db
        .select({
          id: users.id,
          firstName: users.firstName,
          lastName: users.lastName,
          email: users.email,
          profilePicture: users.profilePicture,
          specialty: doctors.specialty,
          licenseNumber: doctors.licenseNumber
        })
        .from(users)
        .leftJoin(doctors, eq(users.id, doctors.userId))
        .where(and(
          eq(users.role, 'DOCTOR'),
          eq(users.status, 'ACTIVE'),
          or(
            ilike(users.firstName, searchTerm),
            ilike(users.lastName, searchTerm),
            ilike(doctors.specialty, searchTerm)
          )
        ))
        .limit(20);

      res.json({
        success: true,
        data: medecins
      });

    } catch (error) {
      console.error('Erreur recherche médecins:', error);
      res.status(500).json({
        success: false,
        message: 'Erreur lors de la recherche de médecins'
      });
    }
  }

  /**
   * Obtenir les détails d'un médecin
   * GET /api/medecins/:medecinId
   */
  static async obtenirMedecin(req, res) {
    try {
      const { medecinId } = req.params;

      const [medecin] = await db
        .select({
          id: users.id,
          firstName: users.firstName,
          lastName: users.lastName,
          email: users.email,
          profilePicture: users.profilePicture,
          specialty: doctors.specialty,
          licenseNumber: doctors.licenseNumber,
          createdAt: users.createdAt
        })
        .from(users)
        .leftJoin(doctors, eq(users.id, doctors.userId))
        .where(and(
          eq(users.id, medecinId),
          eq(users.role, 'DOCTOR'),
          eq(users.status, 'ACTIVE')
        ))
        .limit(1);

      if (!medecin) {
        return res.status(404).json({
          success: false,
          message: 'Médecin non trouvé'
        });
      }

      res.json({
        success: true,
        data: medecin
      });

    } catch (error) {
      console.error('Erreur récupération médecin:', error);
      res.status(500).json({
        success: false,
        message: 'Erreur lors de la récupération du médecin'
      });
    }
  }

  /**
   * Obtenir tous les médecins actifs
   * GET /api/medecins
   */
  static async obtenirTousMedecins(req, res) {
    try {
      const { page = 1, limite = 20, specialty } = req.query;
      const offset = (page - 1) * limite;

      let whereConditions = and(
        eq(users.role, 'DOCTOR'),
        eq(users.status, 'ACTIVE')
      );

      // Ajouter le filtre par spécialité si fourni
      if (specialty && specialty !== 'all') {
        whereConditions = and(
          whereConditions,
          eq(doctors.specialty, specialty)
        );
      }

      const medecins = await db
        .select({
          id: users.id,
          firstName: users.firstName,
          lastName: users.lastName,
          email: users.email,
          profilePicture: users.profilePicture,
          specialty: doctors.specialty,
          licenseNumber: doctors.licenseNumber
        })
        .from(users)
        .leftJoin(doctors, eq(users.id, doctors.userId))
        .where(whereConditions)
        .limit(parseInt(limite))
        .offset(offset);

      res.json({
        success: true,
        data: medecins
      });

    } catch (error) {
      console.error('Erreur récupération médecins:', error);
      res.status(500).json({
        success: false,
        message: 'Erreur lors de la récupération des médecins'
      });
    }
  }

  /**
   * Obtenir toutes les spécialités disponibles
   * GET /api/medecins/specialites
   */
  static async obtenirSpecialites(req, res) {
    try {
      // Approche simplifiée : récupérer tous les médecins et extraire les spécialités
      const medecins = await db
        .select({
          specialty: doctors.specialty
        })
        .from(doctors)
        .innerJoin(users, eq(doctors.userId, users.id))
        .where(and(
          eq(users.role, 'DOCTOR'),
          eq(users.status, 'ACTIVE')
        ));

      // Extraire les spécialités uniques côté JavaScript
      const specialitesSet = new Set();
      medecins.forEach(medecin => {
        if (medecin.specialty) {
          specialitesSet.add(medecin.specialty);
        }
      });

      const specialitesList = Array.from(specialitesSet).sort();

      res.json({
        success: true,
        data: specialitesList
      });

    } catch (error) {
      console.error('Erreur récupération spécialités:', error);
      res.status(500).json({
        success: false,
        message: 'Erreur lors de la récupération des spécialités'
      });
    }
  }
}

module.exports = MedecinController;