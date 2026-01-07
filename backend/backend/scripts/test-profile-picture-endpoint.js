require('dotenv').config();
const request = require('supertest');
const app = require('../src/app');
const { db } = require('../src/config/database');
const { users } = require('../src/db/schema');
const { eq } = require('drizzle-orm');
const jwt = require('jsonwebtoken');
const fs = require('fs');
const path = require('path');

async function testProfilePictureEndpoint() {
  try {
    console.log('🧪 Test de l\'endpoint upload photo de profil...');

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

    // Créer une image de test simple (1x1 pixel PNG)
    const testImageBuffer = Buffer.from([
      0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A, 0x00, 0x00, 0x00, 0x0D,
      0x49, 0x48, 0x44, 0x52, 0x00, 0x00, 0x00, 0x01, 0x00, 0x00, 0x00, 0x01,
      0x08, 0x02, 0x00, 0x00, 0x00, 0x90, 0x77, 0x53, 0xDE, 0x00, 0x00, 0x00,
      0x0C, 0x49, 0x44, 0x41, 0x54, 0x08, 0x99, 0x01, 0x01, 0x00, 0x00, 0x00,
      0xFF, 0xFF, 0x00, 0x00, 0x00, 0x02, 0x00, 0x01, 0xE2, 0x21, 0xBC, 0x33,
      0x00, 0x00, 0x00, 0x00, 0x49, 0x45, 0x4E, 0x44, 0xAE, 0x42, 0x60, 0x82
    ]);

    console.log('🔍 Test endpoint POST /api/upload/profile-picture...');

    const response = await request(app)
      .post('/api/upload/profile-picture')
      .set('Authorization', `Bearer ${token}`)
      .attach('profilePicture', testImageBuffer, 'test-profile.png');

    console.log('📊 Status:', response.status);
    console.log('📋 Response:', JSON.stringify(response.body, null, 2));

    if (response.status === 200) {
      console.log('✅ Upload de photo de profil réussi !');
      
      // Vérifier que l'URL a été mise à jour dans la base
      const [updatedUser] = await db
        .select()
        .from(users)
        .where(eq(users.id, patient.id))
        .limit(1);
      
      console.log('📋 URL photo de profil en base:', updatedUser.profilePicture);
    } else {
      console.log('❌ Erreur lors de l\'upload de la photo de profil');
    }

    console.log('✅ Test terminé');
    process.exit(0);

  } catch (error) {
    console.error('❌ Erreur:', error.message);
    process.exit(1);
  }
}

testProfilePictureEndpoint();