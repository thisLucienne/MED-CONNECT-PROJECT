const PatientService = require('../services/patientService');

class PatientController {
  /**
   * Obtenir le profil du patient connecté
   */
  static async getProfile(req, res) {
    try {
      const patientId = req.user.id;

      const result = await PatientService.getPatientProfile(patientId);

      if (!result.success) {
        return res.status(404).json({
          success: false,
          error: {
            code: 'PATIENT_NOT_FOUND',
            message: result.error
          }
        });
      }

      res.json({
        success: true,
        data: result.data
      });

    } catch (error) {
      console.error('Erreur récupération profil patient:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Erreur lors de la récupération du profil'
        }
      });
    }
  }

  /**
   * Mettre à jour le profil du patient connecté
   */
  static async updateProfile(req, res) {
    try {
      const patientId = req.user.id;
      const updateData = req.body;

      // Validation des données
      if (!updateData || Object.keys(updateData).length === 0) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'INVALID_DATA',
            message: 'Aucune donnée fournie pour la mise à jour'
          }
        });
      }

      const result = await PatientService.updatePatientProfile(patientId, updateData);

      if (!result.success) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'UPDATE_FAILED',
            message: result.error
          }
        });
      }

      res.json({
        success: true,
        message: result.message,
        data: result.data
      });

    } catch (error) {
      console.error('Erreur mise à jour profil patient:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Erreur lors de la mise à jour du profil'
        }
      });
    }
  }

  /**
   * Obtenir le dashboard du patient
   */
  static async getDashboard(req, res) {
    try {
      const patientId = req.user.id;

      const result = await PatientService.getPatientDashboard(patientId);

      if (!result.success) {
        return res.status(404).json({
          success: false,
          error: {
            code: 'PATIENT_NOT_FOUND',
            message: result.error
          }
        });
      }

      res.json({
        success: true,
        data: result.data
      });

    } catch (error) {
      console.error('Erreur récupération dashboard patient:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Erreur lors de la récupération du dashboard'
        }
      });
    }
  }

  /**
   * Obtenir la liste des médecins disponibles
   */
  static async getAvailableDoctors(req, res) {
    try {
      const patientId = req.user.id;
      const { page = 1, limit = 10, sortBy = 'firstName', sortOrder = 'asc', search, specialty } = req.query;

      const filters = {};
      if (search) filters.search = search;
      if (specialty) filters.specialty = specialty;

      const pagination = {
        page: parseInt(page),
        limit: parseInt(limit),
        sortBy,
        sortOrder
      };

      const result = await PatientService.getAvailableDoctors(patientId, filters, pagination);

      if (!result.success) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'FETCH_FAILED',
            message: result.error
          }
        });
      }

      res.json({
        success: true,
        data: result.data
      });

    } catch (error) {
      console.error('Erreur récupération médecins disponibles:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Erreur lors de la récupération des médecins'
        }
      });
    }
  }

  /**
   * Rechercher des médecins
   */
  static async searchDoctors(req, res) {
    try {
      const patientId = req.user.id;
      const { q: searchQuery, page = 1, limit = 10 } = req.query;

      if (!searchQuery) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'MISSING_QUERY',
            message: 'Paramètre de recherche "q" requis'
          }
        });
      }

      const pagination = {
        page: parseInt(page),
        limit: parseInt(limit)
      };

      const result = await PatientService.searchDoctors(patientId, searchQuery, pagination);

      if (!result.success) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'SEARCH_FAILED',
            message: result.error
          }
        });
      }

      res.json({
        success: true,
        data: result.data
      });

    } catch (error) {
      console.error('Erreur recherche médecins:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Erreur lors de la recherche de médecins'
        }
      });
    }
  }

  /**
   * Obtenir les spécialités médicales disponibles
   */
  static async getSpecialties(req, res) {
    try {
      const result = await PatientService.getAvailableSpecialties();

      if (!result.success) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'FETCH_FAILED',
            message: result.error
          }
        });
      }

      res.json({
        success: true,
        data: result.data
      });

    } catch (error) {
      console.error('Erreur récupération spécialités:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Erreur lors de la récupération des spécialités'
        }
      });
    }
  }
}

module.exports = PatientController;