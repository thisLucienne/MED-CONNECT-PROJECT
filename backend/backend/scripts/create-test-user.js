require('dotenv').config();
const { db } = require('../src/config/database');
const { users } = require('../src/db/schema');
const CryptoUtils = require('../src/utils/crypto');
const { eq } = require('drizzle-orm');

async function createTestUser() {
  try {
    console.log('👤 Création d\'un utilisateur de test...');

    const testEmail = 'patient.test@medconnect.com';
    const testPassword = 'Test123!';

    // Vérifier si l'utilisateur existe déjà
    const [existingUser] = await db
      .select()
      .from(users)
      .where(eq(users.email, testEmail))
      .limit(1);

    if (existingUser) {
      console.log('⚠️  Utilisateur de test existe déjà');
      console.log(`📧 Email: ${testEmail}`);
      console.log(`🔑 Mot de passe: ${testPassword}`);
      process.exit(0);
    }

    // Créer l'utilisateur
    const hashedPassword = await CryptoUtils.hashPassword(testPassword);

    const [newUser] = await db.insert(users).values({
      email: testEmail,
      password: hashedPassword,
      firstName: 'Patient',
      lastName: 'Test',
      role: 'PATIENT',
      status: 'ACTIVE',
      isVerified: true
    }).returning();

    console.log('✅ Utilisateur de test créé avec succès !');
    console.log(`📧 Email: ${testEmail}`);
    console.log(`🔑 Mot de passe: ${testPassword}`);
    console.log(`🆔 ID: ${newUser.id}`);

    process.exit(0);
  } catch (error) {
    console.error('❌ Erreur:', error);
    process.exit(1);
  }
}

createTestUser();