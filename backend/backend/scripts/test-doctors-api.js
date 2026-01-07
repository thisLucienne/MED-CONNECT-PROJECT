const http = require('http');

// Test de l'API des médecins
async function testDoctorsAPI() {
  try {
    console.log('🔍 Test de l\'API de recherche de médecins...');

    // Données de connexion pour obtenir un token
    const loginData = JSON.stringify({
      email: 'sheispinked@gmail.com',
      password: 'password123'
    });

    // Options pour la requête de login
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

    // Fonction pour faire une requête HTTP
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

    // Essayer de se connecter
    console.log('🔐 Tentative de connexion...');
    const loginResponse = await makeRequest(loginOptions, loginData);
    
    if (loginResponse.statusCode !== 200) {
      console.log('❌ Échec de connexion:', loginResponse.data);
      
      // Essayer avec un autre utilisateur ou créer un utilisateur de test
      console.log('📝 Création d\'un utilisateur de test...');
      
      const registerData = JSON.stringify({
        email: 'test.patient@medconnect.com',
        password: 'password123',
        firstName: 'Test',
        lastName: 'Patient',
        phone: '0123456789'
      });

      const registerOptions = {
        hostname: 'localhost',
        port: 3000,
        path: '/api/auth/register/patient',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(registerData)
        }
      };

      const registerResponse = await makeRequest(registerOptions, registerData);
      console.log('📝 Réponse inscription:', registerResponse.data);

      if (registerResponse.statusCode === 201) {
        // Essayer de se connecter avec le nouvel utilisateur
        const newLoginData = JSON.stringify({
          email: 'test.patient@medconnect.com',
          password: 'password123'
        });

        const newLoginResponse = await makeRequest(loginOptions, newLoginData);
        
        if (newLoginResponse.statusCode === 200) {
          console.log('✅ Connexion réussie avec le nouvel utilisateur');
          const token = newLoginResponse.data.data.token;
          await testSearchDoctors(token);
        } else {
          console.log('❌ Échec de connexion avec le nouvel utilisateur:', newLoginResponse.data);
        }
      }
      return;
    }

    console.log('✅ Connexion réussie');
    const token = loginResponse.data.data.token;
    await testSearchDoctors(token);

  } catch (error) {
    console.error('❌ Erreur lors du test:', error);
  }
}

async function testSearchDoctors(token) {
  try {
    console.log('🔍 Test de recherche de médecins...');

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

    const makeRequest = (options) => {
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

        req.end();
      });
    };

    const searchResponse = await makeRequest(searchOptions);
    console.log('📊 Réponse recherche médecins:');
    console.log('Status:', searchResponse.statusCode);
    console.log('Data:', JSON.stringify(searchResponse.data, null, 2));

  } catch (error) {
    console.error('❌ Erreur lors de la recherche:', error);
  }
}

testDoctorsAPI();