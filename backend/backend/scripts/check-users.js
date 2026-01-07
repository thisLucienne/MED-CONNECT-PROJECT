require('dotenv').config();
const { db } = require('../src/config/database');
const { users } = require('../src/db/schema');
const { eq } = require('drizzle-orm');

async function checkUsers() {
  try {
    console.log('👥 Vérification des utilisateurs...');

    // Récupérer tous les utilisateurs
    const allUsers = await db.select().from(users);
    
    console.log(`\n📊 Total utilisateurs: ${allUsers.length}`);
    
    allUsers.forEach(user => {
      console.log(`- ${user.firstName} ${user.lastName} (${user.email}) - ${user.role}`);
    });

    // Trouver un patient pour les tests
    const patients = allUsers.filter(u => u.role === 'PATIENT');
    if (patients.length > 0) {
      console.log(`\n🧪 Patient de test disponible: ${patients[0].email}`);
    } else {
      console.log('\n❌ Aucun patient trouvé pour les tests');
    }

    process.exit(0);
  } catch (error) {
    console.error('❌ Erreur:', error);
    process.exit(1);
  }
}

checkUsers();