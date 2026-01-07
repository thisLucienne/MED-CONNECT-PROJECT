require('dotenv').config();
const { db } = require('../src/config/database');
const { users } = require('../src/db/schema');
const { eq } = require('drizzle-orm');

async function checkUserData() {
  try {
    console.log('🔍 Vérification des données utilisateur...');

    // Chercher l'utilisateur avec l'email sheispinked@gmail.com
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.email, 'sheispinked@gmail.com'))
      .limit(1);

    if (!user) {
      console.log('❌ Utilisateur avec email sheispinked@gmail.com non trouvé.');
      process.exit(1);
    }

    console.log('👤 Données utilisateur actuelles:');
    console.log(`  ID: ${user.id}`);
    console.log(`  Email: ${user.email}`);
    console.log(`  Prénom: ${user.firstName}`);
    console.log(`  Nom: ${user.lastName}`);
    console.log(`  Téléphone: ${user.phone}`);
    console.log(`  Date naissance: ${user.dateNaissance}`);
    console.log(`  Rôle: ${user.role}`);
    console.log(`  Statut: ${user.status}`);
    console.log(`  Créé le: ${user.createdAt}`);
    console.log(`  Modifié le: ${user.updatedAt}`);

    // Restaurer les bonnes données
    console.log('\n🔄 Restauration des données correctes...');
    
    const correctData = {
      firstName: 'Lucienne',
      lastName: 'Monac',
      phone: '676436979',
      updatedAt: new Date()
    };

    const result = await db
      .update(users)
      .set(correctData)
      .where(eq(users.id, user.id))
      .returning();

    if (result.length > 0) {
      console.log('✅ Données restaurées avec succès:');
      console.log(`  Prénom: ${result[0].firstName}`);
      console.log(`  Nom: ${result[0].lastName}`);
      console.log(`  Téléphone: ${result[0].phone}`);
    }

    console.log('✅ Vérification terminée');
    process.exit(0);

  } catch (error) {
    console.error('❌ Erreur:', error);
    process.exit(1);
  }
}

checkUserData();