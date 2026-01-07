const http = require('http');

// Créer des données de test simples
async function createTestData() {
  try {
    console.log('🔧 Création de données de test simples...');

    // Créer un patient de test
    const patientData = JSON.stringify({
      email: 'testpatient2024@medconnect.com',
      password: 'Password123!',
      firstName: 'Test',
      lastName: 'Patient',
      phone: '6 12 34 56 78'
    });

    const registerOptions = {
      hostname: 'localhost',
      port: 3000,
      path: '/api/auth/register/patient',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(patientData)
      }
    };

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

    console.log('👤 Création du patient de test...');
    const patientResponse = await makeRequest(registerOptions, patientData);
    console.log('Patient créé:', patientResponse.statusCode, patientResponse.data);

    // Essayer de se connecter avec le patient
    if (patientResponse.statusCode === 201) {
      const loginData = JSON.stringify({
        email: 'testpatient2024@medconnect.com',
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

      console.log('🔐 Connexion du patient...');
      const loginResponse = await makeRequest(loginOptions, loginData);
      console.log('Connexion:', loginResponse.statusCode, loginResponse.data);

      if (loginResponse.statusCode === 200) {
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
    }

  } catch (error) {
    console.error('❌ Erreur:', error);
  }
}

createTestData();