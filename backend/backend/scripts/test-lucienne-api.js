require('dotenv').config();
const request = require('supertest');
const app = require('../src/app');
const jwt = require('jsonwebtoken');

async function testLucienneAPI() {
  try {
    console.log('🧪 Test API pour Lucienne...');

    // Créer un token JWT pour Lucienne
    const token = jwt.sign(
      { 
        userId: '9400aeb7-ba61-48d8-afbc-7fa935e8eb7f', 
        email: 'sheispinked@gmail.com', 
        role: 'PATIENT',
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

    console.log('🔍 Test endpoint /api/auth/profile...');
    const response = await request(app)
      .get('/api/auth/profile')
      .set('Authorization', `Bearer ${token}`)
      .set('Content-Type', 'application/json');

    console.log('📊 Status:', response.status);
    
    if (response.status === 200) {
      console.log('✅ Réponse API complète:');
      console.log(JSON.stringify(response.body, null, 2));
      
      const userData = response.body.data.user;
      console.log('\n📋 Données utilisateur extraites:');
      console.log(`   Prénom: "${userData.firstName}"`);
      console.log(`   Nom: "${userData.lastName}"`);
      console.log(`   Email: "${userData.email}"`);
      console.log(`   Téléphone: "${userData.phone}"`);
      console.log(`   Date naissance: "${userData.dateNaissance}"`);
      console.log(`   Photo profil: "${userData.profilePicture}"`);
      console.log(`   Vérifié: ${userData.isVerified}`);
      console.log(`   Créé le: "${userData.createdAt}"`);
      
      // Calculer l'âge
      if (userData.dateNaissance) {
        const birthDate = new Date(userData.dateNaissance);
        const today = new Date();
        let age = today.getFullYear() - birthDate.getFullYear();
        const monthDiff = today.getMonth() - birthDate.getMonth();
        
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
          age--;
        }
        
        console.log(`   Âge calculé: ${age} ans`);
      } else {
        console.log('   ⚠️  Date de naissance manquante dans l\'API !');
      }
    } else {
      console.log('❌ Erreur API:', response.body);
    }

    console.log('\n✅ Test terminé');
    process.exit(0);

  } catch (error) {
    console.error('❌ Erreur:', error.message);
    process.exit(1);
  }
}

testLucienneAPI();