const axios = require('axios');

async function createSimpleDoctor() {
  try {
    console.log('🏥 Création d\'un médecin avec nom simple...');
    
    const timestamp = Date.now();
    const doctorData = {
      firstName: 'Paul',  // Sans "Dr."
      lastName: 'Martin',
      email: `paul.martin.${timestamp}@test.com`,
      password: 'Doctor123!',
      specialty: 'Cardiologie',
      licenseNumber: `MED-${Math.floor(Math.random() * 1000)}`,  // Plus court
      phone: '6 99 88 77 66'
    };
    
    console.log('📋 Données du médecin:', {
      ...doctorData,
      password: '***'
    });
    
    const response = await axios.post('http://localhost:5000/api/auth/register/doctor', doctorData);
    
    console.log('✅ Médecin créé avec succès !');
    console.log('📧 Email:', response.data.data.user.email);
    console.log('📋 Statut:', response.data.data.user.status);
    console.log('🆔 ID:', response.data.data.user.id);
    
    console.log('\n🎯 NOUVEAU COMPTE MÉDECIN :');
    console.log(`📧 Email: ${doctorData.email}`);
    console.log(`🔑 Mot de passe: ${doctorData.password}`);
    console.log('📝 Note: Ce médecin est en statut PENDING et doit être validé');
    
    return {
      email: doctorData.email,
      password: doctorData.password,
      userId: response.data.data.user.id
    };
    
  } catch (error) {
    console.error('❌ Erreur:', error.response?.data || error.message);
    
    if (error.response?.data?.error?.details) {
      console.log('\n📋 Détails des erreurs:');
      error.response.data.error.details.forEach(detail => {
        console.log(`  - ${detail.field}: ${detail.message}`);
      });
    }
  }
}

createSimpleDoctor();