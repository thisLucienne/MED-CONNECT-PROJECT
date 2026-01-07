require('dotenv').config();
const { db } = require('../src/config/database');
const { users, messages } = require('../src/db/schema');
const { eq } = require('drizzle-orm');

async function testMessages() {
  try {
    console.log('🧪 Test des messages...');

    // Trouver un patient
    const [patient] = await db
      .select()
      .from(users)
      .where(eq(users.role, 'PATIENT'))
      .limit(1);

    if (!patient) {
      console.log('❌ Aucun patient trouvé.');
      process.exit(1);
    }

    console.log(`👤 Patient trouvé: ${patient.firstName} ${patient.lastName} (${patient.id})`);

    // Compter les messages
    const allMessages = await db.select().from(messages);
    console.log(`📧 ${allMessages.length} messages dans la base de données`);

    // Messages du patient
    const patientMessages = allMessages.filter(m => 
      m.expediteur === patient.id || m.destinataire === patient.id
    );
    console.log(`📧 ${patientMessages.length} messages pour ce patient`);

    if (patientMessages.length > 0) {
      console.log('📋 Exemples de messages:');
      patientMessages.slice(0, 3).forEach((msg, index) => {
        console.log(`  ${index + 1}. ${msg.objet}: "${msg.contenu.substring(0, 50)}..."`);
      });
    }

    console.log('✅ Test terminé');
    process.exit(0);

  } catch (error) {
    console.error('❌ Erreur:', error);
    process.exit(1);
  }
}

testMessages();