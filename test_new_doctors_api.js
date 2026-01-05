const axios = require('axios');

const API_BASE_URL = 'http://localhost:5000/api';

async function testNewDoctorsAPI() {
    console.log('🏥 Test de la nouvelle API des médecins...\n');

    try {
        // 1. Connexion admin
        console.log('1. Connexion admin...');
        const loginResponse = await axios.post(`${API_BASE_URL}/auth/login`, {
            email: 'admin@medconnect.com',
            password: 'Admin123!@#'
        });

        const token = loginResponse.data.data.tokens?.accessToken;
        console.log('✅ Admin connecté');

        // 2. Tester la nouvelle API /admin/doctors
        console.log('\n2. Test de la nouvelle API /admin/doctors...');
        const doctorsResponse = await axios.get(`${API_BASE_URL}/admin/doctors`, {
            headers: { 'Authorization': `Bearer ${token}` },
            params: {
                limit: 50
            }
        });

        console.log('✅ Nouvelle API médecins:', {
            success: doctorsResponse.data.success,
            total: doctorsResponse.data.data.pagination.total,
            count: doctorsResponse.data.data.doctors.length
        });

        // 3. Afficher les détails des médecins avec spécialités
        const doctors = doctorsResponse.data.data.doctors;
        console.log('\n📋 Liste des médecins avec spécialités:');
        doctors.forEach((doctor, index) => {
            console.log(`   ${index + 1}. Dr. ${doctor.firstName} ${doctor.lastName}`);
            console.log(`      📧 ${doctor.email}`);
            console.log(`      📱 ${doctor.phone || 'N/A'}`);
            console.log(`      🏥 Spécialité: ${doctor.specialty}`);
            console.log(`      📋 Licence: ${doctor.licenseNumber}`);
            console.log(`      📊 Statut: ${doctor.status}`);
            console.log(`      📅 Inscrit: ${new Date(doctor.createdAt).toLocaleDateString('fr-FR')}`);
            if (doctor.approvedAt) {
                console.log(`      ✅ Approuvé: ${new Date(doctor.approvedAt).toLocaleDateString('fr-FR')}`);
            }
            if (doctor.rejectionReason) {
                console.log(`      ❌ Rejeté: ${doctor.rejectionReason}`);
            }
            console.log('');
        });

        // 4. Test avec filtre APPROVED uniquement
        console.log('\n3. Test avec filtre APPROVED uniquement...');
        const approvedDoctorsResponse = await axios.get(`${API_BASE_URL}/admin/doctors`, {
            headers: { 'Authorization': `Bearer ${token}` },
            params: {
                status: 'APPROVED',
                limit: 50
            }
        });

        const approvedDoctors = approvedDoctorsResponse.data.data.doctors;
        console.log(`✅ Médecins approuvés: ${approvedDoctors.length}`);

        // 5. Test de recherche par spécialité
        console.log('\n4. Test de recherche par spécialité "Cardiologie"...');
        const cardioResponse = await axios.get(`${API_BASE_URL}/admin/doctors`, {
            headers: { 'Authorization': `Bearer ${token}` },
            params: {
                specialty: 'Cardiologie',
                limit: 50
            }
        });

        const cardioDoctors = cardioResponse.data.data.doctors;
        console.log(`✅ Cardiologues: ${cardioDoctors.length}`);

        // 6. Test de recherche par nom
        console.log('\n5. Test de recherche par nom "Martin"...');
        const searchResponse = await axios.get(`${API_BASE_URL}/admin/doctors`, {
            headers: { 'Authorization': `Bearer ${token}` },
            params: {
                search: 'Martin',
                limit: 50
            }
        });

        const searchResults = searchResponse.data.data.doctors;
        console.log(`✅ Résultats de recherche "Martin": ${searchResults.length}`);

        return {
            success: true,
            totalDoctors: doctors.length,
            approvedDoctors: approvedDoctors.length,
            cardioDoctors: cardioDoctors.length,
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
testNewDoctorsAPI().then(result => {
    if (result.success) {
        console.log('\n🎉 Test de la nouvelle API réussi!');
        console.log(`📊 Total médecins: ${result.totalDoctors}`);
        console.log(`✅ Médecins approuvés: ${result.approvedDoctors}`);
        console.log(`❤️ Cardiologues: ${result.cardioDoctors}`);
        console.log(`🔍 Résultats recherche: ${result.searchResults}`);
    } else {
        console.log('\n❌ Test de la nouvelle API échoué');
    }
});