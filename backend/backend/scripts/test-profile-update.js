require('dotenv').config();
const request = require('supertest');
const app = require('../src/app');
const { db } = require('../src/config/database');
const { users } = require('../src/db/schema');
const { eq } = require('drizzle-orm');
const jwt = require('jsonwebtoken');

async function testProfileUpdate() {
  try {
    console.log('🧪 Test de mise à jour du profil...');

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

    // Données de test pour la mise à jour
    const updateData = {
      firstName: 'Jean Updated',
      lastName: 'Dupont Updated',
      phone: '6 99 88 77 66',
      dateNaissance: '1985-05-15'
    };

    console.log('🔍 Test endpoint PUT /api/auth/profile...');
    console.log('📋 Données à envoyer:', JSON.stringify(updateData, null, 2));

    const response = await request(app)
      .put('/api/auth/profile')
      .set('Authorization', `Bearer ${token}`)
      .set('Content-Type', 'application/json')
      .send(updateData);

    console.log('📊 Status:', response.status);
    console.log('📋 Response:', JSON.stringify(response.body, null, 2));

    if (response.status === 200) {
      console.log('✅ Mise à jour réussie !');
      
      // Vérifier les données dans la base
      const [updatedUser] = await db
        .select()
        .from(users)
        .where(eq(users.id, patient.id))
        .limit(1);
      
      console.log('📋 Données en base après mise à jour:');
      console.log(`  Prénom: ${updatedUser.firstName}`);
      console.log(`  Nom: ${updatedUser.lastName}`);
      console.log(`  Téléphone: ${updatedUser.phone}`);
      console.log(`  Date naissance: ${updatedUser.dateNaissance}`);
    } else {
      console.log('❌ Erreur lors de la mise à jour');
    }

    console.log('✅ Test terminé');
    process.exit(0);

  } catch (error) {
    console.error('❌ Erreur:', error.message);
    if (error.response) {
      console.error('Response data:', error.response.data);
    }
    process.exit(1);
  }
}

testProfileUpdate();