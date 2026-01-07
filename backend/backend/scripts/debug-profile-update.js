require('dotenv').config();
const { db } = require('../src/config/database');
const { users } = require('../src/db/schema');
const { eq } = require('drizzle-orm');

async function debugProfileUpdate() {
  try {
    console.log('🔍 Debug mise à jour profil...');

    // Trouver un utilisateur
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.role, 'PATIENT'))
      .limit(1);

    if (!user) {
      console.log('❌ Aucun utilisateur trouvé.');
      process.exit(1);
    }

    console.log(`👤 Utilisateur: ${user.firstName} ${user.lastName}`);
    console.log(`📅 Date naissance actuelle: ${user.dateNaissance}`);

    // Essayer de mettre à jour directement la date de naissance
    const newBirthDate = '1985-05-15';
    console.log(`🔄 Mise à jour vers: ${newBirthDate}`);

    const result = await db
      .update(users)
      .set({ 
        dateNaissance: newBirthDate,
        updatedAt: new Date()
      })
      .where(eq(users.id, user.id))
      .returning();

    if (result.length > 0) {
      console.log('✅ Mise à jour directe réussie');
      console.log(`📅 Nouvelle date: ${result[0].dateNaissance}`);
    } else {
      console.log('❌ Échec de la mise à jour directe');
    }

    // Vérifier dans la base
    const [updatedUser] = await db
      .select()
      .from(users)
      .where(eq(users.id, user.id))
      .limit(1);

    console.log(`📋 Vérification en base: ${updatedUser.dateNaissance}`);

    console.log('✅ Debug terminé');
    process.exit(0);

  } catch (error) {
    console.error('❌ Erreur:', error);
    process.exit(1);
  }
}

debugProfileUpdate();