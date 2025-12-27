require('dotenv').config();

// Désactiver SSL pour les connexions Docker (même en production)
// SSL devrait être géré par le reverse proxy (Nginx) en production réelle
const useSSL = process.env.DB_USE_SSL === 'true' && process.env.DB_HOST !== 'postgres';

module.exports = {
  schema: './src/db/schema.js',
  out: './src/db/migrations',
  dialect: 'postgresql',
  dbCredentials: {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    ssl: useSSL ? { rejectUnauthorized: false } : false
  },
};