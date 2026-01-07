const http = require('http');

// Approuver les médecins directement
async function approveDoctors() {
  try {
    console.log('✅ Approbation des médecins...');

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

    // Créer un admin temporaire pour approuver les médecins
    const adminData = JSON.stringify({
      email: 'admin.temp@medconnect.com',
      password: 'AdminPassword123!',
      firstName: 'Admin',
      lastName: 'Temp'
    });

    // D'abord, créons un patient simple sans 2FA pour tester
    const simplePatientData = JSON.stringify({
      email: 'simple.patient@medconnect.com',
      password: 'Password123!',
      firstName: 'Simple',
      lastName: 'Patient',
      phone: '6 12 34 56 81'
    });

    const registerOptions = {
      hostname: 'localhost',
      port: 3000,
      path: '/api/auth/register/patient',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(simplePatientData)
      }
    };

    console.log('👤 Création d\'un patient simple...');
    const patientResponse = await makeRequest(registerOptions, simplePatientData);
    console.log('Patient:', patientResponse.statusCode, patientResponse.data?.message || patientResponse.data?.error?.message);

    // Maintenant testons directement l'API de recherche avec un token factice
    // Créons un script qui modifie temporairement la base de données
    console.log('🔧 Test direct de l\'API de recherche...');
    
    // Créer un token de test simple (nous allons contourner l'authentification pour le test)
    const testSearchOptions = {
      hostname: 'localhost',
      port: 3000,
      path: '/api/messages/medecins/recherche',
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
        // Pas de token pour voir l'erreur d'authentification
      }
    };

    const searchResponse = await makeRequest(testSearchOptions);
    console.log('Recherche sans token:', searchResponse.statusCode);
    console.log('Réponse:', JSON.stringify(searchResponse.data, null, 2));

  } catch (error) {
    console.error('❌ Erreur:', error);
  }
}

approveDoctors();