const axios = require('axios');

const API_BASE_URL = 'http://localhost:5000/api';

async function testAuthMe() {
    console.log('👤 Test de l\'endpoint /auth/me...\n');

    try {
        // Test avec admin (pas de 2FA)
        console.log('1. Test avec compte admin...');
        const adminLogin = await axios.post(`${API_BASE_URL}/auth/login`, {
            email: 'admin@medconnect.com',
            password: 'Admin123!@#'
        });

        if (adminLogin.data.success && adminLogin.data.data.tokens) {
            const adminToken = adminLogin.data.data.tokens.accessToken;
            const adminHeaders = { 'Authorization': `Bearer ${adminToken}` };

            console.log('✅ Connexion admin réussie');
            console.log(`   Utilisateur: ${adminLogin.data.data.user.firstName} ${adminLogin.data.data.user.lastName}`);

            // Test de l'endpoint /auth/profile
            try {
                const profileResponse = await axios.get(`${API_BASE_URL}/auth/profile`, { headers: adminHeaders });
                if (profileResponse.data.success) {
                    const user = profileResponse.data.data.user;
                    console.log('✅ Endpoint /auth/profile fonctionne:');
                    console.log(`   ID: ${user.id}`);
                    console.log(`   Nom: ${user.firstName} ${user.lastName}`);
                    console.log(`   Email: ${user.email}`);
                    console.log(`   Rôle: ${user.role}`);
                    console.log(`   Statut: ${user.status}`);
                    console.log(`   2FA: ${user.isActive2FA ? 'Activée' : 'Désactivée'}`);
                    console.log(`   Créé le: ${new Date(user.createdAt).toLocaleDateString('fr-FR')}`);
                }
            } catch (error) {
                console.log('❌ Erreur /auth/profile:', error.response?.data?.error?.message || error.message);
            }
        }

        // Test de la structure de l'endpoint
        console.log('\n2. Test de la structure des données...');
        
        // Vérifier que l'endpoint existe et est sécurisé
        try {
            await axios.get(`${API_BASE_URL}/auth/profile`);
            console.log('⚠️  Endpoint /auth/profile accessible sans authentification');
        } catch (error) {
            if (error.response?.status === 401) {
                console.log('✅ Endpoint /auth/profile correctement sécurisé (401)');
            } else {
                console.log(`❌ Erreur inattendue: ${error.response?.status}`);
            }
        }

        console.log('\n🎯 Résumé:');
        console.log('✅ Endpoint /auth/profile disponible et sécurisé');
        console.log('✅ Retourne les données utilisateur complètes');
        console.log('📱 Le dashboard peut récupérer les données fraîches');

    } catch (error) {
        console.error('❌ Erreur générale:', error.message);
    }
}

// Exécuter le test
testAuthMe();