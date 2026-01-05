const axios = require('axios');

const API_BASE = 'http://localhost:5000/api';

// Configuration axios
const api = axios.create({
  baseURL: API_BASE,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Variables globales pour les tests
let adminToken = '';
let patientToken = '';
let doctorToken = '';
let patientId = '';
let doctorId = '';

console.log('🧪 Test de l\'API Med Connect');
console.log('================================\n');

// Test 1: Vérifier l'état du serveur
async function testHealthCheck() {
  try {
    console.log('1️⃣  Test de santé du serveur...');
    const response = await api.get('/health');
    console.log('✅ Serveur en ligne:', response.data.status);
    console.log('📊 Services:', Object.keys(response.data.services).join(', '));
    return true;
  } catch (error) {
    console.error('❌ Erreur health check:', error.message);
    return false;
  }
}

// Test 2: Connexion administrateur
async function testAdminLogin() {
  try {
    console.log('\n2️⃣  Test de connexion administrateur...');
    
    // Étape 1: Login initial
    const loginResponse = await api.post('/auth/login', {
      email: 'admin@medconnect.com',
      password: 'Admin123!@#'
    });
    
    console.log('📧 Code 2FA requis:', loginResponse.data.data.user.requiresVerification);
    
    // Pour les tests, nous allons simuler un code 2FA
    // En réalité, vous devriez vérifier votre email
    console.log('⚠️  Note: En production, vérifiez votre email pour le code 2FA');
    
    return loginResponse.data.data.user.id;
  } catch (error) {
    console.error('❌ Erreur login admin:', error.response?.data?.message || error.message);
    return null;
  }
}

// Test 3: Inscription patient
async function testPatientRegistration() {
  try {
    console.log('\n3️⃣  Test d\'inscription patient...');
    
    const patientData = {
      firstName: 'Jean',
      lastName: 'Dupont',
      email: 'jean.dupont@test.com',
      password: 'Patient123!',
      phone: '6 12 34 56 78'
    };
    
    const response = await api.post('/auth/register/patient', patientData);
    console.log('✅ Patient inscrit:', response.data.data.user.email);
    console.log('🆔 ID Patient:', response.data.data.user.id);
    
    patientId = response.data.data.user.id;
    patientToken = response.data.data.tokens.accessToken;
    
    return true;
  } catch (error) {
    console.error('❌ Erreur inscription patient:', error.response?.data?.message || error.message);
    return false;
  }
}

// Test 4: Inscription médecin
async function testDoctorRegistration() {
  try {
    console.log('\n4️⃣  Test d\'inscription médecin...');
    
    const doctorData = {
      firstName: 'Dr. Marie',
      lastName: 'Martin',
      email: 'marie.martin@test.com',
      password: 'Doctor123!',
      specialty: 'Cardiologie',
      licenseNumber: 'MED-2024/001',
      phone: '6 98 76 54 32'
    };
    
    const response = await api.post('/auth/register/doctor', doctorData);
    console.log('✅ Médecin inscrit (en attente):', response.data.data.user.email);
    console.log('📋 Statut:', response.data.data.user.status);
    console.log('🏥 Spécialité:', response.data.data.doctor.specialty);
    
    doctorId = response.data.data.user.id;
    
    return true;
  } catch (error) {
    console.error('❌ Erreur inscription médecin:', error.response?.data?.message || error.message);
    return false;
  }
}

// Test 5: Connexion patient
async function testPatientLogin() {
  try {
    console.log('\n5️⃣  Test de connexion patient...');
    
    const loginResponse = await api.post('/auth/login', {
      email: 'jean.dupont@test.com',
      password: 'Patient123!'
    });
    
    console.log('✅ Patient connecté:', loginResponse.data.data.user.email);
    console.log('🔐 Token reçu:', loginResponse.data.data.user.requiresVerification ? 'Code 2FA requis' : 'Connecté');
    
    return true;
  } catch (error) {
    console.error('❌ Erreur login patient:', error.response?.data?.message || error.message);
    return false;
  }
}

// Test 6: Création d'un dossier médical
async function testCreateMedicalRecord() {
  try {
    console.log('\n6️⃣  Test de création de dossier médical...');
    
    if (!patientToken) {
      console.log('⚠️  Token patient requis - test ignoré');
      return false;
    }
    
    const dossierData = {
      titre: 'Mon dossier de santé',
      description: 'Suivi médical général',
      type: 'CONSULTATION'
    };
    
    const response = await api.post('/dossiers', dossierData, {
      headers: { Authorization: `Bearer ${patientToken}` }
    });
    
    console.log('✅ Dossier créé:', response.data.data.titre);
    console.log('🆔 ID Dossier:', response.data.data.id);
    
    return response.data.data.id;
  } catch (error) {
    console.error('❌ Erreur création dossier:', error.response?.data?.message || error.message);
    return false;
  }
}

// Test 7: Statistiques admin
async function testAdminStats() {
  try {
    console.log('\n7️⃣  Test des statistiques admin...');
    
    // Note: En réalité, il faudrait un token admin valide
    const response = await api.get('/admin/stats');
    console.log('📊 Statistiques système:', response.data.data);
    
    return true;
  } catch (error) {
    console.error('❌ Erreur stats admin (normal sans token):', error.response?.status);
    return false;
  }
}

// Fonction principale de test
async function runAllTests() {
  console.log('🚀 Démarrage des tests API...\n');
  
  const results = {
    healthCheck: await testHealthCheck(),
    adminLogin: await testAdminLogin(),
    patientRegistration: await testPatientRegistration(),
    doctorRegistration: await testDoctorRegistration(),
    patientLogin: await testPatientLogin(),
    medicalRecord: await testCreateMedicalRecord(),
    adminStats: await testAdminStats()
  };
  
  console.log('\n📋 RÉSULTATS DES TESTS');
  console.log('======================');
  
  Object.entries(results).forEach(([test, success]) => {
    console.log(`${success ? '✅' : '❌'} ${test}: ${success ? 'RÉUSSI' : 'ÉCHEC'}`);
  });
  
  const successCount = Object.values(results).filter(Boolean).length;
  const totalTests = Object.keys(results).length;
  
  console.log(`\n🎯 Score: ${successCount}/${totalTests} tests réussis`);
  
  if (successCount === totalTests) {
    console.log('🎉 Tous les tests sont passés ! L\'API fonctionne correctement.');
  } else {
    console.log('⚠️  Certains tests ont échoué. Vérifiez les erreurs ci-dessus.');
  }
}

// Exécuter les tests
runAllTests().catch(console.error);