require('dotenv').config();
const { db } = require('../src/config/database');
const { users } = require('../src/db/schema');
const { eq, desc } = require('drizzle-orm');

async function checkRecentUpdates() {
  try {
    console.log('🔍 Vérification des mises à jour récentes...');

    // Récupérer les utilisateurs récemment modifiés
    const recentUsers = await db
      .select()
      .from(users)
      .orderBy(desc(users.updatedAt))
      .limit(5);

    console.log('📋 Utilisateurs récemment modifiés:');
    recentUsers.forEach((user, index) => {
      console.log(`\n${index + 1}. ${user.firstName} ${user.lastName}`);
      console.log(`   Email: ${user.email}`);
      console.log(`   Téléphone: ${user.phone || 'Non renseigné'}`);
      console.log(`   Date naissance: ${user.dateNaissance || 'Non renseignée'}`);
      console.log(`   Modifié le: ${user.updatedAt}`);
    });

    // Vérifier spécifiquement l'utilisateur sheispinked
    const [sheispinkedUser] = await db
      .select()
      .from(users)
      .where(eq(users.email, 'sheispinked@gmail.com'))
      .limit(1);

    if (sheispinkedUser) {
      console.log('\n👤 Données actuelles de sheispinked@gmail.com:');
      console.log(`   Prénom: ${sheispinkedUser.firstName}`);
      console.log(`   Nom: ${sheispinkedUser.lastName}`);
      console.log(`   Téléphone: ${sheispinkedUser.phone || 'Non renseigné'}`);
      console.log(`   Date naissance: ${sheispinkedUser.dateNaissance || 'Non renseignée'}`);
      console.log(`   Dernière modification: ${sheispinkedUser.updatedAt}`);
    }

    console.log('\n✅ Vérification terminée');
    process.exit(0);

  } catch (error) {
    console.error('❌ Erreur:', error);
    process.exit(1);
  }
}

checkRecentUpdates();