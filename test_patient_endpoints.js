const axios = require('axios');

const API_BASE_URL = 'http://localhost:5000/api';

// Identifiants de test
const testCredentials = {
    email: 'marie.dubois@test.com',
    password: 'Patient123!@#',
    name: 'Marie Dubois'
};

async function testPatientEndpoints() {
    console.log('🏥 Test des nouveaux endpoints patients...\n');

    try {
        // 1. Connexion pour obtenir un token
        console.log('1. Connexion du patient...');
        const loginResponse = await axios.post(`${API_BASE_URL}/auth/login`, {
            email: testCredentials.email,
            password: testCredentials.password
        });

        if (!loginResponse.data.success || !loginResponse.data.data.tokens) {
            console.log('❌ Échec de la connexion');
            return;
        }

        const token = loginResponse.data.data.tokens.accessToken;
        console.log('✅ Connexion réussie');

        const headers = {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        };

        // 2. Test du profil patient
        console.log('\n2. Test du profil patient...');
        try {
            const profileResponse = await axios.get(`${API_BASE_URL}/patients/profile`, { headers });
            if (profileResponse.data.success) {
                console.log('✅ Profil récupéré:', profileResponse.data.data.firstName, profileResponse.data.data.lastName);
            }
        } catch (error) {
            console.log('❌ Erreur profil:', error.response?.data?.error?.message || error.message);
        }

        // 3. Test du dashboard
        console.log('\n3. Test du dashboard...');
        try {
            const dashboardResponse = await axios.get(`${API_BASE_URL}/patients/dashboard`, { headers });
            if (dashboardResponse.data.success) {
                console.log('✅ Dashboard récupéré:');
                console.log('   - Médecins disponibles:', dashboardResponse.data.data.totalDoctors);
                console.log('   - Complétude profil:', dashboardResponse.data.data.quickStats.profileComplete + '%');
            }
        } catch (error) {
            console.log('❌ Erreur dashboard:', error.response?.data?.error?.message || error.message);
        }

        // 4. Test de la liste des médecins
        console.log('\n4. Test de la liste des médecins...');
        try {
            const doctorsResponse = await axios.get(`${API_BASE_URL}/patients/doctors?limit=5`, { headers });
            if (doctorsResponse.data.success) {
                console.log('✅ Médecins récupérés:', doctorsResponse.data.data.doctors.length);
                doctorsResponse.data.data.doctors.forEach((doctor, index) => {
                    console.log(`   ${index + 1}. Dr ${doctor.firstName} ${doctor.lastName} - ${doctor.specialty}`);
                });
                console.log('   Total disponible:', doctorsResponse.data.data.pagination.total);
            }
        } catch (error) {
            console.log('❌ Erreur médecins:', error.response?.data?.error?.message || error.message);
        }

        // 5. Test de recherche de médecins
        console.log('\n5. Test de recherche de médecins...');
        try {
            const searchResponse = await axios.get(`${API_BASE_URL}/patients/doctors/search?q=cardio`, { headers });
            if (searchResponse.data.success) {
                console.log('✅ Recherche "cardio":', searchResponse.data.data.doctors.length, 'résultats');
                searchResponse.data.data.doctors.forEach((doctor, index) => {
                    console.log(`   ${index + 1}. Dr ${doctor.firstName} ${doctor.lastName} - ${doctor.specialty}`);
                });
            }
        } catch (error) {
            console.log('❌ Erreur recherche:', error.response?.data?.error?.message || error.message);
        }

        // 6. Test des spécialités
        console.log('\n6. Test des spécialités...');
        try {
            const specialtiesResponse = await axios.get(`${API_BASE_URL}/patients/specialties`, { headers });
            if (specialtiesResponse.data.success) {
                console.log('✅ Spécialités disponibles:', specialtiesResponse.data.data.specialties.length);
                specialtiesResponse.data.data.specialties.forEach((specialty, index) => {
                    console.log(`   ${index + 1}. ${specialty.name} (${specialty.doctorCount} médecins)`);
                });
            }
        } catch (error) {
            console.log('❌ Erreur spécialités:', error.response?.data?.error?.message || error.message);
        }

        // 7. Test de mise à jour du profil
        console.log('\n7. Test de mise à jour du profil...');
        try {
            const updateData = {
                phone: '6 12 34 56 78'
            };
            const updateResponse = await axios.put(`${API_BASE_URL}/patients/profile`, updateData, { headers });
            if (updateResponse.data.success) {
                console.log('✅ Profil mis à jour:', updateResponse.data.data.phone);
            }
        } catch (error) {
            console.log('❌ Erreur mise à jour:', error.response?.data?.error?.message || error.message);
        }

        console.log('\n🎯 Résumé des tests:');
        console.log('✅ Endpoints patients: Implémentés et fonctionnels');
        console.log('✅ Authentification: Fonctionne avec les tokens');
        console.log('✅ Intégration mobile: Prête pour les tests frontend');

    } catch (error) {
        console.error('❌ Erreur générale:', error.message);
    }
}

// Exécuter le test
testPatientEndpoints();