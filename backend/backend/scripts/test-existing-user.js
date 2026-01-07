const http = require('http');

// Tester avec un utilisateur existant
async function testExistingUser() {
  try {
    console.log('🔧 Test avec utilisateur existant...');

    const makeRequest = (options, data = null) => {
      return new Promise((resolve, reject) => {
        const req = http.request(options, (res) => {
          let body = '';
          res.on('data', (chunk) => {
            body += chunk;
          });
          res.on('end', () => {
            try {
              const response = JSON.parse(body);
              resolve({ statusCode: res.statusCode, data: response });
            } catch (error) {
              resolve({ statusCode: res.statusCode, data: body });
            }
          });
        });

        req.on('error', (error) => {
          reject(error);
        });

        if (data) {
          req.write(data);
        }
        req.end();
      });
    };

    // Essayer de se connecter avec l'utilisateur existant
    const loginData = JSON.stringify({
      email: 'patient.test@medconnect.com',
      password: 'Password123!'
    });

    const loginOptions = {
      hostname: 'localhost',
      port: 3000,
      path: '/api/auth/login',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(loginData)
      }
    };

    console.log('🔐 Connexion...');
    const loginResponse = await makeRequest(loginOptions, loginData);
    console.log('Connexion:', loginResponse.statusCode);
    console.log('Réponse:', JSON.stringify(loginResponse.data, null, 2));

    if (loginResponse.statusCode === 200 && loginResponse.data.data && loginResponse.data.data.token) {
      const token = loginResponse.data.data.token;
      
      // Tester la recherche de médecins
      const searchOptions = {
        hostname: 'localhost',
        port: 3000,
        path: '/api/messages/medecins/recherche',
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      };

      console.log('🔍 Test recherche médecins...');
      const searchResponse = await makeRequest(searchOptions);
      console.log('Recherche médecins:', searchResponse.statusCode);
      console.log('Données:', JSON.stringify(searchResponse.data, null, 2));
    }

  } catch (error) {
    console.error('❌ Erreur:', error);
  }
}

testExistingUser();