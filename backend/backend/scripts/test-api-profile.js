require('dotenv').config();
const request = require('supertest');
const app = require('../src/app');
const { db } = require('../src/config/database');
const { users } = require('../src/db/schema');
const { eq } = require('drizzle-orm');
const jwt = require('jsonwebtoken');

async function testProfileAPI() {
  try {
    console.log('🧪 Test de l\'API Profile...');

    // Trouver un patient
    const [patient] = await db
      .select()
      .from(users)
      .where(eq(users.role, 'PATIENT'))
      .limit(1);

    if (!patient) {
      console.log('❌ Aucun patient trouvé.');
      process.exit(1);
    }

    console.log(`👤 Patient: ${patient.firstName} ${patient.lastName}`);

    // Créer un token JWT pour le patient
    const token = jwt.sign(
      { 
        userId: patient.id, 
        email: patient.email, 
        role: patient.role,
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
    const profileResponse = await request(app)
      .get('/api/auth/profile')
      .set('Authorization', `Bearer ${token}`)
      .set('Content-Type', 'application/json');

    console.log('📊 Profile Status:', profileResponse.status);
    console.log('📋 Profile Data:', JSON.stringify(profileResponse.body, null, 2));

    // Tester l'endpoint des stats
    console.log('\n🔍 Test endpoint /api/auth/stats...');
    const statsResponse = await request(app)
      .get('/api/auth/stats')
      .set('Authorization', `Bearer ${token}`)
      .set('Content-Type', 'application/json');

    console.log('📊 Stats Status:', statsResponse.status);
    console.log('📋 Stats Data:', JSON.stringify(statsResponse.body, null, 2));

    console.log('✅ Test API terminé');
    process.exit(0);

  } catch (error) {
    console.error('❌ Erreur API:', error.message);
    process.exit(1);
  }
}

testProfileAPI();