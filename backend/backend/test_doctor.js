const axios = require('axios');

async function testDoctorRegistration() {
  try {
    console.log('🧪 Test d\'inscription médecin avec données correctes...');
    
    const doctorData = {
      firstName: 'Marie',
      lastName: 'Martin',
      email: `marie.test.${Date.now()}@test.com`,
      password: 'Doctor123!',
      specialty: 'Cardiologie',
      licenseNumber: `MED-${Math.floor(Math.random() * 10000)}`,  // Plus court
      phone: '6 98 76 54 32'  // Format camerounais correct
    };
    
    console.log('📋 Données envoyées:', {
      ...doctorData,
      password: '***'
    });
    
    const response = await axios.post('http://localhost:5000/api/auth/register/doctor', doctorData);
    
    console.log('✅ Médecin inscrit avec succès !');
    console.log('📧 Email:', response.data.data.user.email);
    console.log('📋 Statut:', response.data.data.user.status);
    console.log('🏥 Spécialité:', response.data.data.doctor.specialty);
    console.log('🆔 Numéro de licence:', response.data.data.doctor.licenseNumber);
    
  } catch (error) {
    console.error('❌ Erreur:', error.response?.data || error.message);
    
    // Afficher les détails de validation si disponibles
    if (error.response?.data?.error?.details) {
      console.log('\n📋 Détails des erreurs de validation:');
      error.response.data.error.details.forEach(detail => {
        console.log(`  - ${detail.field}: ${detail.message}`);
        if (detail.value) console.log(`    Valeur reçue: "${detail.value}"`);
      });
    }
  }
}

testDoctorRegistration();