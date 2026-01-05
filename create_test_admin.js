const axios = require('axios');

const API_BASE_URL = 'http://localhost:5000/api';

async function createTestAdmin() {
    console.log('👤 Création d\'un admin de test...\n');

    try {
        // Créer un nouvel admin de test
        const testAdminData = {
            firstName: 'Test',
            lastName: 'Admin',
            email: 'testadmin@medconnect.com',
            password: 'TestAdmin123!@#',
            role: 'ADMIN'
        };

        console.log('📝 Tentative de création d\'admin de test...');
        
        // Essayer de créer via l'endpoint d'inscription patient (puis modifier le rôle)
        const registerResponse = await axios.post(`${API_BASE_URL}/auth/register/patient`, {
            firstName: testAdminData.firstName,
            lastName: testAdminData.lastName,
            email: testAdminData.email,
            password: testAdminData.password
        });

        console.log('✅ Utilisateur de test créé:', {
            success: registerResponse.data.success,
            user: registerResponse.data.data.user
        });

        console.log('\n💡 Pour convertir en admin, utilisez pgAdmin avec cette requête:');
        console.log(`UPDATE users SET role = 'ADMIN', status = 'ACTIVE' WHERE email = '${testAdminData.email}';`);

        return {
            success: true,
            email: testAdminData.email,
            password: testAdminData.password
        };

    } catch (error) {
        console.error('❌ Erreur lors de la création:', {
            message: error.message,
            response: error.response?.data
        });
        
        if (error.response?.data?.error?.code === 'EMAIL_ALREADY_EXISTS') {
            console.log('\n✅ L\'utilisateur existe déjà, tentative de connexion...');
            return {
                success: true,
                email: 'testadmin@medconnect.com',
                password: 'TestAdmin123!@#'
            };
        }
        
        return { success: false };
    }
}

async function testAdminLogin(credentials) {
    console.log('\n🔐 Test de connexion avec les identifiants de test...');
    
    try {
        const loginResponse = await axios.post(`${API_BASE_URL}/auth/login`, {
            email: credentials.email,
            password: credentials.password
        });

        console.log('✅ Connexion réussie:', {
            success: loginResponse.data.success,
            user: loginResponse.data.data.user,
            requiresVerification: loginResponse.data.data.user.requiresVerification
        });

        return { success: true, data: loginResponse.data };

    } catch (error) {
        console.error('❌ Erreur de connexion:', {
            message: error.message,
            response: error.response?.data
        });
        return { success: false };
    }
}

// Exécuter les tests
createTestAdmin().then(async (result) => {
    if (result.success) {
        console.log('\n🎉 Admin de test prêt!');
        console.log('📧 Email:', result.email);
        console.log('🔑 Mot de passe:', result.password);
        
        // Tester la connexion
        await testAdminLogin(result);
    } else {
        console.log('\n❌ Échec de la création de l\'admin de test');
    }
});