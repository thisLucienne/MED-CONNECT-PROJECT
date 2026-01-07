require('dotenv').config();
const { db } = require('../src/config/database');
const { users } = require('../src/db/schema');
const { eq } = require('drizzle-orm');

async function addBirthDates() {
  try {
    console.log('📅 Ajout des dates de naissance aux utilisateurs...');

    // Récupérer tous les utilisateurs
    const allUsers = await db.select().from(users);
    console.log(`👥 ${allUsers.length} utilisateurs trouvés`);

    // Générer des dates de naissance réalistes
    const generateBirthDate = (role) => {
      const now = new Date();
      let minAge, maxAge;
      
      switch (role) {
        case 'DOCTOR':
          minAge = 28; // Minimum pour finir médecine
          maxAge = 65;
          break;
        case 'PATIENT':
          minAge = 18;
          maxAge = 80;
          break;
        case 'ADMIN':
          minAge = 25;
          maxAge = 60;
          break;
        default:
          minAge = 18;
          maxAge = 70;
      }
      
      const age = Math.floor(Math.random() * (maxAge - minAge + 1)) + minAge;
      const birthYear = now.getFullYear() - age;
      const birthMonth = Math.floor(Math.random() * 12); // 0-11
      const birthDay = Math.floor(Math.random() * 28) + 1; // 1-28 pour éviter les problèmes de mois
      
      return new Date(birthYear, birthMonth, birthDay);
    };

    // Mettre à jour chaque utilisateur
    for (const user of allUsers) {
      if (!user.dateNaissance) {
        const birthDate = generateBirthDate(user.role);
        
        await db
          .update(users)
          .set({ 
            dateNaissance: birthDate.toISOString().split('T')[0] // Format YYYY-MM-DD
          })
          .where(eq(users.id, user.id));
        
        const age = new Date().getFullYear() - birthDate.getFullYear();
        console.log(`✅ ${user.firstName} ${user.lastName} (${user.role}): ${age} ans (né le ${birthDate.toLocaleDateString('fr-FR')})`);
      }
    }

    console.log('🎉 Dates de naissance ajoutées avec succès !');
    process.exit(0);

  } catch (error) {
    console.error('❌ Erreur lors de l\'ajout des dates de naissance:', error);
    process.exit(1);
  }
}

addBirthDates();