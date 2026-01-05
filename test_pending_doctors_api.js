const axios = require('axios');

const API_BASE_URL = 'http://localhost:5000/api';

async function testPendingDoctorsAPI() {
    console.log('🔐 Test de l\'API des médecins en attente...\n');

    try {
        // 1. Connexion admin pour obtenir le token
        console.log('1. Connexion admin...');
        const loginResponse = await axios.post(`${API_BASE_URL}/auth/login`, {
            email: 'admin@medconnect.com',
            password: 'Admin123!@#'
        });

        if (!loginResponse.data.success) {
            throw new Error('Échec de la connexion admin');
        }

        const token = loginResponse.data.data.tokens?.accessToken;
        if (!token) {
            throw new Error('Token non reçu');
        }

        console.log('✅ Connexion admin réussie');

        // 2. Récupérer les médecins en attente
        console.log('\n2. Récupération des médecins en attente...');
        const pendingResponse = await axios.get(`${API_BASE_URL}/admin/doctors/pending`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        console.log('✅ Médecins en attente récupérés:', {
            success: pendingResponse.data.success,
            count: pendingResponse.data.data.length,
            doctors: pendingResponse.data.data.map(d => ({
                id: d.id,
                name: `${d.firstName} ${d.lastName}`,
                email: d.email,
                specialty: d.specialty,
                licenseNumber: d.licenseNumber,
                createdAt: d.createdAt
            }))
        });

        // 3. Test de validation d'un médecin (simulation - on ne valide pas vraiment)
        if (pendingResponse.data.data.length > 0) {
            const firstDoctor = pendingResponse.data.data[0];
            console.log(`\n3. Test de validation pour Dr. ${firstDoctor.firstName} ${firstDoctor.lastName}...`);
            console.log('💡 (Simulation - pas de validation réelle)');
            
            // Uncomment to actually validate:
            /*
            const validateResponse = await axios.post(`${API_BASE_URL}/admin/doctors/${firstDoctor.id}/validate`, {
                action: 'approve'
            }, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            console.log('✅ Validation réussie:', validateResponse.data);
            */
        }

        return {
            success: true,
            token: token,
            pendingDoctors: pendingResponse.data.data
        };

    } catch (error) {
        console.error('❌ Erreur:', {
            message: error.message,
            response: error.response?.data
        });
        return { success: false };
    }
}

// Exécuter le test
testPendingDoctorsAPI().then(result => {
    if (result.success) {
        console.log('\n🎉 Test de l\'API réussi!');
        console.log(`📊 ${result.pendingDoctors.length} médecin(s) en attente trouvé(s)`);
    } else {
        console.log('\n❌ Test de l\'API échoué');
    }
});