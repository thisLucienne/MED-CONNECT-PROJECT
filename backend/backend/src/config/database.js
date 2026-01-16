const { drizzle } = require('drizzle-orm/postgres-js');
const postgres = require('postgres');
const schema = require('../db/schema');

// Configuration de la connexion PostgreSQL
const connectionString = `postgresql://${process.env.DB_USER}:${process.env.DB_PASSWORD}@${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_NAME}`;

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