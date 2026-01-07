require('dotenv').config();
const http = require('http');

function makeRequest(options, data = null) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => body += chunk);
      res.on('end', () => {
        try {
          const parsed = JSON.parse(body);
          resolve({ status: res.statusCode, data: parsed });
        } catch (e) {
          resolve({ status: res.statusCode, data: body });
        }
      });
    });

    req.on('error', reject);
    
    if (data) {
      req.write(JSON.stringify(data));
    }
    
    req.end();
  });
}

async function testProfileEndpoints() {
  try {
    console.log('🧪 Test des endpoints de profil...');

    // 1. Test de connexion
    console.log('\n1. Test de connexion...');
    const loginOptions = {
      hostname: 'localhost',
      port: 3000,
      path: '/api/auth/login',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      }
    };

    const loginData = {
      email: 'patient.test@medconnect.com',
      password: 'Test123!'
    };

    const loginResponse = await makeRequest(loginOptions, loginData);
    console.log('Statut connexion:', loginResponse.status);
    
    if (loginResponse.status === 200 && loginResponse.data.success) {
      console.log('✅ Connexion réussie');
      const token = loginResponse.data.data.tokens.accessToken;

      // 2. Test de l'endpoint du profil
      console.log('\n2. Test du profil...');
      const profileOptions = {
        hostname: 'localhost',
        port: 3000,
        path: '/api/auth/profile',
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      };

      const profileResponse = await makeRequest(profileOptions);
      console.log('Statut profil:', profileResponse.status);
      if (profileResponse.data.success) {
        console.log('✅ Profil récupéré:', {
          nom: profileResponse.data.data.user.firstName + ' ' + profileResponse.data.data.user.lastName,
          email: profileResponse.data.data.user.email,
          role: profileResponse.data.data.user.role
        });
      } else {
        console.log('❌ Erreur profil:', profileResponse.data);
      }

      // 3. Test de l'endpoint des statistiques
      console.log('\n3. Test des statistiques...');
      const statsOptions = {
        hostname: 'localhost',
        port: 3000,
        path: '/api/auth/stats',
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      };

      const statsResponse = await makeRequest(statsOptions);
      console.log('Statut stats:', statsResponse.status);
      if (statsResponse.data.success) {
        console.log('✅ Statistiques récupérées:', statsResponse.data.data);
      } else {
        console.log('❌ Erreur stats:', statsResponse.data);
      }

      // 4. Test de l'endpoint des conversations
      console.log('\n4. Test des conversations...');
      const conversationsOptions = {
        hostname: 'localhost',
        port: 3000,
        path: '/api/messages/conversations',
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      };

      const conversationsResponse = await makeRequest(conversationsOptions);
      console.log('Statut conversations:', conversationsResponse.status);
      if (conversationsResponse.data.success) {
        console.log('✅ Conversations récupérées:', conversationsResponse.data.data.length, 'conversations');
      } else {
        console.log('❌ Erreur conversations:', conversationsResponse.data);
      }

    } else {
      console.log('❌ Échec de la connexion:', loginResponse.data);
    }

  } catch (error) {
    console.error('❌ Erreur:', error);
  }
}

testProfileEndpoints();