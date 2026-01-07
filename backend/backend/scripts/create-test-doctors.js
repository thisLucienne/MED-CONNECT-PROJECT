const http = require('http');

// Créer des médecins de test
async function createTestDoctors() {
  try {
    console.log('👨‍⚕️ Création de médecins de test...');

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

    // Médecins de test
    const testDoctors = [
      {
        email: 'dr.martin2024@medconnect.com',
        password: 'Password123!',
        firstName: 'Jean',
        lastName: 'Martin',
        phone: '6 12 34 56 78',
        specialty: 'Cardiologie',
        licenseNumber: 'CARD001'
      },
      {
        email: 'dr.dubois2024@medconnect.com',
        password: 'Password123!',
        firstName: 'Marie',
        lastName: 'Dubois',
        phone: '6 12 34 56 79',
        specialty: 'Dermatologie',
        licenseNumber: 'DERM001'
      },
      {
        email: 'dr.bernard2024@medconnect.com',
        password: 'Password123!',
        firstName: 'Pierre',
        lastName: 'Bernard',
        phone: '6 12 34 56 80',
        specialty: 'Médecine générale',
        licenseNumber: 'GENE001'
      }
    ];

    for (const doctorData of testDoctors) {
      const registerData = JSON.stringify(doctorData);

      const registerOptions = {
        hostname: 'localhost',
        port: 3000,
        path: '/api/auth/register/doctor',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(registerData)
        }
      };

      console.log(`👨‍⚕️ Création du Dr. ${doctorData.firstName} ${doctorData.lastName}...`);
      const response = await makeRequest(registerOptions, registerData);
      console.log(`Status: ${response.statusCode}`);
      
      if (response.statusCode === 201) {
        console.log(`✅ Dr. ${doctorData.firstName} ${doctorData.lastName} créé avec succès`);
      } else {
        console.log(`❌ Erreur:`, response.data);
      }
    }

    console.log('🎉 Création des médecins terminée !');

  } catch (error) {
    console.error('❌ Erreur:', error);
  }
}

createTestDoctors();