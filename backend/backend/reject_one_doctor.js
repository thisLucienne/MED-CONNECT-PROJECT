const axios = require('axios');

const API_BASE_URL = 'http://localhost:5000/api';

async function rejectOneDoctor() {
    console.log('❌ Test de rejet d\'un médecin...\n');

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
            const doctorToReject = doctors[0];
            console.log(`\n🎯 Rejet de Dr. ${doctorToReject.firstName} ${doctorToReject.lastName}...`);
            console.log(`   📧 ${doctorToReject.email}`);
            console.log(`   🏥 ${doctorToReject.specialty}`);

            // 3. Rejeter le médecin
            const doctorIdToUse = doctorToReject.doctorId || doctorToReject.id;
            console.log(`   🆔 ID utilisé pour validation: ${doctorIdToUse}`);
            
            const rejectResponse = await axios.post(`${API_BASE_URL}/admin/doctors/${doctorIdToUse}/validate`, {
                action: 'reject',
                rejectionReason: 'Documents incomplets - test de rejet automatique'
            }, {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            console.log('✅ Médecin rejeté avec succès!');
            console.log('📧 Un email de notification a été envoyé au médecin');

            // 4. Vérifier qu'il n'est plus dans la liste des médecins en attente
            const updatedPendingResponse = await axios.get(`${API_BASE_URL}/admin/doctors/pending`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            const updatedDoctors = updatedPendingResponse.data.data.doctors || [];
            console.log(`\n📊 Médecins en attente après rejet: ${updatedDoctors.length}`);

            return { success: true, rejected: true };
        } else {
            console.log('ℹ️ Aucun médecin en attente à rejeter');
            return { success: true, rejected: false };
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
rejectOneDoctor().then(result => {
    if (result.success) {
        if (result.rejected) {
            console.log('\n🎉 Test de rejet réussi!');
            console.log('💡 Rafraîchissez la page web pour voir les changements');
        } else {
            console.log('\n✅ Test terminé - aucun médecin à rejeter');
        }
    } else {
        console.log('\n❌ Test de rejet échoué');
    }
});