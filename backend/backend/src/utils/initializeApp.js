const AdminService = require('../services/adminService');
const { testConnection } = require('../config/database');
const { testCloudinaryConnection } = require('../config/cloudinary');
const { testEmailConnection } = require('../config/email');

/**
 * Initialiser l'application au démarrage
 */
const initializeApp = async () => {
  console.log('🚀 Initialisation de l\'application...');

  try {
    // 1. Tester la connexion à la base de données
    console.log('📊 Test de la connexion à la base de données...');
    const dbConnected = await testConnection();
    
    if (!dbConnected) {
      throw new Error('Impossible de se connecter à la base de données');
    }

    // 2. Créer l'administrateur par défaut
    console.log('👤 Création de l\'administrateur par défaut...');
    const adminResult = await AdminService.createDefaultAdmin();
    
    if (!adminResult.success) {
      console.warn('⚠️  Erreur création admin:', adminResult.error);
    }

    // 3. Tester la connexion Cloudinary (optionnel)
    if (process.env.CLOUDINARY_CLOUD_NAME) {
      console.log('☁️  Test de la connexion Cloudinary...');
      await testCloudinaryConnection();
    } else {
      console.log('⚠️  Configuration Cloudinary manquante - Upload d\'images désactivé');
    }

    // 4. Tester la connexion email (optionnel)
    if (process.env.EMAIL_USER) {
      console.log('📧 Test de la connexion email...');
      await testEmailConnection();
    } else {
      console.log('⚠️  Configuration email manquante - Envoi d\'emails désactivé');
    }

    console.log('✅ Initialisation terminée avec succès !');
    console.log('');
    console.log('🔐 Informations de connexion admin par défaut :');
    console.log(`📧 Email: ${process.env.DEFAULT_ADMIN_EMAIL || 'admin@medconnect.com'}`);
    console.log(`🔑 Mot de passe: ${process.env.DEFAULT_ADMIN_PASSWORD || 'Admin123!@#'}`);
    console.log('⚠️  IMPORTANT: Changez ces identifiants après la première connexion !');
    console.log('');

    return {
      success: true,
      message: 'Application initialisée avec succès'
    };

  } catch (error) {
    console.error('❌ Erreur lors de l\'initialisation:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

/**
 * Nettoyer les données expirées (à exécuter périodiquement)
 */
const cleanupExpiredData = async () => {
  try {
    const { db } = require('../config/database');
    const { twoFactorCodes, refreshTokens } = require('../db/schema');
    const { lt } = require('drizzle-orm');

    console.log('🧹 Nettoyage des données expirées...');

    // Supprimer les codes 2FA expirés
    const expiredCodes = await db.delete(twoFactorCodes)
      .where(lt(twoFactorCodes.expiresAt, new Date()));

    // Supprimer les refresh tokens expirés
    const expiredTokens = await db.delete(refreshTokens)
      .where(lt(refreshTokens.expiresAt, new Date()));

    console.log(`✅ Nettoyage terminé - Codes 2FA: ${expiredCodes.length}, Tokens: ${expiredTokens.length}`);

    return {
      success: true,
      cleaned: {
        twoFactorCodes: expiredCodes.length,
        refreshTokens: expiredTokens.length
      }
    };

  } catch (error) {
    console.error('❌ Erreur lors du nettoyage:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

/**
 * Programmer le nettoyage automatique
 */
const scheduleCleanup = () => {
  // Nettoyer toutes les heures
  setInterval(cleanupExpiredData, 60 * 60 * 1000);
  
  // Premier nettoyage après 5 minutes
  setTimeout(cleanupExpiredData, 5 * 60 * 1000);
  
  console.log('⏰ Nettoyage automatique programmé (toutes les heures)');
};

module.exports = {
  initializeApp,
  cleanupExpiredData,
  scheduleCleanup
};