const axios = require('axios');

const API_BASE_URL = 'http://localhost:5000/api';

async function resetAndTestAdminLogin() {
    console.log('🔧 Réinitialisation et test de connexion admin...\n');

    try {
        // Test 1: Vérifier l'état du serveur
        console.log('1. Vérification de l\'état du serveur...');
        const healthResponse = await axios.get('http://localhost:5000/health');
        console.log('✅ Serveur opérationnel:', healthResponse.data.status);

        // Test 2: Tentative de connexion admin
        console.log('\n2. Tentative de connexion admin...');
        const loginResponse = await axios.post(`${API_BASE_URL}/auth/login`, {
            email: 'admin@medconnect.com',
            password: 'Admin123!@#'
        });

        console.log('✅ Réponse de connexion:', {
            success: loginResponse.data.success,
            message: loginResponse.data.message,
            user: {
                id: loginResponse.data.data.user.id,
                email: loginResponse.data.data.user.email,
                firstName: loginResponse.data.data.user.firstName,
                lastName: loginResponse.data.data.user.lastName,
                role: loginResponse.data.data.user.role
            },
            requiresVerification: loginResponse.data.data.user.requiresVerification
        });

        if (loginResponse.data.data.user.requiresVerification) {
            console.log('\n📧 Code 2FA requis pour finaliser la connexion');
            console.log('💡 Utilisez pgAdmin pour récupérer le code dans la table two_factor_codes');
            console.log('📋 Requête SQL: SELECT code FROM two_factor_codes WHERE user_id = \'' + loginResponse.data.data.user.id + '\' AND is_used = false ORDER BY created_at DESC LIMIT 1;');
        }

        return {
            success: true,
            userId: loginResponse.data.data.user.id,
            requiresVerification: loginResponse.data.data.user.requiresVerification
        };

    } catch (error) {
        console.error('❌ Erreur:', {
            message: error.message,
            response: error.response?.data
        });
        
        if (error.response?.data?.error?.code === 'ACCOUNT_LOCKED') {
            console.log('\n🔒 Compte verrouillé détecté');
            console.log('💡 Utilisez pgAdmin pour exécuter cette requête:');
            console.log('UPDATE users SET login_attempts = 0, locked_until = NULL WHERE email = \'admin@medconnect.com\';');
        }
        
        return { success: false, error: error.response?.data };
    }
}

// Exécuter le test
resetAndTestAdminLogin().then(result => {
    if (result.success) {
        console.log('\n🎉 Test de connexion admin réussi!');
        if (result.requiresVerification) {
            console.log('📝 Prochaine étape: Récupérer le code 2FA et tester la vérification');
        }
    } else {
        console.log('\n❌ Test de connexion admin échoué');
    }
});