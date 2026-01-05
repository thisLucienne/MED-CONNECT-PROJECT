const AdminService = require('../services/adminService');
const { testConnection } = require('../config/database');
const { testCloudinaryConnection } = require('../config/cloudinary');
const { testEmailConnection } = require('../config/email');

/**
 * Initialiser l'application au démarrage (VERSION TEMPORAIRE SANS DB)
 */
const initializeApp = async () => {
  console.log('🚀 Initialisation de l\'application (MODE SANS DB)...');

  try {
    // 1. Tester la connexion à la base de données (OPTIONNEL)
    console.log('📊 Test de la connexion à la base de données...');
    try {
      const dbConnected = await testConnection();
      if (dbConnected) {
        console.log('✅ Base de données connectée !');
        
        // 2. Créer l'administrateur par défaut
        console.log('👤 Création de l\'administrateur par défaut...');
        const adminResult = await AdminService.createDefaultAdmin();
        
        if (!adminResult.success) {
          console.warn('⚠️  Erreur création admin:', adminResult.error);
        }
      } else {
        console.log('⚠️  Base de données non disponible - Mode API uniquement');
      }
    } catch (error) {
      console.log('⚠️  Base de données non disponible - Mode API uniquement');
      console.log('   Les endpoints fonctionneront mais sans persistance des données');
    }

    // 3. Tester la connexion Cloudinary (optionnel)
    if (process.env.CLOUDINARY_CLOUD_NAME) {
      console.log('☁️  Test de la connexion Cloudinary...');
      try {
        await testCloudinaryConnection();
      } catch (error) {
        console.log('⚠️  Cloudinary non disponible - Upload d\'images désactivé');
      }
    } else {
      console.log('⚠️  Configuration Cloudinary manquante - Upload d\'images désactivé');
    }

    // 4. Tester la connexion email (optionnel)
    if (process.env.EMAIL_USER) {
      console.log('📧 Test de la connexion email...');
      try {
        await testEmailConnection();
      } catch (error) {
        console.log('⚠️  Email non disponible - Envoi d\'emails désactivé');
      }
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
    console.log('🌐 API disponible sur: http://localhost:' + (process.env.PORT || 5000));
    console.log('📚 Documentation: http://localhost:' + (process.env.PORT || 5000) + '/api-docs');
    console.log('');

    return {
      success: true,
      message: 'Application initialisée avec succès (mode sans DB)'
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
    // Skip cleanup si pas de DB
    console.log('⚠️  Nettoyage ignoré - Base de données non disponible');
    return {
      success: true,
      cleaned: {
        twoFactorCodes: 0,
        refreshTokens: 0
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
  console.log('⏰ Nettoyage automatique désactivé (mode sans DB)');
};

module.exports = {
  initializeApp,
  cleanupExpiredData,
  scheduleCleanup
};