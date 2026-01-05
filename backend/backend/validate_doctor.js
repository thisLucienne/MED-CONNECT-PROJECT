const axios = require('axios');

async function validateDoctor() {
  try {
    console.log('🔍 Recherche du médecin à valider...');
    
    // D'abord, récupérer la liste des médecins en attente
    // Note: En production, il faudrait un token admin valide
    const doctorsResponse = await axios.get('http://localhost:5000/api/admin/doctors/pending');
    
    console.log('📋 Médecins en attente:', doctorsResponse.data);
    
  } catch (error) {
    console.error('❌ Erreur (normal sans token admin):', error.response?.status);
    
    // Essayons une approche directe en utilisant l'ID du médecin
    console.log('\n🔧 Tentative de validation directe...');
    
    // Nous devons d'abord nous connecter en tant qu'admin
    await loginAsAdmin();
  }
}

async function loginAsAdmin() {
  try {
    console.log('👤 Tentative de connexion admin...');
    
    const loginResponse = await axios.post('http://localhost:5000/api/auth/login', {
      email: 'admin@medconnect.com',
      password: 'Admin123!@#'
    });
    
    console.log('✅ Connexion admin réussie !');
    console.log('🔐 2FA requis:', loginResponse.data.data.user.requiresVerification);
    
    if (loginResponse.data.data.user.requiresVerification) {
      console.log('📧 Un code 2FA serait nécessaire pour l\'admin');
      console.log('💡 Pour les tests, nous allons créer un médecin déjà validé');
      
      await createValidatedDoctor();
    }
    
  } catch (error) {
    if (error.response?.status === 401 && error.response?.data?.error?.message?.includes('bloqué')) {
      console.log('⚠️  Compte admin temporairement bloqué');
      console.log('💡 Créons directement un médecin validé pour les tests');
      
      await createValidatedDoctor();
    } else {
      console.error('❌ Erreur connexion admin:', error.response?.data || error.message);
    }
  }
}

async function createValidatedDoctor() {
  try {
    console.log('\n🏥 Création d\'un médecin déjà validé pour les tests...');
    
    // Créons un nouveau médecin avec des identifiants différents
    const timestamp = Date.now();
    const doctorData = {
      firstName: 'Dr. Paul',
      lastName: 'Dubois',
      email: `paul.dubois.${timestamp}@test.com`,
      password: 'Doctor123!',
      specialty: 'Médecine Générale',
      licenseNumber: `MED-${Math.floor(Math.random() * 10000)}`,
      phone: '6 99 88 77 66'
    };
    
    console.log('📋 Données du nouveau médecin:', {
      ...doctorData,
      password: '***'
    });
    
    const response = await axios.post('http://localhost:5000/api/auth/register/doctor', doctorData);
    
    console.log('✅ Médecin créé avec succès !');
    console.log('📧 Email:', response.data.data.user.email);
    console.log('📋 Statut initial:', response.data.data.user.status);
    console.log('🆔 ID:', response.data.data.user.id);
    
    console.log('\n🎯 NOUVEAU COMPTE MÉDECIN POUR LES TESTS :');
    console.log(`📧 Email: ${doctorData.email}`);
    console.log(`🔑 Mot de passe: ${doctorData.password}`);
    console.log('📝 Statut: PENDING (en attente de validation)');
    
    console.log('\n💡 Pour tester la connexion complète, nous aurions besoin de :');
    console.log('1. Un token admin valide (avec 2FA)');
    console.log('2. Valider le médecin via l\'API admin');
    console.log('3. Ou modifier directement la base de données');
    
    return response.data.data.user.id;
    
  } catch (error) {
    console.error('❌ Erreur création médecin:', error.response?.data || error.message);
  }
}

// Fonction pour valider directement en base (si on avait accès)
function showDirectDatabaseSolution() {
  console.log('\n🗄️  SOLUTION DIRECTE EN BASE DE DONNÉES :');
  console.log('Si vous avez accès à pgAdmin, vous pouvez exécuter :');
  console.log('');
  console.log('UPDATE users SET status = \'APPROVED\' WHERE email = \'marie.test.1767332808070@test.com\';');
  console.log('UPDATE doctors SET "approvedAt" = NOW() WHERE "userId" IN (');
  console.log('  SELECT id FROM users WHERE email = \'marie.test.1767332808070@test.com\'');
  console.log(');');
  console.log('');
  console.log('Après cela, le médecin pourra se connecter normalement.');
}

async function runValidation() {
  console.log('🧪 Script de validation des médecins Med Connect');
  console.log('================================================\n');
  
  await validateDoctor();
  showDirectDatabaseSolution();
}

runValidation();