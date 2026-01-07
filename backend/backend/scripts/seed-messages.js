require('dotenv').config();
const { db } = require('../src/config/database');
const { users, messages } = require('../src/db/schema');
const { eq, and } = require('drizzle-orm');

async function seedMessages() {
  try {
    console.log('💬 Création de messages de test...');

    // Trouver un patient et des médecins
    const [patient] = await db
      .select()
      .from(users)
      .where(eq(users.role, 'PATIENT'))
      .limit(1);

    if (!patient) {
      console.log('❌ Aucun patient trouvé.');
      process.exit(1);
    }

    const medecins = await db
      .select()
      .from(users)
      .where(eq(users.role, 'DOCTOR'))
      .limit(3);

    if (medecins.length === 0) {
      console.log('❌ Aucun médecin trouvé.');
      process.exit(1);
    }

    console.log(`👤 Patient: ${patient.firstName} ${patient.lastName}`);
    console.log(`👨‍⚕️ ${medecins.length} médecins trouvés`);

    // Messages de test
    const testMessages = [
      {
        expediteur: medecins[0].id,
        destinataire: patient.id,
        contenu: 'Bonjour, j\'ai reçu vos résultats d\'analyses. Tout semble normal, félicitations !',
        objet: 'Résultats d\'analyses',
        confirmationLecture: false
      },
      {
        expediteur: patient.id,
        destinataire: medecins[0].id,
        contenu: 'Merci docteur ! Dois-je prendre un rendez-vous de suivi ?',
        objet: 'Re: Résultats d\'analyses',
        confirmationLecture: true
      },
      {
        expediteur: medecins[1].id,
        destinataire: patient.id,
        contenu: 'Votre rendez-vous de demain est confirmé à 14h30. N\'oubliez pas d\'apporter votre carte vitale.',
        objet: 'Confirmation de rendez-vous',
        confirmationLecture: false
      },
      {
        expediteur: medecins[2].id,
        destinataire: patient.id,
        contenu: 'Suite à notre consultation, je vous prescris le traitement dont nous avons parlé. La prescription est disponible en ligne.',
        objet: 'Prescription médicale',
        confirmationLecture: false
      },
      {
        expediteur: patient.id,
        destinataire: medecins[2].id,
        contenu: 'Docteur, j\'ai une question sur la posologie du médicament prescrit.',
        objet: 'Question sur prescription',
        confirmationLecture: true
      }
    ];

    // Créer les messages
    for (const messageData of testMessages) {
      await db.insert(messages).values({
        ...messageData,
        type: 'MESSAGE'
      });
      
      const expediteurName = messageData.expediteur === patient.id 
        ? `${patient.firstName} ${patient.lastName}`
        : medecins.find(m => m.id === messageData.expediteur)?.firstName + ' ' + medecins.find(m => m.id === messageData.expediteur)?.lastName;
      
      console.log(`✅ Message créé: ${expediteurName} -> ${messageData.objet}`);
    }

    console.log('🎉 Messages de test créés avec succès !');
    process.exit(0);

  } catch (error) {
    console.error('❌ Erreur lors de la création des messages:', error);
    process.exit(1);
  }
}

seedMessages();