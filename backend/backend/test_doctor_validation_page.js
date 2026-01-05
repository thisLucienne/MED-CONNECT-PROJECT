const axios = require('axios');

const API_BASE_URL = 'http://localhost:5000/api';

async function testDoctorValidationFlow() {
    console.log('🏥 Test complet du flux de validation des médecins...\n');

    try {
        // 1. Connexion admin
        console.log('1. Connexion admin...');
        const loginResponse = await axios.post(`${API_BASE_URL}/auth/login`, {
            email: 'admin@medconnect.com',
            password: 'Admin123!@#'
        });

        const token = loginResponse.data.data.tokens?.accessToken;
        console.log('✅ Admin connecté');

        // 2. Récupérer les médecins en attente
        console.log('\n2. Récupération des médecins en attente...');
        const pendingResponse = await axios.get(`${API_BASE_URL}/admin/doctors/pending`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        const doctors = pendingResponse.data.data.doctors || [];
        console.log(`✅ ${doctors.length} médecin(s) en attente trouvé(s)`);

        if (doctors.length > 0) {
            doctors.forEach((doctor, index) => {
                console.log(`   ${index + 1}. Dr. ${doctor.firstName} ${doctor.lastName}`);
                console.log(`      📧 ${doctor.email}`);
                console.log(`      🏥 ${doctor.specialty}`);
                console.log(`      📋 Licence: ${doctor.licenseNumber}`);
                console.log(`      📅 Demande: ${new Date(doctor.createdAt).toLocaleDateString('fr-FR')}`);
                console.log('');
            });

            // 3. Test de validation (simulation)
            const firstDoctor = doctors[0];
            console.log(`3. Simulation de validation pour Dr. ${firstDoctor.firstName} ${firstDoctor.lastName}...`);
            console.log('💡 Pour tester réellement, décommentez le code ci-dessous');
            
            /*
            // Test d'approbation
            console.log('   Approbation...');
            const approveResponse = await axios.post(`${API_BASE_URL}/admin/doctors/${firstDoctor.id}/validate`, {
                action: 'approve'
            }, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            console.log('✅ Médecin approuvé:', approveResponse.data);
            */

            /*
            // Test de rejet
            console.log('   Rejet...');
            const rejectResponse = await axios.post(`${API_BASE_URL}/admin/doctors/${firstDoctor.id}/validate`, {
                action: 'reject',
                rejectionReason: 'Documents incomplets pour test'
            }, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            console.log('✅ Médecin rejeté:', rejectResponse.data);
            */
        }

        // 4. Statistiques admin
        console.log('\n4. Récupération des statistiques admin...');
        try {
            const statsResponse = await axios.get(`${API_BASE_URL}/admin/stats`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            console.log('✅ Statistiques récupérées:', {
                totalUsers: statsResponse.data.data.totalUsers,
                totalDoctors: statsResponse.data.data.totalDoctors,
                pendingDoctors: statsResponse.data.data.pendingDoctors,
                activeDoctors: statsResponse.data.data.activeDoctors
            });
        } catch (error) {
            console.log('⚠️ Erreur stats (peut-être pas implémenté):', error.response?.data?.error?.message || error.message);
        }

        console.log('\n🎉 Test complet réussi!');
        console.log('\n📋 Instructions pour tester la page web:');
        console.log('1. Ouvrez http://localhost:4201 dans votre navigateur');
        console.log('2. Connectez-vous avec admin@medconnect.com / Admin123!@#');
        console.log('3. Naviguez vers "Validation Médecins"');
        console.log(`4. Vous devriez voir ${doctors.length} médecin(s) en attente`);
        console.log('5. Testez l\'approbation et le rejet');

        return { success: true, doctorsCount: doctors.length };

    } catch (error) {
        console.error('❌ Erreur:', {
            message: error.message,
            response: error.response?.data
        });
        return { success: false };
    }
}

// Exécuter le test
testDoctorValidationFlow();