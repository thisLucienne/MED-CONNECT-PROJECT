const { db } = require('../config/database');
const { users, doctors } = require('../db/schema');
const { eq, and, or, ilike, desc, asc, sql } = require('drizzle-orm');
const CryptoUtils = require('../utils/crypto');
const EmailService = require('./emailService');

class AdminService {
  /**
   * Créer l'administrateur par défaut au démarrage
   * @returns {Promise<Object>} Résultat de la création
   */
  static async createDefaultAdmin() {
    try {
      const adminEmail = process.env.DEFAULT_ADMIN_EMAIL || 'admin@medconnect.com';
      const adminPassword = process.env.DEFAULT_ADMIN_PASSWORD || 'Admin123!@#';

      // Vérifier si un admin existe déjà
      const existingAdmin = await db.select()
        .from(users)
        .where(or(
          eq(users.role, 'ADMIN'),
          eq(users.email, adminEmail)
        ))
        .limit(1);

      if (existingAdmin.length > 0) {
        console.log('✅ Administrateur par défaut déjà existant');
        return {
          success: true,
          message: 'Admin déjà existant'
        };
      }

      // Hacher le mot de passe
      const hashedPassword = await CryptoUtils.hashPassword(adminPassword);

      // Créer l'administrateur
      const newAdmin = await db.insert(users).values({
        email: adminEmail,
        password: hashedPassword,
        firstName: 'Admin',
        lastName: 'System',
        role: 'ADMIN',
        status: 'ACTIVE',
        isActive2FA: false // Pas de 2FA pour l'admin
      }).returning();

      console.log('✅ Administrateur par défaut créé avec succès');
      console.log(`📧 Email: ${adminEmail}`);
      console.log(`🔑 Mot de passe: ${adminPassword}`);
      console.log('⚠️  Changez le mot de passe par défaut après la première connexion !');

      return {
        success: true,
        data: {
          admin: {
            id: newAdmin[0].id,
            email: newAdmin[0].email,
            firstName: newAdmin[0].firstName,
            lastName: newAdmin[0].lastName
          }
        }
      };

    } catch (error) {
      console.error('❌ Erreur création admin par défaut:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Obtenir la liste des médecins en attente de validation
   * @param {Object} filters - Filtres de recherche
   * @param {Object} pagination - Paramètres de pagination
   * @returns {Promise<Object>} Liste des médecins
   */
  static async getPendingDoctors(filters = {}, pagination = {}) {
    try {
      const { page = 1, limit = 10, sortBy = 'createdAt', sortOrder = 'desc' } = pagination;
      const offset = (page - 1) * limit;

      // Construire la requête avec jointure
      let query = db.select({
        id: users.id,
        email: users.email,
        firstName: users.firstName,
        lastName: users.lastName,
        phone: users.phone,
        profilePicture: users.profilePicture,
        status: users.status,
        createdAt: users.createdAt,
        specialty: doctors.specialty,
        licenseNumber: doctors.licenseNumber,
        doctorId: doctors.id
      })
      .from(users)
      .innerJoin(doctors, eq(users.id, doctors.userId))
      .where(eq(users.status, 'PENDING'))
      .limit(limit)
      .offset(offset);

      const pendingDoctors = await query;

      // Compter le total
      const totalResult = await db.select({ count: users.id })
        .from(users)
        .innerJoin(doctors, eq(users.id, doctors.userId))
        .where(eq(users.status, 'PENDING'));

      const total = totalResult.length;

      return {
        success: true,
        data: {
          doctors: pendingDoctors,
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
      console.error('Erreur récupération médecins en attente:', error);
      return {
        success: false,
        error: 'Erreur lors de la récupération des médecins'
      };
    }
  }

  /**
   * Valider ou rejeter la candidature d'un médecin
   * @param {string} doctorId - ID du médecin
   * @param {string} action - 'approve' ou 'reject'
   * @param {string} adminId - ID de l'admin qui effectue l'action
   * @param {string} rejectionReason - Raison du rejet (si action = 'reject')
   * @returns {Promise<Object>} Résultat de l'action
   */
  static async validateDoctorApplication(doctorId, action, adminId, rejectionReason = null) {
    try {
      // Récupérer les informations du médecin
      const doctorInfo = await db.select({
        userId: doctors.userId,
        specialty: doctors.specialty,
        licenseNumber: doctors.licenseNumber,
        email: users.email,
        firstName: users.firstName,
        lastName: users.lastName,
        phone: users.phone,
        status: users.status
      })
      .from(doctors)
      .innerJoin(users, eq(doctors.userId, users.id))
      .where(eq(doctors.id, doctorId))
      .limit(1);

      if (doctorInfo.length === 0) {
        return {
          success: false,
          error: 'Médecin introuvable'
        };
      }

      const doctor = doctorInfo[0];

      if (doctor.status !== 'PENDING') {
        return {
          success: false,
          error: 'Cette candidature a déjà été traitée'
        };
      }

      // Récupérer les infos de l'admin
      const admin = await db.select().from(users).where(eq(users.id, adminId)).limit(1);
      
      if (admin.length === 0) {
        return {
          success: false,
          error: 'Administrateur introuvable'
        };
      }

      if (action === 'approve') {
        // Approuver le médecin
        await db.update(users)
          .set({ status: 'APPROVED' })
          .where(eq(users.id, doctor.userId));

        await db.update(doctors)
          .set({ 
            approvedBy: adminId,
            approvedAt: new Date()
          })
          .where(eq(doctors.id, doctorId));

        // Envoyer l'email d'approbation
        await EmailService.sendDoctorApprovalNotification(doctor, admin[0]);

        return {
          success: true,
          message: 'Médecin approuvé avec succès',
          data: {
            doctor: {
              id: doctor.userId,
              email: doctor.email,
              firstName: doctor.firstName,
              lastName: doctor.lastName,
              specialty: doctor.specialty,
              licenseNumber: doctor.licenseNumber,
              status: 'APPROVED'
            }
          }
        };

      } else if (action === 'reject') {
        if (!rejectionReason || rejectionReason.trim().length < 10) {
          return {
            success: false,
            error: 'Une raison de rejet détaillée est requise (minimum 10 caractères)'
          };
        }

        // Rejeter le médecin
        await db.update(users)
          .set({ status: 'REJECTED' })
          .where(eq(users.id, doctor.userId));

        await db.update(doctors)
          .set({ 
            rejectionReason: rejectionReason.trim()
          })
          .where(eq(doctors.id, doctorId));

        // Envoyer l'email de rejet
        await EmailService.sendDoctorRejectionNotification(doctor, rejectionReason);

        return {
          success: true,
          message: 'Candidature rejetée',
          data: {
            doctor: {
              id: doctor.userId,
              email: doctor.email,
              firstName: doctor.firstName,
              lastName: doctor.lastName,
              specialty: doctor.specialty,
              licenseNumber: doctor.licenseNumber,
              status: 'REJECTED',
              rejectionReason: rejectionReason
            }
          }
        };

      } else {
        return {
          success: false,
          error: 'Action invalide. Utilisez "approve" ou "reject"'
        };
      }

    } catch (error) {
      console.error('Erreur validation candidature médecin:', error);
      return {
        success: false,
        error: 'Erreur lors de la validation de la candidature'
      };
    }
  }

  /**
   * Obtenir la liste de tous les utilisateurs
   * @param {Object} filters - Filtres de recherche
   * @param {Object} pagination - Paramètres de pagination
   * @returns {Promise<Object>} Liste des utilisateurs
   */
  static async getAllUsers(filters = {}, pagination = {}) {
    try {
      const { page = 1, limit = 10, sortBy = 'createdAt', sortOrder = 'desc' } = pagination;
      const { role, status, search } = filters;
      const offset = (page - 1) * limit;

      // Construire les conditions WHERE
      let whereConditions = [];
      
      if (role) {
        whereConditions.push(eq(users.role, role));
      }
      
      if (status) {
        whereConditions.push(eq(users.status, status));
      }

      // Pour la recherche, on utiliserait normalement une requête LIKE
      // Mais avec Drizzle, on va faire simple pour l'instant
      
      let query = db.select({
        id: users.id,
        email: users.email,
        firstName: users.firstName,
        lastName: users.lastName,
        phone: users.phone,
        profilePicture: users.profilePicture,
        role: users.role,
        status: users.status,
        lastConnection: users.lastConnection,
        createdAt: users.createdAt
      })
      .from(users)
      .limit(limit)
      .offset(offset);

      if (whereConditions.length > 0) {
        query = query.where(and(...whereConditions));
      }

      const allUsers = await query;

      // Compter le total (simplifié)
      let countQuery = db.select({ count: users.id }).from(users);
      
      if (whereConditions.length > 0) {
        countQuery = countQuery.where(and(...whereConditions));
      }

      const totalResult = await countQuery;
      const total = totalResult.length;

      return {
        success: true,
        data: {
          users: allUsers,
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
      console.error('Erreur récupération utilisateurs:', error);
      return {
        success: false,
        error: 'Erreur lors de la récupération des utilisateurs'
      };
    }
  }

  /**
   * Obtenir les statistiques du système
   * @returns {Promise<Object>} Statistiques
   */
  static async getSystemStats() {
    try {
      // Compter les utilisateurs par rôle et statut
      const userStats = await db.select({
        role: users.role,
        status: users.status,
        count: users.id
      }).from(users);

      // Organiser les statistiques
      const stats = {
        totalUsers: userStats.length,
        patients: {
          total: userStats.filter(u => u.role === 'PATIENT').length,
          active: userStats.filter(u => u.role === 'PATIENT' && u.status === 'ACTIVE').length
        },
        doctors: {
          total: userStats.filter(u => u.role === 'DOCTOR').length,
          pending: userStats.filter(u => u.role === 'DOCTOR' && u.status === 'PENDING').length,
          approved: userStats.filter(u => u.role === 'DOCTOR' && u.status === 'APPROVED').length,
          rejected: userStats.filter(u => u.role === 'DOCTOR' && u.status === 'REJECTED').length
        },
        admins: {
          total: userStats.filter(u => u.role === 'ADMIN').length
        }
      };

      return {
        success: true,
        data: stats
      };

    } catch (error) {
      console.error('Erreur récupération statistiques:', error);
      return {
        success: false,
        error: 'Erreur lors de la récupération des statistiques'
      };
    }
  }

  /**
   * Obtenir les détails complets d'un utilisateur
   * @param {string} userId - ID de l'utilisateur
   * @returns {Promise<Object>} Détails de l'utilisateur
   */
  static async getUserDetails(userId) {
    try {
      // Récupérer les informations de base de l'utilisateur
      const userInfo = await db.select({
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
      .where(eq(users.id, userId))
      .limit(1);

      if (userInfo.length === 0) {
        return {
          success: false,
          error: 'Utilisateur introuvable'
        };
      }

      const user = userInfo[0];
      const userDetails = {
        ...user,
        doctorInfo: null
      };

      // Si c'est un médecin, récupérer les informations supplémentaires
      if (user.role === 'DOCTOR') {
        const doctorInfo = await db.select({
          id: doctors.id,
          specialty: doctors.specialty,
          licenseNumber: doctors.licenseNumber,
          approvedBy: doctors.approvedBy,
          approvedAt: doctors.approvedAt,
          rejectionReason: doctors.rejectionReason,
          createdAt: doctors.createdAt,
          updatedAt: doctors.updatedAt
        })
        .from(doctors)
        .where(eq(doctors.userId, userId))
        .limit(1);

        if (doctorInfo.length > 0) {
          userDetails.doctorInfo = doctorInfo[0];

          // Si le médecin a été approuvé, récupérer les infos de l'admin qui l'a approuvé
          if (doctorInfo[0].approvedBy) {
            const approverInfo = await db.select({
              id: users.id,
              email: users.email,
              firstName: users.firstName,
              lastName: users.lastName
            })
            .from(users)
            .where(eq(users.id, doctorInfo[0].approvedBy))
            .limit(1);

            if (approverInfo.length > 0) {
              userDetails.doctorInfo.approvedByInfo = approverInfo[0];
            }
          }
        }
      }

      return {
        success: true,
        data: userDetails
      };

    } catch (error) {
      console.error('Erreur récupération détails utilisateur:', error);
      return {
        success: false,
        error: 'Erreur lors de la récupération des détails de l\'utilisateur'
      };
    }
  }

  /**
   * Changer le statut d'un utilisateur (activer/désactiver)
   * @param {string} userId - ID de l'utilisateur
   * @param {string} newStatus - Nouveau statut
   * @param {string} adminId - ID de l'admin
   * @returns {Promise<Object>} Résultat de l'action
   */
  static async changeUserStatus(userId, newStatus, adminId) {
    try {
      // Vérifier que l'utilisateur existe
      const user = await db.select().from(users).where(eq(users.id, userId)).limit(1);
      
      if (user.length === 0) {
        return {
          success: false,
          error: 'Utilisateur introuvable'
        };
      }

      const targetUser = user[0];

      // Empêcher la désactivation d'un admin
      if (targetUser.role === 'ADMIN' && newStatus === 'BLOCKED') {
        return {
          success: false,
          error: 'Impossible de désactiver un administrateur'
        };
      }

      // Mettre à jour le statut
      await db.update(users)
        .set({ 
          status: newStatus,
          updatedAt: new Date()
        })
        .where(eq(users.id, userId));

      const action = newStatus === 'BLOCKED' ? 'désactivé' : 'activé';

      return {
        success: true,
        message: `Utilisateur ${action} avec succès`,
        data: {
          userId,
          newStatus,
          action
        }
      };

    } catch (error) {
      console.error('Erreur changement statut utilisateur:', error);
      return {
        success: false,
        error: 'Erreur lors du changement de statut'
      };
    }
  }
  /**
   * Obtenir la liste de tous les médecins avec leurs informations complètes
   * @param {Object} filters - Filtres de recherche
   * @param {Object} pagination - Paramètres de pagination
   * @returns {Promise<Object>} Liste des médecins
   */
  static async getAllDoctors(filters = {}, pagination = {}) {
    try {
      const { page = 1, limit = 10, sortBy = 'createdAt', sortOrder = 'desc' } = pagination;
      const { search, status, specialty } = filters;
      const offset = (page - 1) * limit;

      // Construire la requête avec jointure
      let query = db.select({
        id: users.id,
        email: users.email,
        firstName: users.firstName,
        lastName: users.lastName,
        phone: users.phone,
        profilePicture: users.profilePicture,
        status: users.status,
        lastConnection: users.lastConnection,
        createdAt: users.createdAt,
        specialty: doctors.specialty,
        licenseNumber: doctors.licenseNumber,
        doctorId: doctors.id,
        approvedBy: doctors.approvedBy,
        approvedAt: doctors.approvedAt,
        rejectionReason: doctors.rejectionReason
      })
      .from(users)
      .innerJoin(doctors, eq(users.id, doctors.userId));

      // Appliquer les filtres
      const conditions = [eq(users.role, 'DOCTOR')];

      if (status) {
        conditions.push(eq(users.status, status));
      }

      if (specialty) {
        conditions.push(eq(doctors.specialty, specialty));
      }

      if (search) {
        conditions.push(
          or(
            ilike(users.firstName, `%${search}%`),
            ilike(users.lastName, `%${search}%`),
            ilike(users.email, `%${search}%`),
            ilike(doctors.specialty, `%${search}%`),
            ilike(doctors.licenseNumber, `%${search}%`)
          )
        );
      }

      if (conditions.length > 0) {
        query = query.where(and(...conditions));
      }

      // Appliquer la pagination et le tri
      query = query
        .limit(limit)
        .offset(offset)
        .orderBy(sortOrder === 'desc' ? desc(users[sortBy]) : asc(users[sortBy]));

      const allDoctors = await query;

      // Compter le total
      let countQuery = db.select({ count: sql`count(*)` })
        .from(users)
        .innerJoin(doctors, eq(users.id, doctors.userId));

      if (conditions.length > 0) {
        countQuery = countQuery.where(and(...conditions));
      }

      const totalResult = await countQuery;
      const total = parseInt(totalResult[0].count);

      return {
        success: true,
        data: {
          doctors: allDoctors,
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
      console.error('Erreur lors de la récupération des médecins:', error);
      return {
        success: false,
        error: 'Erreur lors de la récupération des médecins'
      };
    }
  }
}

module.exports = AdminService;