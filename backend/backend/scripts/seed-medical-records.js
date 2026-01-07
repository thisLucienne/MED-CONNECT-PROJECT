require('dotenv').config();
const { db } = require('../src/config/database');
const { users, dossiersMedicaux, accesDossiers } = require('../src/db/schema');
const { eq, and } = require('drizzle-orm');

async function seedMedicalRecords() {
  try {
    console.log('🏥 Création de dossiers médicaux de test...');

    // Trouver des patients
    const patients = await db
      .select()
      .from(users)
      .where(eq(users.role, 'PATIENT'))
      .limit(5);

    if (patients.length === 0) {
      console.log('❌ Aucun patient trouvé.');
      process.exit(1);
    }

    // Trouver des médecins
    const medecins = await db
      .select()
      .from(users)
      .where(eq(users.role, 'DOCTOR'))
      .limit(3);

    if (medecins.length === 0) {
      console.log('❌ Aucun médecin trouvé.');
      process.exit(1);
    }

    console.log(`👥 ${patients.length} patients et ${medecins.length} médecins trouvés`);

    // Types de dossiers médicaux
    const typesDossiers = [
      { type: 'CONSULTATION', titre: 'Consultation générale', description: 'Bilan de santé général' },
      { type: 'ANALYSE', titre: 'Analyses sanguines', description: 'Résultats des analyses de sang' },
      { type: 'RADIO', titre: 'Radiographie thoracique', description: 'Examen radiologique du thorax' },
      { type: 'ORDONNANCE', titre: 'Prescription médicale', description: 'Ordonnance pour traitement' },
      { type: 'SUIVI', titre: 'Suivi médical', description: 'Suivi de traitement en cours' }
    ];

    let totalDossiers = 0;
    let totalAcces = 0;

    // Créer des dossiers pour chaque patient
    for (const patient of patients) {
      const nombreDossiers = Math.floor(Math.random() * 4) + 1; // 1-4 dossiers par patient
      
      console.log(`\n📋 Création de ${nombreDossiers} dossiers pour ${patient.firstName} ${patient.lastName}`);

      for (let i = 0; i < nombreDossiers; i++) {
        const typeDossier = typesDossiers[Math.floor(Math.random() * typesDossiers.length)];
        
        // Créer le dossier médical
        const [dossier] = await db.insert(dossiersMedicaux).values({
          idPatient: patient.id,
          titre: typeDossier.titre,
          description: typeDossier.description,
          type: typeDossier.type,
          statut: 'OUVERT'
        }).returning();

        console.log(`  ✅ Dossier créé: ${dossier.titre}`);
        totalDossiers++;

        // Donner accès à 1-2 médecins aléatoirement
        const nombreAcces = Math.floor(Math.random() * 2) + 1;
        const medecinsAcces = medecins.sort(() => 0.5 - Math.random()).slice(0, nombreAcces);

        for (const medecin of medecinsAcces) {
          await db.insert(accesDossiers).values({
            idDossier: dossier.id,
            idMedecin: medecin.id,
            statut: 'ACTIF',
            typeAcces: 'LECTURE'
          });

          console.log(`    👨‍⚕️ Accès donné à Dr. ${medecin.firstName} ${medecin.lastName}`);
          totalAcces++;
        }
      }
    }

    console.log(`\n🎉 ${totalDossiers} dossiers médicaux créés avec ${totalAcces} accès médecins !`);
    process.exit(0);

  } catch (error) {
    console.error('❌ Erreur lors de la création des dossiers médicaux:', error);
    process.exit(1);
  }
}

seedMedicalRecords();