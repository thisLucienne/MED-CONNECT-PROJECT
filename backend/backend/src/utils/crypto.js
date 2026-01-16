const bcrypt = require('bcryptjs');
const crypto = require('crypto');

class CryptoUtils {
  /**
   * Hacher un mot de passe avec bcrypt
   * @param {string} password - Le mot de passe à hacher
   * @returns {Promise<string>} Le mot de passe haché
   */
  static async hashPassword(password) {
    const rounds = parseInt(process.env.BCRYPT_ROUNDS) || 12;
    return await bcrypt.hash(password, rounds);
  }

  /**
   * Vérifier un mot de passe avec son hash
   * @param {string} password - Le mot de passe en clair
   * @param {string} hash - Le hash à comparer
   * @returns {Promise<boolean>} True si le mot de passe correspond
   */
  static async verifyPassword(password, hash) {
    return await bcrypt.compare(password, hash);
  }

  /**
   * Générer un code 2FA de 4 chiffres
   * @returns {string} Code 2FA
   */
  static generate2FACode() {
    return Math.floor(1000 + Math.random() * 9000).toString();
  }

  /**
   * Générer une date d'expiration pour le code 2FA
   * @returns {Date} Date d'expiration
   */
  static get2FAExpiryDate() {
    const minutes = parseInt(process.env['2FA_CODE_EXPIRY_MINUTES']) || 10;
    return new Date(Date.now() + minutes * 60 * 1000);
  }

  /**
   * Générer un token aléatoire sécurisé
   * @param {number} length - Longueur du token (par défaut 32)
   * @returns {string} Token hexadécimal
   */
  static generateSecureToken(length = 32) {
    return crypto.randomBytes(length).toString('hex');
  }

  /**
   * Chiffrer une chaîne de caractères
   * @param {string} text - Texte à chiffrer
   * @param {string} key - Clé de chiffrement (optionnel, utilise JWT_SECRET par défaut)
   * @returns {string} Texte chiffré
   */
  static encrypt(text, key = process.env.JWT_SECRET) {
    const algorithm = 'aes-256-cbc';
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipher(algorithm, key);
    
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    
    return iv.toString('hex') + ':' + encrypted;
  }

  /**
   * Déchiffrer une chaîne de caractères
   * @param {string} encryptedText - Texte chiffré
   * @param {string} key - Clé de déchiffrement (optionnel, utilise JWT_SECRET par défaut)
   * @returns {string} Texte déchiffré
   */
  static decrypt(encryptedText, key = process.env.JWT_SECRET) {
    const algorithm = 'aes-256-cbc';
    const parts = encryptedText.split(':');
    const iv = Buffer.from(parts[0], 'hex');
    const encrypted = parts[1];
    
    const decipher = crypto.createDecipher(algorithm, key);
    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    
    return decrypted;
  }

  /**
   * Vérifier si un code 2FA est expiré
   * @param {Date} expiryDate - Date d'expiration du code
   * @returns {boolean} True si le code est expiré
   */
  static is2FACodeExpired(expiryDate) {
    return new Date() > new Date(expiryDate);
  }

  /**
   * Calculer le temps restant avant expiration d'un code 2FA
   * @param {Date} expiryDate - Date d'expiration du code
   * @returns {number} Temps restant en minutes
   */
  static get2FATimeRemaining(expiryDate) {
    const now = new Date();
    const expiry = new Date(expiryDate);
    const diffMs = expiry - now;
    return Math.max(0, Math.ceil(diffMs / (1000 * 60)));
  }
}

module.exports = CryptoUtils;