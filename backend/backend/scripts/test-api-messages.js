require('dotenv').config();
const request = require('supertest');
const app = require('../src/app');
const { db } = require('../src/config/database');
const { users } = require('../src/db/schema');
const { eq } = require('drizzle-orm');
const jwt = require('jsonwebtoken');

async function testMessagesAPI() {
  try {
    console.log('🧪 Test de l\'API Messages...');

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

    // Tester l'endpoint des conversations
    const response = await request(app)
      .get('/api/messages/conversations')
      .set('Authorization', `Bearer ${token}`)
      .set('Content-Type', 'application/json');

    console.log('✅ Réponse API reçue');
    console.log('📊 Status:', response.status);
    console.log('📋 Data:', JSON.stringify(response.body, null, 2));

    if (response.body.success && response.body.data) {
      console.log(`📧 ${response.body.data.length} conversations trouvées`);
      
      response.body.data.forEach((conv, index) => {
        console.log(`  ${index + 1}. ${conv.participantName} (${conv.participantType})`);
        console.log(`     Dernier message: "${conv.lastMessage.substring(0, 50)}..."`);
        console.log(`     Messages non lus: ${conv.unreadCount}`);
      });
    }

    console.log('✅ Test API terminé');
    process.exit(0);

  } catch (error) {
    console.error('❌ Erreur API:', error.message);
    process.exit(1);
  }
}

testMessagesAPI();

testMessagesAPI();