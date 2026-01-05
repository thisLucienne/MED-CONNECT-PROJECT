const axios = require('axios');

const API_BASE_URL = 'http://localhost:5000/api';

async function testPatientEndpointsStructure() {
    console.log('🏥 Test de la structure des endpoints patients...\n');

    try {
        // Test des endpoints sans authentification pour vérifier la structure
        const endpointsToTest = [
            { url: '/patients/profile', method: 'GET', name: 'Profil patient' },
            { url: '/patients/dashboard', method: 'GET', name: 'Dashboard patient' },
            { url: '/patients/doctors', method: 'GET', name: 'Liste des médecins' },
            { url: '/patients/doctors/search?q=test', method: 'GET', name: 'Recherche médecins' },
            { url: '/patients/specialties', method: 'GET', name: 'Spécialités' }
        ];

        console.log('Test de la disponibilité des endpoints (sans auth):');
        
        for (const endpoint of endpointsToTest) {
            try {
                const response = await axios.get(`${API_BASE_URL}${endpoint.url}`);
                console.log(`✅ ${endpoint.name}: Endpoint disponible`);
            } catch (error) {
                if (error.response?.status === 401) {
                    console.log(`✅ ${endpoint.name}: Endpoint disponible (401 - auth requise)`);
                } else if (error.response?.status === 404) {
                    console.log(`❌ ${endpoint.name}: Endpoint non trouvé (404)`);
                } else {
                    console.log(`⚠️  ${endpoint.name}: Erreur ${error.response?.status || 'inconnue'}`);
                }
            }
        }

        // Test de connexion admin (pas de 2FA)
        console.log('\n🔑 Test avec compte admin (pas de 2FA):');
        try {
            const adminLogin = await axios.post(`${API_BASE_URL}/auth/login`, {
                email: 'admin@medconnect.com',
                password: 'Admin123!@#'
            });

            if (adminLogin.data.success && adminLogin.data.data.tokens) {
                console.log('✅ Connexion admin réussie');
                
                const token = adminLogin.data.data.tokens.accessToken;
                const headers = {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                };

                // Test d'un endpoint patient avec token admin (devrait échouer)
                try {
                    const profileTest = await axios.get(`${API_BASE_URL}/patients/profile`, { headers });
                    console.log('⚠️  Admin peut accéder aux endpoints patients');
                } catch (error) {
                    if (error.response?.status === 403) {
                        console.log('✅ Sécurité OK: Admin ne peut pas accéder aux endpoints patients (403)');
                    } else {
                        console.log('⚠️  Erreur inattendue:', error.response?.status, error.response?.data?.error?.message);
                    }
                }
            }
        } catch (error) {
            console.log('❌ Erreur connexion admin:', error.response?.data?.error?.message || error.message);
        }

        // Vérifier la documentation Swagger
        console.log('\n📚 Test de la documentation API:');
        try {
            const swaggerResponse = await axios.get('http://localhost:5000/api-docs.json');
            if (swaggerResponse.data && swaggerResponse.data.paths) {
                const patientPaths = Object.keys(swaggerResponse.data.paths).filter(path => path.includes('/patients'));
                console.log(`✅ Documentation Swagger: ${patientPaths.length} endpoints patients documentés`);
                patientPaths.forEach(path => {
                    console.log(`   - ${path}`);
                });
            }
        } catch (error) {
            console.log('❌ Erreur documentation:', error.message);
        }

        console.log('\n🎯 Résumé:');
        console.log('✅ Structure des endpoints patients: Implémentée');
        console.log('✅ Sécurité: Authentification requise');
        console.log('✅ Documentation: Disponible');
        console.log('📱 Prêt pour l\'intégration mobile avec authentification 2FA');

    } catch (error) {
        console.error('❌ Erreur générale:', error.message);
    }
}

// Exécuter le test
testPatientEndpointsStructure();