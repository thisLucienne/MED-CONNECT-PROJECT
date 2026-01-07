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

async function testEndpoints() {
  try {
    console.log('🧪 Test des endpoints HTTP...');

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
      console.log('Structure de la réponse:', JSON.stringify(loginResponse.data, null, 2));
      
      const token = loginResponse.data.data?.tokens?.accessToken || loginResponse.data.data?.accessToken || loginResponse.data.accessToken;
      if (!token) {
        console.log('❌ Token non trouvé dans la réponse');
        return;
      }
      
      console.log('Token reçu:', token.substring(0, 50) + '...');

      // Debug du token
      const JWTUtils = require('../src/utils/jwt');
      const decoded = JWTUtils.decodeToken(token);
      console.log('Token décodé:', JSON.stringify(decoded, null, 2));
      console.log('Est un access token:', JWTUtils.isAccessToken(token));

      // 2. Test de l'endpoint des spécialités
      console.log('\n2. Test des spécialités...');
      const specialtiesOptions = {
        hostname: 'localhost',
        port: 3000,
        path: '/api/medecins/specialites',
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      };

      const specialtiesResponse = await makeRequest(specialtiesOptions);
      console.log('Statut spécialités:', specialtiesResponse.status);
      console.log('Réponse spécialités:', specialtiesResponse.data);

      // 3. Test de l'endpoint des médecins
      console.log('\n3. Test des médecins...');
      const doctorsOptions = {
        hostname: 'localhost',
        port: 3000,
        path: '/api/medecins',
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      };

      const doctorsResponse = await makeRequest(doctorsOptions);
      console.log('Statut médecins:', doctorsResponse.status);
      console.log('Nombre de médecins:', doctorsResponse.data.success ? doctorsResponse.data.data.length : 'Erreur');

    } else {
      console.log('❌ Échec de la connexion:', loginResponse.data);
    }

  } catch (error) {
    console.error('❌ Erreur:', error);
  }
}

testEndpoints();