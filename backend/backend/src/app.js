const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./config/swagger');
const { testConnection } = require('./config/database');

// Import des routes
const authRoutes = require('./routes/auth');
const adminRoutes = require('./routes/admin');
const messageRoutes = require('./routes/messages');
const notificationRoutes = require('./routes/notifications');
const dossierRoutes = require('./routes/dossiers');
const uploadRoutes = require('./routes/upload');
const connexionRoutes = require('./routes/connexions');
const santeRoutes = require('./routes/sante');
const rendezVousRoutes = require('./routes/rendezVous');

const app = express();

// Rate limiting global
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limite chaque IP à 100 requêtes par windowMs
  message: {
    success: false,
    error: {
      code: 'RATE_LIMIT_EXCEEDED',
      message: 'Trop de requêtes, réessayez plus tard'
    }
  },
  standardHeaders: true,
  legacyHeaders: false
});

// Configuration CORS
// Accepte toutes les origines (pour le développement et la flexibilité)
// Supporte également les applications mobiles (Expo/React Native) qui n'envoient pas d'en-tête Origin
const corsOptions = {
  origin: (origin, callback) => {
    const nodeEnv = process.env.NODE_ENV || 'development';
    
    // Log pour le débogage (seulement en développement ou si DEBUG_CORS est activé)
    if (nodeEnv === 'development' || process.env.DEBUG_CORS === 'true') {
      console.log(`🌐 CORS: Requête depuis l'origine: ${origin || '(aucune - app mobile)'}`);
    }
    
    // Accepter toutes les origines
    // Autoriser les requêtes sans origine (applications mobiles Expo/React Native, Postman, curl, etc.)
    if (nodeEnv === 'development' || process.env.DEBUG_CORS === 'true') {
      console.log('✅ CORS: Origine autorisée (toutes les origines acceptées)');
    }
    callback(null, true);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'X-API-Key'],
  exposedHeaders: ['Authorization'],
  maxAge: 86400, // 24 heures
  preflightContinue: false,
  optionsSuccessStatus: 204
};

// Middlewares de base
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" },
  crossOriginEmbedderPolicy: false,
  contentSecurityPolicy: false // Désactiver pour Swagger UI
}));
app.use(cors(corsOptions));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(limiter);

// Documentation Swagger
try {
  app.use('/api-docs', swaggerUi.serve);
  app.get('/api-docs', swaggerUi.setup(swaggerSpec, {
    customCss: '.swagger-ui .topbar { display: none }',
    customSiteTitle: 'Med Connect API Documentation',
    customfavIcon: '/favicon.ico',
    explorer: true,
    swaggerOptions: {
      persistAuthorization: true,
      displayRequestDuration: true,
      filter: true,
      tryItOutEnabled: true,
      url: '/api-docs.json'
    }
  }));
  
  console.log('✅ Documentation Swagger disponible sur /api-docs');
  console.log(`📋 ${Object.keys(swaggerSpec.paths || {}).length} endpoints documentés`);
} catch (error) {
  console.error('❌ Erreur lors de l\'initialisation de Swagger:', error);
  console.error(error.stack);
}

// Route pour obtenir le JSON Swagger
app.get('/api-docs.json', (req, res) => {
  try {
    res.setHeader('Content-Type', 'application/json');
    res.send(swaggerSpec);
  } catch (error) {
    res.status(500).json({
      success: false,
      error: {
        message: 'Erreur lors du chargement de la documentation Swagger',
        details: error.message
      }
    });
  }
});

// Routes API
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/dossiers', dossierRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/connexions', connexionRoutes);
app.use('/api/sante', santeRoutes);
app.use('/api/rendez-vous', rendezVousRoutes);

// Route de base
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Med Connect API - Serveur démarré avec succès',
    version: '1.0.0',
    status: 'running',
    documentation: {
      swagger: '/api-docs',
      swaggerJson: '/api-docs.json'
    },
    endpoints: {
      auth: '/api/auth',
      admin: '/api/admin',
      messages: '/api/messages',
      notifications: '/api/notifications',
      dossiers: '/api/dossiers',
      upload: '/api/upload',
      connexions: '/api/connexions',
      sante: '/api/sante',
      rendezVous: '/api/rendez-vous',
      health: '/health'
    }
  });
});

// Route de santé
app.get('/health', async (req, res) => {
  try {
    const dbConnected = await testConnection();
    
    const healthStatus = {
      success: true,
      timestamp: new Date().toISOString(),
      status: dbConnected ? 'healthy' : 'degraded',
      services: {
        server: {
          status: 'running',
          uptime: process.uptime(),
          memory: process.memoryUsage(),
          version: process.version
        },
        database: {
          status: dbConnected ? 'connected' : 'disconnected',
          type: 'PostgreSQL'
        },
        environment: process.env.NODE_ENV || 'development'
      }
    };

    const statusCode = dbConnected ? 200 : 503;
    res.status(statusCode).json(healthStatus);

  } catch (error) {
    res.status(503).json({
      success: false,
      status: 'error',
      timestamp: new Date().toISOString(),
      error: {
        message: 'Erreur lors de la vérification de santé',
        details: error.message
      }
    });
  }
});

// Middleware pour les routes non trouvées
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    error: {
      code: 'ROUTE_NOT_FOUND',
      message: 'Route non trouvée',
      path: req.originalUrl,
      method: req.method
    }
  });
});

// Middleware de gestion d'erreurs global
app.use((err, req, res, next) => {
  console.error('Erreur serveur:', err);

  // Erreur CORS - s'assurer que les en-têtes CORS sont présents même en cas d'erreur
  if (err.message === 'Non autorisé par CORS' || err.message === 'Requêtes sans origine non autorisées en production') {
    const origin = req.headers.origin;
    
    // Accepter toutes les origines
    if (origin) {
      res.setHeader('Access-Control-Allow-Origin', origin);
    }
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    
    return res.status(403).json({
      success: false,
      error: {
        code: 'CORS_ERROR',
        message: err.message
      }
    });
  }

  // Erreur de validation JSON
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    return res.status(400).json({
      success: false,
      error: {
        code: 'INVALID_JSON',
        message: 'Format JSON invalide'
      }
    });
  }

  // Erreur de taille de payload
  if (err.code === 'LIMIT_FILE_SIZE') {
    return res.status(413).json({
      success: false,
      error: {
        code: 'FILE_TOO_LARGE',
        message: 'Fichier trop volumineux'
      }
    });
  }

  // Erreur générique
  res.status(500).json({
    success: false,
    error: {
      code: 'INTERNAL_ERROR',
      message: 'Erreur interne du serveur'
    }
  });
});

module.exports = app;