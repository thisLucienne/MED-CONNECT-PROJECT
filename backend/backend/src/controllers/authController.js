const AuthService = require('../services/authService');
const { ValidationService } = require('../utils/validators');

class AuthController {
  /**
   * Inscription d'un patient
   * POST /auth/register/patient
   */
  static async registerPatient(req, res) {
    try {
      const userData = req.body;
      const profilePicture = req.file;

      // L'inscription du patient
      const result = await AuthService.registerPatient(userData, profilePicture);

      if (!result.success) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'REGISTRATION_FAILED',
            message: result.error
          }
        });
      }

      res.status(201).json({
        success: true,
        message: 'Inscription réussie ! Bienvenue sur Med Connect.',
        data: result.data
      });

    } catch (error) {
      console.error('Erreur contrôleur inscription patient:', error);
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
   * Inscription d'un médecin (candidature)
   * POST /auth/register/doctor
   */
  static async registerDoctor(req, res) {
    try {
      const userData = req.body;
      const profilePicture = req.file;

      // L'inscription du médecin
      const result = await AuthService.registerDoctor(userData, profilePicture);

      if (!result.success) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'REGISTRATION_FAILED',
            message: result.error
          }
        });
      }

      res.status(201).json({
        success: true,
        message: result.data.message,
        data: {
          user: result.data.user
        }
      });

    } catch (error) {
      console.error('Erreur contrôleur inscription médecin:', error);
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
   * Connexion utilisateur (première étape)
   * POST /auth/login
   */
  static async login(req, res) {
    try {
      const { email, password } = req.body;

      const result = await AuthService.login(email, password);

      if (!result.success) {
        return res.status(401).json({
          success: false,
          error: {
            code: 'LOGIN_FAILED',
            message: result.error
          }
        });
      }

      // Si l'utilisateur nécessite une vérification 2FA
      if (result.data.user.requiresVerification) {
        return res.status(200).json({
          success: true,
          message: result.data.message,
          data: {
            user: result.data.user,
            requiresVerification: true
          }
        });
      }

      // Connexion directe pour les admins
      res.status(200).json({
        success: true,
        message: 'Connexion réussie',
        data: result.data
      });

    } catch (error) {
      console.error('Erreur contrôleur connexion:', error);
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
   * Vérification du code 2FA
   * POST /auth/verify-2fa
   */
  static async verify2FA(req, res) {
    try {
      const { userId, code } = req.body;

      const result = await AuthService.verify2FA(userId, code);

      if (!result.success) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'VERIFICATION_FAILED',
            message: result.error
          }
        });
      }

      res.status(200).json({
        success: true,
        message: 'Vérification réussie',
        data: result.data
      });

    } catch (error) {
      console.error('Erreur contrôleur vérification 2FA:', error);
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
   * Demander un nouveau code 2FA
   * POST /auth/resend-2fa
   */
  static async resend2FA(req, res) {
    try {
      const { userId } = req.body;

      const result = await AuthService.generate2FACode(userId);

      if (!result.success) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'RESEND_FAILED',
            message: result.error
          }
        });
      }

      res.status(200).json({
        success: true,
        message: 'Nouveau code envoyé par email'
      });

    } catch (error) {
      console.error('Erreur contrôleur renvoi 2FA:', error);
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
   * Rafraîchir les tokens
   * POST /auth/refresh
   */
  static async refreshToken(req, res) {
    try {
      const { refreshToken } = req.body;

      const result = await AuthService.refreshToken(refreshToken);

      if (!result.success) {
        return res.status(401).json({
          success: false,
          error: {
            code: 'REFRESH_FAILED',
            message: result.error
          }
        });
      }

      res.status(200).json({
        success: true,
        message: 'Tokens rafraîchis',
        data: result.data
      });

    } catch (error) {
      console.error('Erreur contrôleur refresh token:', error);
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
   * Déconnexion
   * POST /auth/logout
   */
  static async logout(req, res) {
    try {
      const userId = req.user?.id;
      const { refreshToken } = req.body;

      // Si l'utilisateur n'est pas authentifié (token expiré/invalide),
      // on considère la déconnexion comme réussie côté client
      if (!userId) {
        return res.status(200).json({
          success: true,
          message: 'Déconnexion réussie'
        });
      }

      const result = await AuthService.logout(userId, refreshToken);

      if (!result.success) {
        // Même en cas d'erreur côté serveur, on considère la déconnexion
        // comme réussie côté client pour éviter les blocages
        console.warn('Erreur lors de la déconnexion côté serveur:', result.error);
        return res.status(200).json({
          success: true,
          message: 'Déconnexion réussie'
        });
      }

      res.status(200).json({
        success: true,
        message: result.message
      });

    } catch (error) {
      console.error('Erreur contrôleur déconnexion:', error);
      // Même en cas d'erreur, on retourne un succès pour la déconnexion
      res.status(200).json({
        success: true,
        message: 'Déconnexion réussie'
      });
    }
  }

  /**
   * Obtenir le profil de l'utilisateur connecté
   * GET /auth/profile
   */
  static async getProfile(req, res) {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          error: {
            code: 'NOT_AUTHENTICATED',
            message: 'Utilisateur non authentifié'
          }
        });
      }

      res.status(200).json({
        success: true,
        data: {
          user: req.user
        }
      });

    } catch (error) {
      console.error('Erreur contrôleur profil:', error);
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
   * Vérifier la validité d'un token
   * GET /auth/verify-token
   */
  static async verifyToken(req, res) {
    try {
      // Si on arrive ici, c'est que le middleware d'auth a validé le token
      res.status(200).json({
        success: true,
        message: 'Token valide',
        data: {
          user: req.user,
          isValid: true
        }
      });

    } catch (error) {
      console.error('Erreur contrôleur vérification token:', error);
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
   * Mettre à jour le profil de l'utilisateur connecté
   * PUT /auth/profile
   */
  static async updateProfile(req, res) {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          error: {
            code: 'NOT_AUTHENTICATED',
            message: 'Utilisateur non authentifié'
          }
        });
      }

      const userId = req.user.id;
      const updateData = {
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        phone: req.body.phone
      };
      const profilePicture = req.file; // Fichier uploadé via multer

      const result = await AuthService.updateProfile(userId, updateData, profilePicture);

      if (!result.success) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'UPDATE_FAILED',
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
      console.error('Erreur contrôleur mise à jour profil:', error);
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

module.exports = AuthController;