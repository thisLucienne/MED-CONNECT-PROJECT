require('dotenv').config();
const app = require('./src/app');
const { initializeApp, scheduleCleanup } = require('./src/utils/initializeApp');
const socketService = require('./src/services/socketService');

const PORT = process.env.PORT || 5000;

// Gestion des erreurs non capturées
process.on('uncaughtException', (error) => {
  console.error('❌ Erreur non capturée:', error);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Promesse rejetée non gérée:', reason);
  process.exit(1);
});

// Fonction de démarrage asynchrone
const startServer = async () => {
  try {
    // Initialiser l'application
    const initResult = await initializeApp();
    
    if (!initResult.success) {
      console.error('❌ Échec de l\'initialisation:', initResult.error);
      process.exit(1);
    }

    // Démarrer le serveur HTTP
    const server = app.listen(PORT, () => {
      console.log(`🚀 Serveur Med Connect démarré avec succès !`);
      console.log(`📍 Environnement: ${process.env.NODE_ENV || 'development'}`);
      console.log(`🌐 URL: http://localhost:${PORT}`);
      console.log(`📚 API Documentation: http://localhost:${PORT}/`);
      console.log('');
    });

    // Initialiser Socket.IO
    socketService.initialize(server);

    // Programmer le nettoyage automatique
    scheduleCleanup();

    // Gestion de l'arrêt propre du serveur
    const gracefulShutdown = (signal) => {
      console.log(`🛑 Signal ${signal} reçu, arrêt du serveur...`);
      
      server.close(async () => {
        console.log('🔄 Fermeture des connexions...');
        
        try {
          // Ici on pourrait fermer les connexions DB, Redis, etc.
          console.log('✅ Serveur arrêté proprement');
          process.exit(0);
        } catch (error) {
          console.error('❌ Erreur lors de l\'arrêt:', error);
          process.exit(1);
        }
      });

      // Forcer l'arrêt après 10 secondes
      setTimeout(() => {
        console.error('⏰ Arrêt forcé après timeout');
        process.exit(1);
      }, 10000);
    };

    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
    process.on('SIGINT', () => gracefulShutdown('SIGINT'));

    return server;

  } catch (error) {
    console.error('❌ Erreur lors du démarrage du serveur:', error);
    process.exit(1);
  }
};

// Démarrer le serveur
startServer();
