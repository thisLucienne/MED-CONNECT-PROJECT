const JWTUtils = require('../utils/jwt');
const { db } = require('../config/database');
const { users } = require('../db/schema');
const { eq } = require('drizzle-orm');

/**
 * Middleware d'authentification JWT
 * Vérifie la validité du token d'accès et charge les informations utilisateur
 */
const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    const token = JWTUtils.extractTokenFromHeader(authHeader);

    if (!token) {
      return res.status(401).json({
        success: false,
        error: {
          code: 'MISSING_TOKEN',
          message: 'Token d\'authentification requis'
        }
      });
    }

    // Vérifier le token
    const decoded = JWTUtils.verifyToken(token);

    if (!JWTUtils.isAccessToken(token)) {
      return res.status(401).json({
        success: false,
        error: {
          code: 'INVALID_TOKEN_TYPE',
          message: 'Type de token invalide'
        }
      });
    }

    // Vérifier si l'utilisateur existe toujours
    const user = await db.select().from(users).where(eq(users.id, decoded.userId)).limit(1);

    if (user.length === 0) {
      return res.status(401).json({
        success: false,
        error: {
          code: 'USER_NOT_FOUND',
          message: 'Utilisateur introuvable'
        }
      });
    }

    const userData = user[0];

    // Vérifier le statut du compte
    if (userData.status === 'BLOCKED') {
      return res.status(403).json({
        success: false,
        error: {
          code: 'ACCOUNT_BLOCKED',
          message: 'Compte bloqué'
        }
      });
    }

    if (userData.status === 'PENDING') {
      return res.status(403).json({
        success: false,
        error: {
          code: 'ACCOUNT_PENDING',
          message: 'Compte en attente de validation'
        }
      });
    }

    if (userData.status === 'REJECTED') {
      return res.status(403).json({
        success: false,
        error: {
          code: 'ACCOUNT_REJECTED',
          message: 'Compte rejeté'
        }
      });
    }

    // Ajouter les informations utilisateur à la requête
    req.user = {
      id: userData.id,
      email: userData.email,
      firstName: userData.firstName,
      lastName: userData.lastName,
      phone: userData.phone,
      profilePicture: userData.profilePicture,
      role: userData.role,
      status: userData.status,
      lastConnection: userData.lastConnection
    };

    next();

  } catch (error) {
    console.error('Erreur authentification:', error);
    
    if (error.message.includes('Token invalide')) {
      return res.status(401).json({
        success: false,
        error: {
          code: 'INVALID_TOKEN',
          message: 'Token invalide ou expiré'
        }
      });
    }

    return res.status(500).json({
      success: false,
      error: {
        code: 'AUTH_ERROR',
        message: 'Erreur d\'authentification'
      }
    });
  }
};

/**
 * Middleware d'autorisation par rôle
 * @param {Array<string>} allowedRoles - Rôles autorisés
 * @returns {Function} Middleware Express
 */
const requireRole = (allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: {
          code: 'NOT_AUTHENTICATED',
          message: 'Authentification requise'
        }
      });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        error: {
          code: 'INSUFFICIENT_PERMISSIONS',
          message: 'Permissions insuffisantes',
          details: {
            required: allowedRoles,
            current: req.user.role
          }
        }
      });
    }

    next();
  };
};

/**
 * Middleware pour vérifier que l'utilisateur accède à ses propres données
 * @param {string} paramName - Nom du paramètre contenant l'ID utilisateur (par défaut 'userId')
 * @returns {Function} Middleware Express
 */
const requireOwnership = (paramName = 'userId') => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: {
          code: 'NOT_AUTHENTICATED',
          message: 'Authentification requise'
        }
      });
    }

    const targetUserId = req.params[paramName] || req.body[paramName];

    // Les admins peuvent accéder aux données de tous les utilisateurs
    if (req.user.role === 'ADMIN') {
      return next();
    }

    // Vérifier que l'utilisateur accède à ses propres données
    if (req.user.id !== targetUserId) {
      return res.status(403).json({
        success: false,
        error: {
          code: 'ACCESS_DENIED',
          message: 'Accès refusé à ces données'
        }
      });
    }

    next();
  };
};

/**
 * Middleware optionnel d'authentification
 * Charge les informations utilisateur si un token est fourni, mais ne bloque pas si absent
 */
const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    const token = JWTUtils.extractTokenFromHeader(authHeader);

    if (!token) {
      // Pas de token, continuer sans utilisateur
      req.user = null;
      return next();
    }

    // Vérifier le token
    const decoded = JWTUtils.verifyToken(token);

    if (!JWTUtils.isAccessToken(token)) {
      req.user = null;
      return next();
    }

    // Charger l'utilisateur
    const user = await db.select().from(users).where(eq(users.id, decoded.userId)).limit(1);

    if (user.length > 0 && user[0].status === 'ACTIVE') {
      req.user = {
        id: user[0].id,
        email: user[0].email,
        firstName: user[0].firstName,
        lastName: user[0].lastName,
        role: user[0].role,
        status: user[0].status
      };
    } else {
      req.user = null;
    }

    next();

  } catch (error) {
    // En cas d'erreur, continuer sans utilisateur
    req.user = null;
    next();
  }
};

/**
 * Middleware de rate limiting par utilisateur
 * @param {number} maxRequests - Nombre maximum de requêtes
 * @param {number} windowMs - Fenêtre de temps en millisecondes
 * @returns {Function} Middleware Express
 */
const rateLimitByUser = (maxRequests = 100, windowMs = 15 * 60 * 1000) => {
  const userRequests = new Map();

  return (req, res, next) => {
    const userId = req.user?.id || req.ip;
    const now = Date.now();
    
    if (!userRequests.has(userId)) {
      userRequests.set(userId, { count: 1, resetTime: now + windowMs });
      return next();
    }

    const userLimit = userRequests.get(userId);
    
    if (now > userLimit.resetTime) {
      // Réinitialiser le compteur
      userRequests.set(userId, { count: 1, resetTime: now + windowMs });
      return next();
    }

    if (userLimit.count >= maxRequests) {
      const resetIn = Math.ceil((userLimit.resetTime - now) / 1000);
      
      return res.status(429).json({
        success: false,
        error: {
          code: 'RATE_LIMIT_EXCEEDED',
          message: 'Trop de requêtes',
          details: {
            limit: maxRequests,
            resetIn: resetIn
          }
        }
      });
    }

    userLimit.count++;
    next();
  };
};

/**
 * Middleware pour vérifier le statut spécifique d'un utilisateur
 * @param {Array<string>} allowedStatuses - Statuts autorisés
 * @returns {Function} Middleware Express
 */
const requireStatus = (allowedStatuses) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: {
          code: 'NOT_AUTHENTICATED',
          message: 'Authentification requise'
        }
      });
    }

    if (!allowedStatuses.includes(req.user.status)) {
      return res.status(403).json({
        success: false,
        error: {
          code: 'INVALID_STATUS',
          message: 'Statut de compte non autorisé',
          details: {
            required: allowedStatuses,
            current: req.user.status
          }
        }
      });
    }

    next();
  };
};

/**
 * Middleware combiné pour les routes d'administration
 */
const requireAdmin = [
  authenticateToken,
  requireRole(['ADMIN']),
  requireStatus(['ACTIVE'])
];

/**
 * Middleware combiné pour les routes de médecins
 */
const requireDoctor = [
  authenticateToken,
  requireRole(['DOCTOR']),
  requireStatus(['ACTIVE', 'APPROVED'])
];

/**
 * Middleware combiné pour les routes de patients
 */
const requirePatient = [
  authenticateToken,
  requireRole(['PATIENT']),
  requireStatus(['ACTIVE'])
];

/**
 * Middleware combiné pour les routes nécessitant une authentification de base
 */
const requireAuth = [
  authenticateToken,
  requireStatus(['ACTIVE', 'APPROVED'])
];

module.exports = {
  authenticateToken,
  requireRole,
  requireOwnership,
  optionalAuth,
  rateLimitByUser,
  requireStatus,
  requireAdmin,
  requireDoctor,
  requirePatient,
  requireAuth
};