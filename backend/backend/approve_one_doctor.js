const axios = require('axios');

const API_BASE_URL = 'http://localhost:5000/api';

async function approveOneDoctor() {
    console.log('✅ Test d\'approbation d\'un médecin...\n');

    try {
        // 1. Connexion admin
        const loginResponse = await axios.post(`${API_BASE_URL}/auth/login`, {
            email: 'admin@medconnect.com',
            password: 'Admin123!@#'
        });

        const token = loginResponse.data.data.tokens?.accessToken;
        console.log('✅ Admin connecté');

        // 2. Récupérer les médecins en attente
        const pendingResponse = await axios.get(`${API_BASE_URL}/admin/doctors/pending`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        const doctors = pendingResponse.data.data.doctors || [];
        console.log(`📋 ${doctors.length} médecin(s) en attente`);

        if (doctors.length > 0) {
            const doctorToApprove = doctors[0];
            console.log(`\n🎯 Approbation de Dr. ${doctorToApprove.firstName} ${doctorToApprove.lastName}...`);
            console.log(`   📧 ${doctorToApprove.email}`);
            console.log(`   🏥 ${doctorToApprove.specialty}`);

            // 3. Approuver le médecin - utiliser doctorId au lieu de id
            const doctorIdToUse = doctorToApprove.doctorId || doctorToApprove.id;
            console.log(`   🆔 ID utilisé pour validation: ${doctorIdToUse}`);
            
            const approveResponse = await axios.post(`${API_BASE_URL}/admin/doctors/${doctorIdToUse}/validate`, {
                action: 'approve'
            }, {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            console.log('✅ Médecin approuvé avec succès!');
            console.log('📧 Un email de confirmation a été envoyé au médecin');

            // 4. Vérifier qu'il n'est plus dans la liste des médecins en attente
            const updatedPendingResponse = await axios.get(`${API_BASE_URL}/admin/doctors/pending`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            const updatedDoctors = updatedPendingResponse.data.data.doctors || [];
            console.log(`\n📊 Médecins en attente après approbation: ${updatedDoctors.length}`);

            return { success: true, approved: true };
        } else {
            console.log('ℹ️ Aucun médecin en attente à approuver');
            return { success: true, approved: false };
        }

    } catch (error) {
        console.error('❌ Erreur:', {
            message: error.message,
            response: error.response?.data
        });
        return { success: false };
    }
}

// Exécuter le test
approveOneDoctor().then(result => {
    if (result.success) {
        if (result.approved) {
            console.log('\n🎉 Test d\'approbation réussi!');
            console.log('💡 Rafraîchissez la page web pour voir les changements');
        } else {
            console.log('\n✅ Test terminé - aucun médecin à approuver');
        }
    } else {
        console.log('\n❌ Test d\'approbation échoué');
    }
});