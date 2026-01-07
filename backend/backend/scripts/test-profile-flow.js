require('dotenv').config();
const request = require('supertest');
const app = require('../src/app');
const { db } = require('../src/config/database');
const { users } = require('../src/db/schema');
const { eq } = require('drizzle-orm');
const jwt = require('jsonwebtoken');

async function testProfileFlow() {
  try {
    console.log('🧪 Test du flux complet de modification du profil...');

    // Trouver l'utilisateur sheispinked
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.email, 'sheispinked@gmail.com'))
      .limit(1);

    if (!user) {
      console.log('❌ Utilisateur sheispinked@gmail.com non trouvé.');
      process.exit(1);
    }

    console.log(`👤 Utilisateur: ${user.firstName} ${user.lastName}`);

    // Créer un token JWT
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

    // 1. Récupérer le profil actuel
    console.log('\n🔍 1. Récupération du profil actuel...');
    const profileResponse = await request(app)
      .get('/api/auth/profile')
      .set('Authorization', `Bearer ${token}`);

    console.log('📊 Status:', profileResponse.status);
    if (profileResponse.status === 200) {
      const currentProfile = profileResponse.body.data.user;
      console.log('✅ Profil actuel:');
      console.log(`   Prénom: ${currentProfile.firstName}`);
      console.log(`   Nom: ${currentProfile.lastName}`);
      console.log(`   Téléphone: ${currentProfile.phone}`);
      console.log(`   Date naissance: ${currentProfile.dateNaissance}`);

      // 2. Modifier le profil avec de nouvelles données
      console.log('\n🔍 2. Modification du profil...');
      const newData = {
        firstName: currentProfile.firstName, // Garder le même prénom
        lastName: currentProfile.lastName,   // Garder le même nom
        phone: '676436979', // Téléphone existant
        dateNaissance: currentProfile.dateNaissance // Garder la même date
      };

      const updateResponse = await request(app)
        .put('/api/auth/profile')
        .set('Authorization', `Bearer ${token}`)
        .send(newData);

      console.log('📊 Status mise à jour:', updateResponse.status);
      if (updateResponse.status === 200) {
        console.log('✅ Mise à jour réussie');
        const updatedProfile = updateResponse.body.data.user;
        console.log('📋 Profil mis à jour:');
        console.log(`   Prénom: ${updatedProfile.firstName}`);
        console.log(`   Nom: ${updatedProfile.lastName}`);
        console.log(`   Téléphone: ${updatedProfile.phone}`);
        console.log(`   Date naissance: ${updatedProfile.dateNaissance}`);

        // 3. Vérifier que les données sont bien sauvegardées
        console.log('\n🔍 3. Vérification en base de données...');
        const [verifyUser] = await db
          .select()
          .from(users)
          .where(eq(users.id, user.id))
          .limit(1);

        console.log('📋 Données en base:');
        console.log(`   Prénom: ${verifyUser.firstName}`);
        console.log(`   Nom: ${verifyUser.lastName}`);
        console.log(`   Téléphone: ${verifyUser.phone}`);
        console.log(`   Date naissance: ${verifyUser.dateNaissance}`);
        console.log(`   Dernière modification: ${verifyUser.updatedAt}`);

        // 4. Récupérer à nouveau le profil pour vérifier la cohérence
        console.log('\n🔍 4. Nouvelle récupération du profil...');
        const finalResponse = await request(app)
          .get('/api/auth/profile')
          .set('Authorization', `Bearer ${token}`);

        if (finalResponse.status === 200) {
          const finalProfile = finalResponse.body.data.user;
          console.log('✅ Profil final:');
          console.log(`   Prénom: ${finalProfile.firstName}`);
          console.log(`   Nom: ${finalProfile.lastName}`);
          console.log(`   Téléphone: ${finalProfile.phone}`);
          console.log(`   Date naissance: ${finalProfile.dateNaissance}`);
        }
      } else {
        console.log('❌ Erreur mise à jour:', updateResponse.body);
      }
    } else {
      console.log('❌ Erreur récupération profil:', profileResponse.body);
    }

    console.log('\n✅ Test terminé');
    process.exit(0);

  } catch (error) {
    console.error('❌ Erreur:', error.message);
    process.exit(1);
  }
}

testProfileFlow();