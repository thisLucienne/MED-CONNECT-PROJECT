const axios = require('axios');

async function testAdminLogin() {
  try {
    console.log('🧪 Test de connexion administrateur...');
    
    // Essayons d'abord avec les identifiants par défaut
    const loginData = {
      email: 'admin@medconnect.com',
      password: 'Admin123!@#'
    };
    
    console.log('📋 Tentative de connexion avec:', {
      email: loginData.email,
      password: '***'
    });
    
    const response = await axios.post('http://localhost:5000/api/auth/login', loginData);
    
    console.log('✅ Connexion admin réussie !');
    console.log('📧 Email:', response.data.data.user.email);
    console.log('👤 Rôle:', response.data.data.user.role);
    console.log('🔐 2FA requis:', response.data.data.user.requiresVerification);
    
    if (response.data.data.user.requiresVerification) {
      console.log('📧 Un code 2FA a été envoyé par email');
    }
    
  } catch (error) {
    console.error('❌ Erreur de connexion admin:', error.response?.data || error.message);
    
    if (error.response?.status === 401) {
      console.log('\n💡 Suggestions:');
      console.log('  - Vérifiez que l\'admin par défaut a été créé');
      console.log('  - Le mot de passe pourrait être différent');
      console.log('  - L\'email pourrait être différent');
    }
  }
}

// Test aussi la route de base pour vérifier que le serveur répond
async function testServerInfo() {
  try {
    console.log('🌐 Test des informations serveur...');
    const response = await axios.get('http://localhost:5000/');
    console.log('✅ Serveur répond:', response.data.message);
    console.log('📚 Documentation disponible:', response.data.documentation.swagger);
  } catch (error) {
    console.error('❌ Erreur serveur:', error.message);
  }
}

async function runTests() {
  await testServerInfo();
  console.log('\n' + '='.repeat(50) + '\n');
  await testAdminLogin();
}

runTests();