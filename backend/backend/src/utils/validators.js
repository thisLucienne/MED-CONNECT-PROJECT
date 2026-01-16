const Joi = require('joi');

// Schémas de validation personnalisés
const customValidators = {
  // Validation du mot de passe complexe
  password: Joi.string()
    .min(8)
    .max(128)
    .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
    .required()
    .messages({
      'string.pattern.base': 'Le mot de passe doit contenir au moins 8 caractères, une majuscule, une minuscule, un chiffre et un caractère spécial',
      'string.min': 'Le mot de passe doit contenir au moins 8 caractères',
      'string.max': 'Le mot de passe ne peut pas dépasser 128 caractères'
    }),

  // Validation de l'email
  email: Joi.string()
    .email({ tlds: { allow: false } })
    .max(255)
    .required()
    .messages({
      'string.email': 'L\'adresse email n\'est pas valide'
    }),

  // Validation du nom/prénom
  name: Joi.string()
    .min(2)
    .max(100)
    .pattern(/^[a-zA-ZÀ-ÿ\s'-]+$/)
    .required()
    .messages({
      'string.pattern.base': 'Le nom ne peut contenir que des lettres, espaces, apostrophes et tirets',
      'string.min': 'Le nom doit contenir au moins 2 caractères',
      'string.max': 'Le nom ne peut pas dépasser 100 caractères'
    }),

  // Validation du téléphone (format camerounais)
  phone: Joi.string()
    .pattern(/^6\s?\d{2}\s?\d{2}\s?\d{2}\s?\d{2}$/)
    .messages({
      'string.pattern.base': 'Le numéro de téléphone doit être au format camerounais (6 XX XX XX XX)'
    }),

  // Validation de la spécialité médicale
  specialty: Joi.string()
    .min(2)
    .max(100)
    .required()
    .messages({
      'string.min': 'La spécialité doit contenir au moins 2 caractères',
      'string.max': 'La spécialité ne peut pas dépasser 100 caractères'
    }),

  // Validation du numéro de licence des médecins
  licenseNumber: Joi.string()
    .min(3)
    .max(20)
    .pattern(/^[A-Za-z0-9\-\/\s]+$/)
    .required()
    .messages({
      'string.pattern.base': 'Le numéro de licence ne peut contenir que des lettres, chiffres, tirets et espaces',
      'string.min': 'Le numéro de licence doit contenir au moins 3 caractères',
      'string.max': 'Le numéro de licence ne peut pas dépasser 20 caractères'
    }),

  // Validation du code 2FA
  twoFactorCode: Joi.string()
    .pattern(/^[0-9]{4}$/)
    .required()
    .messages({
      'string.pattern.base': 'Le code de vérification doit contenir exactement 4 chiffres'
    }),

  // Validation de l'UUID
  uuid: Joi.string()
    .uuid()
    .required()
    .messages({
      'string.uuid': 'L\'identifiant doit être un UUID valide'
    }),

  // Validation du rôle
  role: Joi.string()
    .valid('PATIENT', 'DOCTOR', 'ADMIN')
    .required()
    .messages({
      'any.only': 'Le rôle doit être PATIENT, DOCTOR ou ADMIN'
    }),

  // Validation du statut
  status: Joi.string()
    .valid('ACTIVE', 'PENDING', 'APPROVED', 'REJECTED', 'BLOCKED')
    .messages({
      'any.only': 'Le statut doit être ACTIVE, PENDING, APPROVED, REJECTED ou BLOCKED'
    })
};

// Schémas de validation pour les différentes opérations
const validationSchemas = {
  // Inscription patient
  registerPatient: Joi.object({
    firstName: customValidators.name,
    lastName: customValidators.name,
    email: customValidators.email,
    password: customValidators.password,
    phone: customValidators.phone.optional()
  }),

  // Inscription médecin
  registerDoctor: Joi.object({
    firstName: customValidators.name,
    lastName: customValidators.name,
    email: customValidators.email,
    password: customValidators.password,
    phone: customValidators.phone.optional(),
    specialty: customValidators.specialty,
    licenseNumber: customValidators.licenseNumber
  }),

  // Connexion
  login: Joi.object({
    email: customValidators.email,
    password: Joi.string().required().messages({
      'any.required': 'Le mot de passe est requis'
    })
  }),

  // Vérification 2FA
  verify2FA: Joi.object({
    userId: customValidators.uuid,
    code: customValidators.twoFactorCode
  }),

  // Refresh token
  refreshToken: Joi.object({
    refreshToken: Joi.string().required().messages({
      'any.required': 'Le refresh token est requis'
    })
  }),

  // Validation/rejet médecin par admin
  // Note: doctorId est dans l'URL (req.params), pas dans le body
  validateDoctor: Joi.object({
    action: Joi.string().valid('approve', 'reject').required(),
    rejectionReason: Joi.when('action', {
      is: 'reject',
      then: Joi.string().min(10).max(500).required().messages({
        'string.min': 'La raison du rejet doit contenir au moins 10 caractères',
        'string.max': 'La raison du rejet ne peut pas dépasser 500 caractères',
        'any.required': 'La raison du rejet est requise'
      }),
      otherwise: Joi.optional()
    })
  }),

  // Mise à jour du profil
  updateProfile: Joi.object({
    firstName: customValidators.name.optional(),
    lastName: customValidators.name.optional(),
    phone: customValidators.phone.optional(),
    // Le mot de passe et l'email nécessitent une validation séparée
  }),

  // Changement de mot de passe
  changePassword: Joi.object({
    currentPassword: Joi.string().required().messages({
      'any.required': 'Le mot de passe actuel est requis'
    }),
    newPassword: customValidators.password
  }),

  // Demande de nouveau code 2FA
  requestNew2FA: Joi.object({
    userId: customValidators.uuid
  }),

  // Validation des paramètres de pagination
  pagination: Joi.object({
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(100).default(10),
    sortBy: Joi.string().valid('createdAt', 'updatedAt', 'firstName', 'lastName', 'email').default('createdAt'),
    sortOrder: Joi.string().valid('asc', 'desc').default('desc')
  }),

  // Validation des filtres pour les listes
  userFilters: Joi.object({
    role: Joi.string().valid('PATIENT', 'DOCTOR', 'ADMIN').optional(),
    status: Joi.string().valid('ACTIVE', 'PENDING', 'APPROVED', 'REJECTED', 'BLOCKED').optional(),
    search: Joi.string().max(100).optional() // Recherche par nom, prénom ou email
  })
};

class ValidationService {
  /**
   * Valider des données selon un schéma
   * @param {Object} data - Données à valider
   * @param {Object} schema - Schéma Joi de validation
   * @returns {Object} Résultat de la validation
   */
  static validate(data, schema) {
    const { error, value } = schema.validate(data, {
      abortEarly: false, // Retourner toutes les erreurs
      stripUnknown: true, // Supprimer les champs non définis
      convert: true // Convertir les types automatiquement
    });

    if (error) {
      const errors = error.details.map(detail => ({
        field: detail.path.join('.'),
        message: detail.message,
        value: detail.context?.value
      }));

      return {
        isValid: false,
        errors,
        data: null
      };
    }

    return {
      isValid: true,
      errors: null,
      data: value
    };
  }

  /**
   * Middleware de validation Express
   * @param {Object} schema - Schéma de validation
   * @param {string} source - Source des données ('body', 'query', 'params')
   * @returns {Function} Middleware Express
   */
  static validateMiddleware(schema, source = 'body') {
    return (req, res, next) => {
      const data = req[source];
      const result = this.validate(data, schema);

      if (!result.isValid) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Les données fournies ne sont pas valides',
            details: result.errors
          }
        });
      }

      // Remplacer les données par les données validées et nettoyées
      req[source] = result.data;
      next();
    };
  }

  /**
   * Valider un fichier uploadé
   * @param {Object} file - Fichier multer
   * @returns {Object} Résultat de la validation
   */
  static validateFile(file) {
    if (!file) {
      return {
        isValid: false,
        error: 'Aucun fichier fourni'
      };
    }

    // Vérifier le type MIME
    const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!allowedMimeTypes.includes(file.mimetype)) {
      return {
        isValid: false,
        error: 'Format de fichier non supporté. Utilisez JPG, PNG ou WEBP'
      };
    }

    // Vérifier la taille (5MB max)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      return {
        isValid: false,
        error: 'Le fichier est trop volumineux. Taille maximum: 5MB'
      };
    }

    return {
      isValid: true,
      error: null
    };
  }

  /**
   * Nettoyer et valider une chaîne de recherche
   * @param {string} searchTerm - Terme de recherche
   * @returns {string} Terme nettoyé
   */
  static sanitizeSearchTerm(searchTerm) {
    if (!searchTerm || typeof searchTerm !== 'string') {
      return '';
    }

    return searchTerm
      .trim()
      .replace(/[<>\"'%;()&+]/g, '') // Supprimer les caractères dangereux
      .substring(0, 100); // Limiter la longueur
  }
}

module.exports = {
  ValidationService,
  validationSchemas,
  customValidators
};