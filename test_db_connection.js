require('dotenv').config();
const postgres = require('postgres');

const connectionString = `postgresql://${process.env.DB_USER}:${process.env.DB_PASSWORD}@${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_NAME}`;

console.log('🔍 Test de connexion à la base de données...');
console.log('📋 Configuration:');
console.log(`   Host: ${process.env.DB_HOST}`);
console.log(`   Port: ${process.env.DB_PORT}`);
console.log(`   Database: ${process.env.DB_NAME}`);
console.log(`   User: ${process.env.DB_USER}`);
console.log(`   Password: ${process.env.DB_PASSWORD ? '***' : 'VIDE'}`);
console.log(`   Connection String: postgresql://${process.env.DB_USER}:***@${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_NAME}`);

const client = postgres(connectionString, {
  ssl: false
});

async function testConnection() {
  try {
    console.log('\n🔄 Tentative de connexion...');
    const result = await client`SELECT version()`;
    console.log('✅ Connexion réussie !');
    console.log('📊 Version PostgreSQL:', result[0].version);
    
    // Test de la base de données med_connect
    const dbTest = await client`SELECT current_database()`;
    console.log('🗄️  Base de données actuelle:', dbTest[0].current_database);
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Erreur de connexion:', error.message);
    console.error('🔍 Code d\'erreur:', error.code);
    
    if (error.code === '28P01') {
      console.error('💡 Suggestion: Vérifiez le mot de passe de l\'utilisateur postgres');
    } else if (error.code === '3D000') {
      console.error('💡 Suggestion: La base de données med_connect n\'existe pas');
    } else if (error.code === 'ECONNREFUSED') {
      console.error('💡 Suggestion: PostgreSQL n\'est pas démarré ou n\'écoute pas sur le port 5432');
    }
    
    process.exit(1);
  }
}

testConnection();