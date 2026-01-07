require('dotenv').config();
const request = require('supertest');
const app = require('../src/app');
const { db } = require('../src/config/database');
const { users } = require('../src/db/schema');
const { eq } = require('drizzle-orm');
const jwt = require('jsonwebtoken');

async function verifyUserFix() {
  try {
    console.log('🧪 Vérification des données utilisateur corrigées...');

    // Trouver l'utilisateur sheispinked
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.email, 'sheispinked@gmail.com'))
      .limit(1);

    if (!user) {
      console.log('❌ Utilisateur non trouvé.');
      process.exit(1);
    }

    console.log(`👤 Utilisateur: ${user.firstName} ${user.lastName} (${user.email})`);

    // Créer un token JWT pour cet utilisateur
    const token = jwt.sign(
      { 
        userId: user.id, 
        email: user.email, 
        role: user.role,
        type: 'access',
        jti: 'test-' + Date.now()
      },
      process.env.JWT_SECRET || 'your-secret-key',
      { 
        expiresIn: '1h',
        issuer: 'med-connect',
        audience: 'med-connect-users'
      }
    );

    // Tester l'endpoint du profil
    console.log('🔍 Test endpoint /api/auth/profile...');
    const response = await request(app)
      .get('/api/auth/profile')
      .set('Authorization', `Bearer ${token}`)
      .set('Content-Type', 'application/json');

    console.log('📊 Status:', response.status);
    
    if (response.status === 200) {
      const userData = response.body.data.user;
      console.log('✅ Données du profil:');
      console.log(`  Prénom: ${userData.firstName}`);
      console.log(`  Nom: ${userData.lastName}`);
      console.log(`  Email: ${userData.email}`);
      console.log(`  Téléphone: ${userData.phone}`);
      console.log(`  Date naissance: ${userData.dateNaissance}`);
    } else {
      console.log('❌ Erreur:', response.body);
    }

    console.log('✅ Vérification terminée');
    process.exit(0);

  } catch (error) {
    console.error('❌ Erreur:', error.message);
    process.exit(1);
  }
}

verifyUserFix();