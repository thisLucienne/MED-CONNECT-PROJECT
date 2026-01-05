const axios = require('axios');

const API_BASE_URL = 'http://localhost:5000/api';

async function testDoctorsAPI() {
    console.log('🏥 Test de l\'API des médecins...\n');

    try {
        // 1. Connexion admin
        console.log('1. Connexion admin...');
        const loginResponse = await axios.post(`${API_BASE_URL}/auth/login`, {
            email: 'admin@medconnect.com',
            password: 'Admin123!@#'
        });

        const token = loginResponse.data.data.tokens?.accessToken;
        console.log('✅ Admin connecté');

        // 2. Récupérer tous les médecins via l'API admin/users
        console.log('\n2. Récupération de tous les médecins...');
        const doctorsResponse = await axios.get(`${API_BASE_URL}/admin/users`, {
            headers: { 'Authorization': `Bearer ${token}` },
            params: {
                role: 'DOCTOR',
                limit: 50  // Récupérer jusqu'à 50 médecins
            }
        });

        console.log('✅ Médecins récupérés:', {
            success: doctorsResponse.data.success,
            total: doctorsResponse.data.data.pagination.total,
            count: doctorsResponse.data.data.users.length
        });

        // 3. Afficher les détails des médecins
        const doctors = doctorsResponse.data.data.users;
        console.log('\n📋 Liste des médecins:');
        doctors.forEach((doctor, index) => {
            console.log(`   ${index + 1}. Dr. ${doctor.firstName} ${doctor.lastName}`);
            console.log(`      📧 ${doctor.email}`);
            console.log(`      📱 ${doctor.phone || 'N/A'}`);
            console.log(`      📊 Statut: ${doctor.status}`);
            console.log(`      📅 Inscrit: ${new Date(doctor.createdAt).toLocaleDateString('fr-FR')}`);
            console.log('');
        });

        // 4. Test avec filtres
        console.log('\n3. Test avec filtre APPROVED uniquement...');
        const approvedDoctorsResponse = await axios.get(`${API_BASE_URL}/admin/users`, {
            headers: { 'Authorization': `Bearer ${token}` },
            params: {
                role: 'DOCTOR',
                status: 'APPROVED',
                limit: 50
            }
        });

        const approvedDoctors = approvedDoctorsResponse.data.data.users;
        console.log(`✅ Médecins approuvés: ${approvedDoctors.length}`);

        // 5. Test de recherche
        console.log('\n4. Test de recherche par nom...');
        const searchResponse = await axios.get(`${API_BASE_URL}/admin/users`, {
            headers: { 'Authorization': `Bearer ${token}` },
            params: {
                role: 'DOCTOR',
                search: 'Martin',
                limit: 50
            }
        });

        const searchResults = searchResponse.data.data.users;
        console.log(`✅ Résultats de recherche "Martin": ${searchResults.length}`);

        return {
            success: true,
            totalDoctors: doctors.length,
            approvedDoctors: approvedDoctors.length,
            searchResults: searchResults.length
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
testDoctorsAPI().then(result => {
    if (result.success) {
        console.log('\n🎉 Test de l\'API réussi!');
        console.log(`📊 Total médecins: ${result.totalDoctors}`);
        console.log(`✅ Médecins approuvés: ${result.approvedDoctors}`);
        console.log(`🔍 Résultats recherche: ${result.searchResults}`);
    } else {
        console.log('\n❌ Test de l\'API échoué');
    }
});