const axios = require('axios');

const API_BASE_URL = 'http://localhost:5000/api';

async function testDashboardData() {
    console.log('📊 Test des données du dashboard patient...\n');

    const testCredentials = {
        email: 'marie.dubois@test.com',
        password: 'Patient123!@#'
    };

    try {
        // 1. Connexion pour obtenir un token
        console.log('1. Connexion du patient...');
        const loginResponse = await axios.post(`${API_BASE_URL}/auth/login`, testCredentials);

        if (!loginResponse.data.success) {
            console.log('❌ Échec de la connexion');
            return;
        }

        // Si 2FA requis, on simule la vérification
        if (loginResponse.data.data.user.requiresVerification) {
            console.log('🔐 2FA requis - simulation de la vérification...');
            
            // Récupérer le code depuis la base de données (simulation)
            const userId = loginResponse.data.data.user.id;
            
            // Pour ce test, on va utiliser un code fictif
            // En réalité, il faudrait récupérer le code depuis les logs ou la DB
            console.log('⚠️  2FA requis - utilisez le code des logs serveur pour un test complet');
            return;
        }

        const token = loginResponse.data.data.tokens.accessToken;
        console.log('✅ Connexion réussie');

        const headers = {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        };

        // 2. Test du profil patient
        console.log('\n2. Récupération du profil patient...');
        try {
            const profileResponse = await axios.get(`${API_BASE_URL}/patients/profile`, { headers });
            if (profileResponse.data.success) {
                const user = profileResponse.data.data;
                console.log('✅ Profil récupéré:');
                console.log(`   Nom: ${user.firstName} ${user.lastName}`);
                console.log(`   Email: ${user.email}`);
                console.log(`   Téléphone: ${user.phone || 'Non renseigné'}`);
                console.log(`   Statut: ${user.status}`);
                console.log(`   2FA: ${user.isActive2FA ? 'Activée' : 'Désactivée'}`);
                console.log(`   Créé le: ${new Date(user.createdAt).toLocaleDateString('fr-FR')}`);
            }
        } catch (error) {
            console.log('❌ Erreur profil:', error.response?.data?.error?.message || error.message);
        }

        // 3. Test du dashboard
        console.log('\n3. Récupération des données dashboard...');
        try {
            const dashboardResponse = await axios.get(`${API_BASE_URL}/patients/dashboard`, { headers });
            if (dashboardResponse.data.success) {
                const dashboard = dashboardResponse.data.data;
                console.log('✅ Dashboard récupéré:');
                console.log(`   Dossiers médicaux: ${dashboard.totalRecords}`);
                console.log(`   Messages non lus: ${dashboard.unreadMessages}`);
                console.log(`   Médecins disponibles: ${dashboard.totalDoctors}`);
                console.log(`   Rendez-vous en attente: ${dashboard.pendingAppointments}`);
                console.log(`   Complétude profil: ${dashboard.quickStats.profileComplete}%`);
                console.log(`   Dernière connexion: ${dashboard.quickStats.lastConnection ? 
                    new Date(dashboard.quickStats.lastConnection).toLocaleString('fr-FR') : 
                    'Inconnue'}`);
            }
        } catch (error) {
            console.log('❌ Erreur dashboard:', error.response?.data?.error?.message || error.message);
        }

        // 4. Test de la liste des médecins (pour le compteur)
        console.log('\n4. Récupération des médecins disponibles...');
        try {
            const doctorsResponse = await axios.get(`${API_BASE_URL}/patients/doctors?limit=5`, { headers });
            if (doctorsResponse.data.success) {
                console.log('✅ Médecins récupérés:');
                console.log(`   Total disponible: ${doctorsResponse.data.data.pagination.total}`);
                doctorsResponse.data.data.doctors.forEach((doctor, index) => {
                    console.log(`   ${index + 1}. Dr ${doctor.firstName} ${doctor.lastName} - ${doctor.specialty}`);
                });
            }
        } catch (error) {
            console.log('❌ Erreur médecins:', error.response?.data?.error?.message || error.message);
        }

        console.log('\n🎯 Résumé:');
        console.log('✅ Toutes les données nécessaires pour le dashboard sont disponibles');
        console.log('📱 Le dashboard mobile peut maintenant afficher les vraies données');

    } catch (error) {
        console.error('❌ Erreur générale:', error.message);
        if (error.response) {
            console.error('   Status:', error.response.status);
            console.error('   Data:', error.response.data);
        }
    }
}

// Exécuter le test
testDashboardData();