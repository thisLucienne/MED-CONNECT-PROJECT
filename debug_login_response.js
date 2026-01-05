const axios = require('axios');

const API_BASE_URL = 'http://localhost:5000/api';

async function debugLoginResponse() {
    console.log('🔍 Debug de la réponse de connexion admin...\n');

    try {
        console.log('1. Test de connexion admin...');
        const loginResponse = await axios.post(`${API_BASE_URL}/auth/login`, {
            email: 'admin@medconnect.com',
            password: 'Admin123!@#'
        });

        console.log('✅ Réponse complète de connexion:');
        console.log(JSON.stringify(loginResponse.data, null, 2));

        console.log('\n📋 Analyse de la réponse:');
        console.log('- Success:', loginResponse.data.success);
        console.log('- Message:', loginResponse.data.message);
        console.log('- User ID:', loginResponse.data.data?.user?.id);
        console.log('- User Role:', loginResponse.data.data?.user?.role);
        console.log('- Requires Verification:', loginResponse.data.data?.user?.requiresVerification);
        console.log('- Tokens présents:', !!loginResponse.data.data?.tokens);
        
        if (loginResponse.data.data?.tokens) {
            console.log('- Access Token:', loginResponse.data.data.tokens.accessToken ? 'Présent' : 'Absent');
            console.log('- Refresh Token:', loginResponse.data.data.tokens.refreshToken ? 'Présent' : 'Absent');
        } else {
            console.log('⚠️ PROBLÈME: Aucun token dans la réponse!');
            console.log('💡 Cela explique pourquoi l\'authentification échoue côté frontend');
        }

        return loginResponse.data;

    } catch (error) {
        console.error('❌ Erreur lors de la connexion:', {
            message: error.message,
            response: error.response?.data
        });
        return null;
    }
}

// Exécuter le debug
debugLoginResponse().then(result => {
    if (result) {
        console.log('\n🎯 Conclusion:');
        if (result.data?.tokens) {
            console.log('✅ Les tokens sont correctement retournés par l\'API');
            console.log('🔍 Le problème est probablement côté frontend Angular');
        } else {
            console.log('❌ Les tokens ne sont PAS retournés par l\'API');
            console.log('🔧 Il faut corriger l\'API backend pour retourner les tokens');
        }
    }
});