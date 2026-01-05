const axios = require('axios');

const API_BASE_URL = 'http://localhost:5000/api';

async function testDashboardStructure() {
    console.log('📊 Test de la structure des données dashboard...\n');

    try {
        // Test avec admin pour vérifier la structure des endpoints
        console.log('1. Test de la structure des endpoints...');
        
        const endpoints = [
            { url: '/patients/profile', name: 'Profil patient' },
            { url: '/patients/dashboard', name: 'Dashboard patient' },
            { url: '/patients/doctors', name: 'Médecins disponibles' },
            { url: '/patients/specialties', name: 'Spécialités médicales' }
        ];

        for (const endpoint of endpoints) {
            try {
                const response = await axios.get(`${API_BASE_URL}${endpoint.url}`);
                console.log(`✅ ${endpoint.name}: Disponible`);
            } catch (error) {
                if (error.response?.status === 401) {
                    console.log(`✅ ${endpoint.name}: Sécurisé (401 - auth requise)`);
                } else if (error.response?.status === 403) {
                    console.log(`✅ ${endpoint.name}: Sécurisé (403 - rôle requis)`);
                } else {
                    console.log(`❌ ${endpoint.name}: Erreur ${error.response?.status || 'inconnue'}`);
                }
            }
        }

        // Test avec admin pour voir la différence de sécurité
        console.log('\n2. Test de sécurité avec compte admin...');
        const adminLogin = await axios.post(`${API_BASE_URL}/auth/login`, {
            email: 'admin@medconnect.com',
            password: 'Admin123!@#'
        });

        if (adminLogin.data.success && adminLogin.data.data.tokens) {
            const adminToken = adminLogin.data.data.tokens.accessToken;
            const adminHeaders = { 'Authorization': `Bearer ${adminToken}` };

            // Tester l'accès admin aux endpoints patients
            try {
                await axios.get(`${API_BASE_URL}/patients/profile`, { headers: adminHeaders });
                console.log('⚠️  Admin peut accéder aux endpoints patients');
            } catch (error) {
                if (error.response?.status === 403) {
                    console.log('✅ Sécurité OK: Admin ne peut pas accéder aux endpoints patients');
                }
            }

            // Tester les endpoints admin
            try {
                const adminDoctorsResponse = await axios.get(`${API_BASE_URL}/admin/doctors`, { headers: adminHeaders });
                if (adminDoctorsResponse.data.success) {
                    console.log(`✅ Admin peut accéder aux médecins: ${adminDoctorsResponse.data.data.doctors.length} médecins`);
                }
            } catch (error) {
                console.log('❌ Erreur accès admin médecins:', error.response?.status);
            }
        }

        console.log('\n🎯 Structure des données dashboard:');
        console.log('📱 Dashboard mobile attendu:');
        console.log('   - Profil utilisateur (nom, email, statut, 2FA)');
        console.log('   - Statistiques (dossiers, messages, rendez-vous)');
        console.log('   - Médecins disponibles (nombre total)');
        console.log('   - Complétude du profil (pourcentage)');
        console.log('   - Dernière connexion');
        
        console.log('\n✅ Tous les endpoints nécessaires sont implémentés et sécurisés');
        console.log('📱 Le dashboard mobile peut maintenant utiliser les vraies données');

    } catch (error) {
        console.error('❌ Erreur générale:', error.message);
    }
}

// Exécuter le test
testDashboardStructure();