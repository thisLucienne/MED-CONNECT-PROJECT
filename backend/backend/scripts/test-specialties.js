require('dotenv').config();

async function testSpecialties() {
  try {
    console.log('🧪 Test de l\'endpoint des spécialités...');

    // Test direct de la fonction du contrôleur
    const { db } = require('../src/config/database');
    const { users, doctors } = require('../src/db/schema');
    const { eq, and } = require('drizzle-orm');

    console.log('\n1. Test de la requête SQL directe...');
    
    const medecins = await db
      .select({
        specialty: doctors.specialty
      })
      .from(doctors)
      .innerJoin(users, eq(doctors.userId, users.id))
      .where(and(
        eq(users.role, 'DOCTOR'),
        eq(users.status, 'ACTIVE')
      ));

    console.log('✅ Requête SQL réussie, médecins trouvés:', medecins.length);

    // Extraire les spécialités uniques
    const specialitesSet = new Set();
    medecins.forEach(medecin => {
      if (medecin.specialty) {
        specialitesSet.add(medecin.specialty);
      }
    });

    const specialitesList = Array.from(specialitesSet).sort();
    console.log('✅ Spécialités extraites:', specialitesList);

    process.exit(0);
  } catch (error) {
    console.error('❌ Erreur:', error);
    process.exit(1);
  }
}

testSpecialties();