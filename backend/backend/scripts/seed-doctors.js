require('dotenv').config();
const { db } = require('../src/config/database');
const { users, doctors } = require('../src/db/schema');
const CryptoUtils = require('../src/utils/crypto');
const { eq } = require('drizzle-orm');

async function seedDoctors() {
  try {
    console.log('🌱 Ajout de médecins de test...');

    // Médecins de test
    const testDoctors = [
      {
        email: 'dr.martin@medconnect.com',
        firstName: 'Jean',
        lastName: 'Martin',
        specialty: 'Cardiologie',
        licenseNumber: 'CARD001'
      },
      {
        email: 'dr.dubois@medconnect.com',
        firstName: 'Marie',
        lastName: 'Dubois',
        specialty: 'Dermatologie',
        licenseNumber: 'DERM001'
      },
      {
        email: 'dr.bernard@medconnect.com',
        firstName: 'Pierre',
        lastName: 'Bernard',
        specialty: 'Médecine générale',
        licenseNumber: 'GENE001'
      },
      {
        email: 'dr.moreau@medconnect.com',
        firstName: 'Sophie',
        lastName: 'Moreau',
        specialty: 'Pédiatrie',
        licenseNumber: 'PEDI001'
      },
      {
        email: 'dr.roux@medconnect.com',
        firstName: 'Antoine',
        lastName: 'Roux',
        specialty: 'Orthopédie',
        licenseNumber: 'ORTH001'
      }
    ];

    const hashedPassword = await CryptoUtils.hashPassword('password123');

    for (const doctorData of testDoctors) {
      // Vérifier si le médecin existe déjà
      const existingUser = await db
        .select()
        .from(users)
        .where(eq(users.email, doctorData.email))
        .limit(1);

      if (existingUser.length > 0) {
        console.log(`⚠️  Médecin ${doctorData.email} existe déjà`);
        continue;
      }

      // Créer l'utilisateur
      const [newUser] = await db.insert(users).values({
        email: doctorData.email,
        password: hashedPassword,
        firstName: doctorData.firstName,
        lastName: doctorData.lastName,
        role: 'DOCTOR',
        status: 'ACTIVE',
        isVerified: true
      }).returning();

      // Créer le profil médecin
      await db.insert(doctors).values({
        userId: newUser.id,
        specialty: doctorData.specialty,
        licenseNumber: doctorData.licenseNumber
      });

      console.log(`✅ Médecin créé: Dr. ${doctorData.firstName} ${doctorData.lastName} (${doctorData.specialty})`);
    }

    console.log('🎉 Médecins de test ajoutés avec succès !');
    process.exit(0);

  } catch (error) {
    console.error('❌ Erreur lors de l\'ajout des médecins:', error);
    process.exit(1);
  }
}

seedDoctors();