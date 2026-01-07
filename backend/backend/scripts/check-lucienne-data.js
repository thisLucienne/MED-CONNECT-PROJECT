require('dotenv').config();
const { db } = require('../src/config/database');
const { users } = require('../src/db/schema');
const { eq } = require('drizzle-orm');

async function checkLucienneData() {
  try {
    console.log('🔍 Vérification des données de Lucienne...');

    // Chercher l'utilisateur Lucienne
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.email, 'sheispinked@gmail.com'))
      .limit(1);

    if (!user) {
      console.log('❌ Utilisateur Lucienne non trouvé.');
      process.exit(1);
    }

    console.log('👤 Données complètes de Lucienne:');
    console.log(`   ID: ${user.id}`);
    console.log(`   Email: ${user.email}`);
    console.log(`   Prénom: "${user.firstName}"`);
    console.log(`   Nom: "${user.lastName}"`);
    console.log(`   Téléphone: "${user.phone}"`);
    console.log(`   Date naissance: "${user.dateNaissance}"`);
    console.log(`   Photo profil: "${user.profilePicture}"`);
    console.log(`   Rôle: ${user.role}`);
    console.log(`   Statut: ${user.status}`);
    console.log(`   Vérifié: ${user.isVerified}`);
    console.log(`   Créé le: ${user.createdAt}`);
    console.log(`   Modifié le: ${user.updatedAt}`);

    // Calculer l'âge si date de naissance présente
    if (user.dateNaissance) {
      const birthDate = new Date(user.dateNaissance);
      const today = new Date();
      let age = today.getFullYear() - birthDate.getFullYear();
      const monthDiff = today.getMonth() - birthDate.getMonth();
      
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        age--;
      }
      
      console.log(`   Âge calculé: ${age} ans`);
    } else {
      console.log('   ⚠️  Date de naissance manquante !');
    }

    // Vérifier les champs vides
    const emptyFields = [];
    if (!user.firstName) emptyFields.push('firstName');
    if (!user.lastName) emptyFields.push('lastName');
    if (!user.phone) emptyFields.push('phone');
    if (!user.dateNaissance) emptyFields.push('dateNaissance');

    if (emptyFields.length > 0) {
      console.log(`⚠️  Champs vides: ${emptyFields.join(', ')}`);
    } else {
      console.log('✅ Tous les champs principaux sont remplis');
    }

    console.log('\n✅ Vérification terminée');
    process.exit(0);

  } catch (error) {
    console.error('❌ Erreur:', error);
    process.exit(1);
  }
}

checkLucienneData();