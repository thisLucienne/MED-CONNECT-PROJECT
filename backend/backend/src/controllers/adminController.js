const AdminService = require('../services/adminService');

class AdminController {
  /**
   * Obtenir la liste des médecins en attente
   * GET /admin/doctors/pending
   */
  static async getPendingDoctors(req, res) {
    try {
      const filters = {
        search: req.query.search
      };

      const pagination = {
        page: parseInt(req.query.page) || 1,
        limit: parseInt(req.query.limit) || 10,
        sortBy: req.query.sortBy || 'createdAt',
        sortOrder: req.query.sortOrder || 'desc'
      };

      const result = await AdminService.getPendingDoctors(filters, pagination);

      if (!result.success) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'FETCH_FAILED',
            message: result.error
          }
        });
      }

      res.status(200).json({
        success: true,
        data: result.data
      });

    } catch (error) {
      console.error('Erreur contrôleur médecins en attente:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Erreur interne du serveur'
        }
      });
    }
  }

  /**
   * Valider ou rejeter une candidature de médecin
   * POST /admin/doctors/:doctorId/validate
   */
  static async validateDoctor(req, res) {
    try {
      const { doctorId } = req.params;
      const { action, rejectionReason } = req.body;
      const adminId = req.user.id;

      const result = await AdminService.validateDoctorApplication(
        doctorId,
        action,
        adminId,
        rejectionReason
      );

      if (!result.success) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'VALIDATION_FAILED',
            message: result.error
          }
        });
      }

      res.status(200).json({
        success: true,
        message: result.message,
        data: result.data
      });

    } catch (error) {
      console.error('Erreur contrôleur validation médecin:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Erreur interne du serveur'
        }
      });
    }
  }

  /**
   * Obtenir la liste de tous les médecins
   * GET /admin/doctors
   */
  static async getAllDoctors(req, res) {
    try {
      const filters = {
        search: req.query.search,
        status: req.query.status,
        specialty: req.query.specialty
      };

      const pagination = {
        page: parseInt(req.query.page) || 1,
        limit: parseInt(req.query.limit) || 10,
        sortBy: req.query.sortBy || 'createdAt',
        sortOrder: req.query.sortOrder || 'desc'
      };

      const result = await AdminService.getAllDoctors(filters, pagination);

      if (!result.success) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'FETCH_FAILED',
            message: result.error
          }
        });
      }

      res.status(200).json({
        success: true,
        data: result.data
      });

    } catch (error) {
      console.error('Erreur contrôleur liste médecins:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Erreur interne du serveur'
        }
      });
    }
  }

  /**
   * Obtenir la liste de tous les utilisateurs
   * GET /admin/users
   */
  static async getAllUsers(req, res) {
    try {
      const filters = {
        role: req.query.role,
        status: req.query.status,
        search: req.query.search
      };

      const pagination = {
        page: parseInt(req.query.page) || 1,
        limit: parseInt(req.query.limit) || 10,
        sortBy: req.query.sortBy || 'createdAt',
        sortOrder: req.query.sortOrder || 'desc'
      };

      const result = await AdminService.getAllUsers(filters, pagination);

      if (!result.success) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'FETCH_FAILED',
            message: result.error
          }
        });
      }

      res.status(200).json({
        success: true,
        data: result.data
      });

    } catch (error) {
      console.error('Erreur contrôleur liste utilisateurs:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Erreur interne du serveur'
        }
      });
    }
  }

  /**
   * Obtenir les statistiques du système
   * GET /admin/stats
   */
  static async getSystemStats(req, res) {
    try {
      const result = await AdminService.getSystemStats();

      if (!result.success) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'STATS_FAILED',
            message: result.error
          }
        });
      }

      res.status(200).json({
        success: true,
        data: result.data
      });

    } catch (error) {
      console.error('Erreur contrôleur statistiques:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Erreur interne du serveur'
        }
      });
    }
  }

  /**
   * Changer le statut d'un utilisateur
   * POST /admin/users/:userId/status
   */
  static async changeUserStatus(req, res) {
    try {
      const { userId } = req.params;
      const { status } = req.body;
      const adminId = req.user.id;

      if (!['ACTIVE', 'BLOCKED'].includes(status)) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'INVALID_STATUS',
            message: 'Statut invalide. Utilisez ACTIVE ou BLOCKED'
          }
        });
      }

      const result = await AdminService.changeUserStatus(userId, status, adminId);

      if (!result.success) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'STATUS_CHANGE_FAILED',
            message: result.error
          }
        });
      }

      res.status(200).json({
        success: true,
        message: result.message,
        data: result.data
      });

    } catch (error) {
      console.error('Erreur contrôleur changement statut:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Erreur interne du serveur'
        }
      });
    }
  }

  /**
   * Obtenir les détails d'un utilisateur spécifique
   * GET /admin/users/:userId
   */
  static async getUserDetails(req, res) {
    try {
      const { userId } = req.params;

      const result = await AdminService.getUserDetails(userId);

      if (!result.success) {
        return res.status(404).json({
          success: false,
          error: {
            code: 'USER_NOT_FOUND',
            message: result.error
          }
        });
      }

      res.status(200).json({
        success: true,
        data: result.data
      });

    } catch (error) {
      console.error('Erreur contrôleur détails utilisateur:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Erreur interne du serveur'
        }
      });
    }
  }
}

module.exports = AdminController;