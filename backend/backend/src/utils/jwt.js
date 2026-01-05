const jwt = require('jsonwebtoken');
const crypto = require('crypto');

// Fonction pour générer un UUID v4 simple
const generateUUID = () => {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c == 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
};

class JWTUtils {
  /**
   * Générer un token d'accès JWT
   * @param {Object} payload - Données à inclure dans le token
   * @returns {string} Token JWT
   */
  static generateAccessToken(payload) {
    const secret = process.env.JWT_SECRET;
    const expiresIn = process.env.JWT_EXPIRES_IN || '15m';
    
    return jwt.sign(
      {
        ...payload,
        type: 'access',
        jti: generateUUID() // JWT ID unique
      },
      secret,
      { 
        expiresIn,
        issuer: 'med-connect',
        audience: 'med-connect-users'
      }
    );
  }

  /**
   * Générer un refresh token JWT
   * @param {Object} payload - Données à inclure dans le token
   * @returns {string} Refresh token JWT
   */
  static generateRefreshToken(payload) {
    const secret = process.env.JWT_SECRET;
    const expiresIn = process.env.JWT_REFRESH_EXPIRES_IN || '7d';
    
    return jwt.sign(
      {
        ...payload,
        type: 'refresh',
        jti: generateUUID()
      },
      secret,
      { 
        expiresIn,
        issuer: 'med-connect',
        audience: 'med-connect-users'
      }
    );
  }

  /**
   * Vérifier et décoder un token JWT
   * @param {string} token - Token à vérifier
   * @returns {Object} Payload décodé
   */
  static verifyToken(token) {
    const secret = process.env.JWT_SECRET;
    
    try {
      return jwt.verify(token, secret, {
        issuer: 'med-connect',
        audience: 'med-connect-users'
      });
    } catch (error) {
      throw new Error(`Token invalide: ${error.message}`);
    }
  }

  /**
   * Décoder un token sans vérification (pour debug)
   * @param {string} token - Token à décoder
   * @returns {Object} Payload décodé
   */
  static decodeToken(token) {
    return jwt.decode(token);
  }

  /**
   * Vérifier si un token est expiré
   * @param {string} token - Token à vérifier
   * @returns {boolean} True si le token est expiré
   */
  static isTokenExpired(token) {
    try {
      const decoded = jwt.decode(token);
      if (!decoded || !decoded.exp) return true;
      
      return Date.now() >= decoded.exp * 1000;
    } catch (error) {
      return true;
    }
  }

  /**
   * Extraire le token du header Authorization
   * @param {string} authHeader - Header Authorization
   * @returns {string|null} Token extrait ou null
   */
  static extractTokenFromHeader(authHeader) {
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return null;
    }
    
    return authHeader.substring(7); // Enlever "Bearer "
  }

  /**
   * Générer une paire de tokens (access + refresh)
   * @param {Object} user - Données utilisateur
   * @returns {Object} Objet contenant accessToken et refreshToken
   */
  static generateTokenPair(user) {
    const payload = {
      userId: user.id,
      email: user.email,
      role: user.role,
      status: user.status
    };

    return {
      accessToken: this.generateAccessToken(payload),
      refreshToken: this.generateRefreshToken({ userId: user.id })
    };
  }

  /**
   * Calculer le temps restant avant expiration d'un token
   * @param {string} token - Token à analyser
   * @returns {number} Temps restant en secondes
   */
  static getTokenTimeRemaining(token) {
    try {
      const decoded = jwt.decode(token);
      if (!decoded || !decoded.exp) return 0;
      
      const now = Math.floor(Date.now() / 1000);
      return Math.max(0, decoded.exp - now);
    } catch (error) {
      return 0;
    }
  }

  /**
   * Vérifier si un token est un refresh token
   * @param {string} token - Token à vérifier
   * @returns {boolean} True si c'est un refresh token
   */
  static isRefreshToken(token) {
    try {
      const decoded = jwt.decode(token);
      return decoded && decoded.type === 'refresh';
    } catch (error) {
      return false;
    }
  }

  /**
   * Vérifier si un token est un access token
   * @param {string} token - Token à vérifier
   * @returns {boolean} True si c'est un access token
   */
  static isAccessToken(token) {
    try {
      const decoded = jwt.decode(token);
      return decoded && decoded.type === 'access';
    } catch (error) {
      return false;
    }
  }
}

module.exports = JWTUtils;