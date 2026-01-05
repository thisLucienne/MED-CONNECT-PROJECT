const axios = require('axios');

const API_BASE_URL = 'http://localhost:5000/api';

async function testRegistration() {
    console.log('🧪 Test d\'inscription d\'un nouveau patient...\n');

    const newPatient = {
        firstName: 'Jean',
        lastName: 'Dupont',
        email: `jean.dupont.${Date.now()}@test.com`, // Email unique
        password: 'Patient123!@#',
        phone: '6 55 66 77 88'
    };

    try {
        console.log('📝 Tentative d\'inscription avec les données:');
        console.log(`   Nom: ${newPatient.firstName} ${newPatient.lastName}`);
        console.log(`   Email: ${newPatient.email}`);
        console.log(`   Téléphone: ${newPatient.phone}`);

        const response = await axios.post(`${API_BASE_URL}/auth/register/patient`, newPatient);

        if (response.data.success) {
            console.log('\n✅ Inscription réussie !');
            console.log(`   Utilisateur créé: ${response.data.data.user.firstName} ${response.data.data.user.lastName}`);
            console.log(`   Email: ${response.data.data.user.email}`);
            console.log(`   Rôle: ${response.data.data.user.role}`);
            console.log(`   Statut: ${response.data.data.user.status}`);
            console.log(`   2FA activé: ${response.data.data.user.isActive2FA ? 'Oui' : 'Non'}`);
            
            if (response.data.data.user.requiresVerification) {
                console.log('\n🔐 Vérification 2FA requise');
                console.log('   Code envoyé par email (voir logs serveur)');
            }
        } else {
            console.log('\n❌ Inscription échouée');
            console.log(`   Erreur: ${response.data.error?.message}`);
        }

    } catch (error) {
        console.log('\n❌ Erreur lors de l\'inscription');
        if (error.response) {
            console.log(`   Status: ${error.response.status}`);
            console.log(`   Message: ${error.response.data?.error?.message || error.response.data?.message}`);
        } else {
            console.log(`   Erreur: ${error.message}`);
        }
    }

    // Test avec email déjà existant
    console.log('\n🧪 Test avec email déjà existant...');
    try {
        const duplicateResponse = await axios.post(`${API_BASE_URL}/auth/register/patient`, {
            ...newPatient,
            firstName: 'Marie',
            lastName: 'Dubois'
        });

        console.log('⚠️  Inscription autorisée avec email existant (problème potentiel)');
    } catch (error) {
        if (error.response?.status === 400) {
            console.log('✅ Email déjà existant correctement rejeté');
            console.log(`   Message: ${error.response.data?.error?.message}`);
        } else {
            console.log('❌ Erreur inattendue:', error.message);
        }
    }
}

// Exécuter le test
testRegistration();