const { db } = require('../config/database');
const { users, doctors, medicalRecords, conversations, messages } = require('../db/schema');
const { eq, and, or, desc, asc, sql, count } = require('drizzle-orm');

class PatientService {
  /**
   * Obtenir le profil complet d'un patient
   * @param {string} patientId - ID du patient
   * @returns {Promise<Object>} Profil du patient
   */
  static async getPatientProfile(patientId) {
    try {
      const patient = await db.select({
        id: users.id,
        email: users.email,
        firstName: users.firstName,
        lastName: users.lastName,
        phone: users.phone,
        profilePicture: users.profilePicture,
        role: users.role,
        status: users.status,
        isActive2FA: users.isActive2FA,
        lastConnection: users.lastConnection,
        createdAt: users.createdAt,
        updatedAt: users.updatedAt
      })
      .from(users)
      .where(and(eq(users.id, patientId), eq(users.role, 'PATIENT')))
      .limit(1);

      if (patient.length === 0) {
        return {
          success: false,
          error: 'Patient introuvable'
        };
      }

      return {
        success: true,
        data: patient[0]
      };

    } catch (error) {
      console.error('Erreur récupération profil patient:', error);
      return {
        success: false,
        error: 'Erreur lors de la récupération du profil'
      };
    }
  }

  /**
   * Mettre à jour le profil d'un patient
   * @param {string} patientId - ID du patient
   * @param {Object} updateData - Données à mettre à jour
   * @returns {Promise<Object>} Profil mis à jour
   */
  static async updatePatientProfile(patientId, updateData) {
    try {
      // Vérifier que le patient existe
      const existingPatient = await db.select()
        .from(users)
        .where(and(eq(users.id, patientId), eq(users.role, 'PATIENT')))
        .limit(1);

      if (existingPatient.length === 0) {
        return {
          success: false,
          error: 'Patient introuvable'
        };
      }

      // Filtrer les champs autorisés à la mise à jour
      const allowedFields = ['firstName', 'lastName', 'phone', 'profilePicture'];
      const filteredData = {};
      
      for (const field of allowedFields) {
        if (updateData[field] !== undefined) {
          filteredData[field] = updateData[field];
        }
      }

      if (Object.keys(filteredData).length === 0) {
        return {
          success: false,
          error: 'Aucune donnée valide à mettre à jour'
        };
      }

      // Ajouter la date de mise à jour
      filteredData.updatedAt = new Date();

      // Effectuer la mise à jour
      const updatedPatient = await db.update(users)
        .set(filteredData)
        .where(eq(users.id, patientId))
        .returning();

      return {
        success: true,
        message: 'Profil mis à jour avec succès',
        data: updatedPatient[0]
      };

    } catch (error) {
      console.error('Erreur mise à jour profil patient:', error);
      return {
        success: false,
        error: 'Erreur lors de la mise à jour du profil'
      };
    }
  }

  /**
   * Obtenir les statistiques du dashboard patient
   * @param {string} patientId - ID du patient
   * @returns {Promise<Object>} Statistiques du dashboard
   */
  static async getPatientDashboard(patientId) {
    try {
      // Vérifier que le patient existe
      const patient = await db.select()
        .from(users)
        .where(and(eq(users.id, patientId), eq(users.role, 'PATIENT')))
        .limit(1);

      if (patient.length === 0) {
        return {
          success: false,
          error: 'Patient introuvable'
        };
      }

      // Pour l'instant, retourner des statistiques de base
      // TODO: Implémenter les vraies statistiques quand les tables seront créées
      const dashboardData = {
        totalRecords: 0,
        unreadMessages: 0,
        totalDoctors: 0,
        pendingAppointments: 0,
        recentActivity: [],
        quickStats: {
          lastConnection: patient[0].lastConnection,
          accountCreated: patient[0].createdAt,
          profileComplete: this.calculateProfileCompleteness(patient[0])
        }
      };

      // Compter les médecins approuvés disponibles
      try {
        const doctorCount = await db.select({ count: sql`count(*)` })
          .from(users)
          .innerJoin(doctors, eq(users.id, doctors.userId))
          .where(and(eq(users.role, 'DOCTOR'), eq(users.status, 'APPROVED')));
        
        dashboardData.totalDoctors = parseInt(doctorCount[0].count);
      } catch (error) {
        console.warn('Erreur comptage médecins:', error);
      }

      return {
        success: true,
        data: dashboardData
      };

    } catch (error) {
      console.error('Erreur récupération dashboard patient:', error);
      return {
        success: false,
        error: 'Erreur lors de la récupération du dashboard'
      };
    }
  }

  /**
   * Calculer le pourcentage de complétude du profil
   * @param {Object} patient - Données du patient
   * @returns {number} Pourcentage de complétude
   */
  static calculateProfileCompleteness(patient) {
    const requiredFields = ['firstName', 'lastName', 'email', 'phone'];
    const optionalFields = ['profilePicture'];
    
    let completedRequired = 0;
    let completedOptional = 0;

    // Vérifier les champs requis
    for (const field of requiredFields) {
      if (patient[field] && patient[field].trim() !== '') {
        completedRequired++;
      }
    }

    // Vérifier les champs optionnels
    for (const field of optionalFields) {
      if (patient[field] && patient[field].trim() !== '') {
        completedOptional++;
      }
    }

    // Calcul: 80% pour les champs requis, 20% pour les optionnels
    const requiredPercentage = (completedRequired / requiredFields.length) * 80;
    const optionalPercentage = (completedOptional / optionalFields.length) * 20;

    return Math.round(requiredPercentage + optionalPercentage);
  }

  /**
   * Obtenir la liste des médecins disponibles pour un patient
   * @param {string} patientId - ID du patient
   * @param {Object} filters - Filtres de recherche
   * @param {Object} pagination - Paramètres de pagination
   * @returns {Promise<Object>} Liste des médecins
   */
  static async getAvailableDoctors(patientId, filters = {}, pagination = {}) {
    try {
      const { page = 1, limit = 10, sortBy = 'firstName', sortOrder = 'asc' } = pagination;
      const { search, specialty } = filters;
      const offset = (page - 1) * limit;

      // Construire la requête
      let query = db.select({
        id: doctors.id,
        userId: users.id,
        firstName: users.firstName,
        lastName: users.lastName,
        email: users.email,
        phone: users.phone,
        profilePicture: users.profilePicture,
        specialty: doctors.specialty,
        licenseNumber: doctors.licenseNumber,
        createdAt: users.createdAt
      })
      .from(users)
      .innerJoin(doctors, eq(users.id, doctors.userId))
      .where(and(
        eq(users.role, 'DOCTOR'),
        eq(users.status, 'APPROVED')
      ));

      // Appliquer les filtres
      const conditions = [
        eq(users.role, 'DOCTOR'),
        eq(users.status, 'APPROVED')
      ];

      if (specialty) {
        conditions.push(eq(doctors.specialty, specialty));
      }

      if (search) {
        conditions.push(
          or(
            sql`${users.firstName} ILIKE ${`%${search}%`}`,
            sql`${users.lastName} ILIKE ${`%${search}%`}`,
            sql`${doctors.specialty} ILIKE ${`%${search}%`}`
          )
        );
      }

      query = query.where(and(...conditions));

      // Appliquer la pagination et le tri
      query = query
        .limit(limit)
        .offset(offset)
        .orderBy(sortOrder === 'desc' ? desc(users[sortBy]) : asc(users[sortBy]));

      const availableDoctors = await query;

      // Compter le total
      let countQuery = db.select({ count: sql`count(*)` })
        .from(users)
        .innerJoin(doctors, eq(users.id, doctors.userId))
        .where(and(...conditions));

      const totalResult = await countQuery;
      const total = parseInt(totalResult[0].count);

      return {
        success: true,
        data: {
          doctors: availableDoctors,
          pagination: {
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit),
            hasNext: page < Math.ceil(total / limit),
            hasPrev: page > 1
          }
        }
      };

    } catch (error) {
      console.error('Erreur récupération médecins disponibles:', error);
      return {
        success: false,
        error: 'Erreur lors de la récupération des médecins'
      };
    }
  }

  /**
   * Rechercher des médecins par spécialité ou nom
   * @param {string} patientId - ID du patient
   * @param {string} query - Terme de recherche
   * @param {Object} pagination - Paramètres de pagination
   * @returns {Promise<Object>} Résultats de recherche
   */
  static async searchDoctors(patientId, searchQuery, pagination = {}) {
    try {
      const { page = 1, limit = 10 } = pagination;
      const offset = (page - 1) * limit;

      if (!searchQuery || searchQuery.trim().length < 2) {
        return {
          success: false,
          error: 'Le terme de recherche doit contenir au moins 2 caractères'
        };
      }

      const searchTerm = searchQuery.trim();

      // Recherche dans les noms et spécialités
      const searchResults = await db.select({
        id: doctors.id,
        userId: users.id,
        firstName: users.firstName,
        lastName: users.lastName,
        email: users.email,
        phone: users.phone,
        profilePicture: users.profilePicture,
        specialty: doctors.specialty,
        licenseNumber: doctors.licenseNumber,
        createdAt: users.createdAt
      })
      .from(users)
      .innerJoin(doctors, eq(users.id, doctors.userId))
      .where(and(
        eq(users.role, 'DOCTOR'),
        eq(users.status, 'APPROVED'),
        or(
          sql`${users.firstName} ILIKE ${`%${searchTerm}%`}`,
          sql`${users.lastName} ILIKE ${`%${searchTerm}%`}`,
          sql`${doctors.specialty} ILIKE ${`%${searchTerm}%`}`
        )
      ))
      .limit(limit)
      .offset(offset)
      .orderBy(asc(users.firstName));

      // Compter le total
      const totalResult = await db.select({ count: sql`count(*)` })
        .from(users)
        .innerJoin(doctors, eq(users.id, doctors.userId))
        .where(and(
          eq(users.role, 'DOCTOR'),
          eq(users.status, 'APPROVED'),
          or(
            sql`${users.firstName} ILIKE ${`%${searchTerm}%`}`,
            sql`${users.lastName} ILIKE ${`%${searchTerm}%`}`,
            sql`${doctors.specialty} ILIKE ${`%${searchTerm}%`}`
          )
        ));

      const total = parseInt(totalResult[0].count);

      return {
        success: true,
        data: {
          doctors: searchResults,
          searchQuery: searchTerm,
          pagination: {
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit),
            hasNext: page < Math.ceil(total / limit),
            hasPrev: page > 1
          }
        }
      };

    } catch (error) {
      console.error('Erreur recherche médecins:', error);
      return {
        success: false,
        error: 'Erreur lors de la recherche de médecins'
      };
    }
  }

  /**
   * Obtenir les spécialités médicales disponibles
   * @returns {Promise<Object>} Liste des spécialités
   */
  static async getAvailableSpecialties() {
    try {
      const specialties = await db.select({
        specialty: doctors.specialty,
        count: sql`count(*)`
      })
      .from(doctors)
      .innerJoin(users, eq(doctors.userId, users.id))
      .where(and(
        eq(users.role, 'DOCTOR'),
        eq(users.status, 'APPROVED')
      ))
      .groupBy(doctors.specialty)
      .orderBy(asc(doctors.specialty));

      return {
        success: true,
        data: {
          specialties: specialties.map(s => ({
            name: s.specialty,
            doctorCount: parseInt(s.count)
          }))
        }
      };

    } catch (error) {
      console.error('Erreur récupération spécialités:', error);
      return {
        success: false,
        error: 'Erreur lors de la récupération des spécialités'
      };
    }
  }
}

module.exports = PatientService;