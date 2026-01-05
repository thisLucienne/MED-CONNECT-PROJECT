const { drizzle } = require('drizzle-orm/postgres-js');
const postgres = require('postgres');
const schema = require('../db/schema');

// Configuration de la connexion PostgreSQL - TEMPORAIRE POUR DEBUG
const DB_CONFIG = {
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || '5432',
  database: process.env.DB_NAME || 'med_connect',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || '4096'
};

console.log('🔍 Configuration DB utilisée:', {
  host: DB_CONFIG.host,
  port: DB_CONFIG.port,
  database: DB_CONFIG.database,
  user: DB_CONFIG.user,
  password: DB_CONFIG.password ? '***' : 'VIDE'
});

const connectionString = `postgresql://${DB_CONFIG.user}:${DB_CONFIG.password}@${DB_CONFIG.host}:${DB_CONFIG.port}/${DB_CONFIG.database}`;

// Créer la connexion PostgreSQL avec configuration SSL
// Désactiver SSL pour les connexions Docker (même en production)
// SSL devrait être géré par le reverse proxy (Nginx) en production réelle
const useSSL = process.env.DB_USE_SSL === 'true' && process.env.DB_HOST !== 'postgres';
const client = postgres(connectionString, {
  ssl: useSSL ? { rejectUnauthorized: false } : false
});

// Initialiser Drizzle avec le schéma
const db = drizzle(client, { schema });

// Fonction pour tester la connexion à la base de données
const testConnection = async () => {
  try {
    await client`SELECT 1`;
    console.log('✅ Connexion à la base de données réussie (Drizzle)');
    return true;
  } catch (error) {
    console.error('❌ Erreur de connexion à la base de données:', error.message);
    return false;
  }
};

module.exports = {
  db,
  client,
  testConnection
};