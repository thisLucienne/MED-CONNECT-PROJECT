const axios = require('axios');

const API_BASE_URL = 'http://localhost:5000/api';

async function testAdminLogin() {
    console.log('🔐 Test de connexion administrateur...\n');

    try {
        // Test 1: Connexion admin
        console.log('1. Tentative de connexion admin...');
        const loginResponse = await axios.post(`${API_BASE_URL}/auth/login`, {
            email: 'admin@medconnect.com',
            password: 'Admin123!@#'
        });

        console.log('✅ Réponse de connexion:', {
            success: loginResponse.data.success,
            message: loginResponse.data.message,
            user: loginResponse.data.data.user,
            requiresVerification: loginResponse.data.data.user.requiresVerification
        });

        if (loginResponse.data.data.user.requiresVerification) {
            console.log('\n📧 Code 2FA requis. Vérifiez votre email pour le code.');
            console.log('💡 Utilisez pgAdmin pour récupérer le code dans la table two_factor_codes');
            
            // Simuler la vérification 2FA avec un code fictif
            console.log('\n2. Test de vérification 2FA (avec code fictif)...');
            try {
                const verifyResponse = await axios.post(`${API_BASE_URL}/auth/verify-2fa`, {
                    userId: loginResponse.data.data.user.id,
                    code: '123456' // Code fictif pour test
                });
                console.log('✅ Vérification 2FA réussie:', verifyResponse.data);
            } catch (verifyError) {
                console.log('⚠️ Erreur 2FA attendue (code fictif):', verifyError.response?.data?.error?.message || verifyError.message);
            }
        }

        // Test 2: Récupérer les médecins en attente (sans token pour voir l'erreur)
        console.log('\n3. Test récupération médecins en attente (sans token)...');
        try {
            const pendingDoctorsResponse = await axios.get(`${API_BASE_URL}/admin/doctors/pending`);
            console.log('✅ Médecins en attente:', pendingDoctorsResponse.data);
        } catch (error) {
            console.log('⚠️ Erreur attendue (pas de token):', error.response?.data?.error?.message || error.message);
        }

        // Test 3: Récupérer les statistiques admin (sans token)
        console.log('\n4. Test récupération statistiques admin (sans token)...');
        try {
            const statsResponse = await axios.get(`${API_BASE_URL}/admin/stats`);
            console.log('✅ Statistiques admin:', statsResponse.data);
        } catch (error) {
            console.log('⚠️ Erreur attendue (pas de token):', error.response?.data?.error?.message || error.message);
        }

    } catch (error) {
        console.error('❌ Erreur lors du test de connexion admin:', {
            message: error.message,
            response: error.response?.data
        });
    }
}

// Exécuter le test
testAdminLogin();