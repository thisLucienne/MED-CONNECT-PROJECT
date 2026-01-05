const axios = require('axios');

const API_BASE_URL = 'http://localhost:5000/api';

// Données de test pour créer des patients
const testPatients = [
    {
        firstName: 'Marie',
        lastName: 'Dubois',
        email: 'marie.dubois@test.com',
        password: 'Patient123!@#',
        phone: '6 12 34 56 78'
    },
    {
        firstName: 'Pierre',
        lastName: 'Martin',
        email: 'pierre.martin@test.com',
        password: 'Patient123!@#',
        phone: '6 98 76 54 32'
    },
    {
        firstName: 'Sophie',
        lastName: 'Bernard',
        email: 'sophie.bernard@test.com',
        password: 'Patient123!@#',
        phone: '6 55 44 33 22'
    },
    {
        firstName: 'Lucas',
        lastName: 'Petit',
        email: 'lucas.petit@test.com',
        password: 'Patient123!@#',
        phone: '6 77 88 99 00'
    }
];

async function createTestPatients() {
    console.log('👥 Création de patients de test...\n');

    for (let i = 0; i < testPatients.length; i++) {
        const patient = testPatients[i];
        console.log(`${i + 1}. Création de ${patient.firstName} ${patient.lastName}...`);

        try {
            const response = await axios.post(`${API_BASE_URL}/auth/register/patient`, patient);
            
            if (response.data.success) {
                console.log(`   ✅ Patient créé avec succès`);
                console.log(`   📧 Email: ${patient.email}`);
                console.log(`   🔑 Mot de passe: ${patient.password}`);
                console.log(`   🆔 ID: ${response.data.data.user.id}`);
            } else {
                console.log(`   ❌ Erreur: ${response.data.message}`);
            }

        } catch (error) {
            if (error.response?.data?.error?.code === 'EMAIL_ALREADY_EXISTS') {
                console.log(`   ⚠️ Patient déjà existant`);
            } else {
                console.log(`   ❌ Erreur: ${error.response?.data?.error?.message || error.message}`);
            }
        }

        console.log('');
    }

    // Test de connexion avec un des patients créés
    console.log('🔐 Test de connexion avec Marie Dubois...');
    try {
        const loginResponse = await axios.post(`${API_BASE_URL}/auth/login`, {
            email: 'marie.dubois@test.com',
            password: 'Patient123!@#'
        });

        if (loginResponse.data.success) {
            console.log('✅ Connexion patient réussie!');
            console.log('👤 Utilisateur:', {
                id: loginResponse.data.data.user.id,
                firstName: loginResponse.data.data.user.firstName,
                lastName: loginResponse.data.data.user.lastName,
                email: loginResponse.data.data.user.email,
                role: loginResponse.data.data.user.role
            });
            
            if (loginResponse.data.data.tokens) {
                console.log('🔑 Tokens reçus:', {
                    accessToken: loginResponse.data.data.tokens.accessToken ? 'Présent' : 'Absent',
                    refreshToken: loginResponse.data.data.tokens.refreshToken ? 'Présent' : 'Absent'
                });
            }
        }

    } catch (error) {
        console.log('❌ Erreur de connexion:', error.response?.data?.error?.message || error.message);
    }

    console.log('\n🎉 Création des patients de test terminée!');
    console.log('\n📋 Identifiants de test:');
    testPatients.forEach((patient, index) => {
        console.log(`${index + 1}. ${patient.firstName} ${patient.lastName}`);
        console.log(`   📧 ${patient.email}`);
        console.log(`   🔑 ${patient.password}`);
    });
}

// Exécuter la création
createTestPatients();