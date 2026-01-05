const { ValidationService, validationSchemas } = require('../utils/validators');

// Middleware de validation pour les différentes routes
const validationMiddleware = {
  // Validation pour l'inscription des patients
  validatePatientRegistration: ValidationService.validateMiddleware(
    validationSchemas.registerPatient,
    'body'
  ),

  // Validation pour l'inscription des médecins
  validateDoctorRegistration: ValidationService.validateMiddleware(
    validationSchemas.registerDoctor,
    'body'
  ),

  // Validation pour la connexion
  validateLogin: ValidationService.validateMiddleware(
    validationSchemas.login,
    'body'
  ),

  // Validation pour la vérification 2FA
  validateTwoFactorAuth: ValidationService.validateMiddleware(
    validationSchemas.verify2FA,
    'body'
  ),

  // Validation pour le refresh token
  validateRefreshToken: ValidationService.validateMiddleware(
    validationSchemas.refreshToken,
    'body'
  ),

  // Validation pour la validation/rejet des médecins
  validateDoctorAction: ValidationService.validateMiddleware(
    validationSchemas.validateDoctor,
    'body'
  ),

  // Validation pour la mise à jour du profil
  validateProfileUpdate: ValidationService.validateMiddleware(
    validationSchemas.updateProfile,
    'body'
  ),

  // Validation pour le changement de mot de passe
  validatePasswordChange: ValidationService.validateMiddleware(
    validationSchemas.changePassword,
    'body'
  ),

  // Validation pour les paramètres de pagination
  validatePagination: ValidationService.validateMiddleware(
    validationSchemas.pagination,
    'query'
  ),

  // Validation pour les filtres utilisateurs
  validateUserFilters: ValidationService.validateMiddleware(
    validationSchemas.userFilters,
    'query'
  ),

  // Validation pour les paramètres UUID
  validateUuidParam: (paramName = 'id') => {
    const schema = require('joi').object({
      [paramName]: require('../utils/validators').customValidators.uuid
    });
    
    return ValidationService.validateMiddleware(schema, 'params');
  },

  // Middleware personnalisé pour valider les fichiers uploadés
  validateFileUpload: (req, res, next) => {
    // Si aucun fichier n'est fourni, continuer (optionnel)
    if (!req.file) {
      return next();
    }

    const validation = ValidationService.validateFile(req.file);
    
    if (!validation.isValid) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'FILE_VALIDATION_ERROR',
          message: validation.error
        }
      });
    }

    next();
  },

  // Middleware pour nettoyer les termes de recherche
  sanitizeSearch: (req, res, next) => {
    if (req.query.search) {
      req.query.search = ValidationService.sanitizeSearchTerm(req.query.search);
    }
    next();
  }
};

module.exports = validationMiddleware;