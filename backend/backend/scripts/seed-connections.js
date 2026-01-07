require('dotenv').config();
const { db } = require('../src/config/database');
const { users, dossiersMedicaux, accesDossiers } = require('../src/db/schema');
const { eq, and } = require('drizzle-orm');

async function seedConnections() {
  try {
    console.log('🔗 Création de connexions de test...');

    // Trouver un patient de test
    const [patient] = await db
      .select()
      .from(users)
      .where(eq(users.role, 'PATIENT'))
      .limit(1);

    if (!patient) {
      console.log('❌ Aucun patient trouvé. Créez d\'abord un patient.');
      process.exit(1);
    }

    console.log(`👤 Patient trouvé: ${patient.firstName} ${patient.lastName}`);

    // Trouver les médecins
    const medecins = await db
      .select()
      .from(users)
      .where(eq(users.role, 'DOCTOR'))
      .limit(3);

    if (medecins.length === 0) {
      console.log('❌ Aucun médecin trouvé. Exécutez d\'abord seed-doctors.js');
      process.exit(1);
    }

    console.log(`👨‍⚕️ ${medecins.length} médecins trouvés`);

    // Créer un dossier médical de test pour le patient
    const [dossier] = await db.insert(dossiersMedicaux).values({
      idPatient: patient.id,
      titre: 'Dossier médical général',
      description: 'Dossier médical principal du patient',
      type: 'GENERAL'
    }).returning();

    console.log(`📁 Dossier médical créé: ${dossier.titre}`);

    // Donner accès aux médecins
    for (let i = 0; i < medecins.length; i++) {
      const medecin = medecins[i];
      const typeAcces = i === 0 ? 'ECRITURE' : 'LECTURE'; // Premier médecin a accès en écriture

      await db.insert(accesDossiers).values({
        idDossier: dossier.id,
        idMedecin: medecin.id,
        typeAcces: typeAcces,
        statut: 'ACTIF'
      });

      console.log(`✅ Accès donné au Dr. ${medecin.firstName} ${medecin.lastName} (${typeAcces})`);
    }

    console.log('🎉 Connexions de test créées avec succès !');
    process.exit(0);

  } catch (error) {
    console.error('❌ Erreur lors de la création des connexions:', error);
    process.exit(1);
  }
}

seedConnections();