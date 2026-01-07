require('dotenv').config();
const axios = require('axios');

const API_BASE = 'http://localhost:3000/api';

async function testAPI() {
  try {
    console.log('🧪 Test des endpoints API...');

    // 1. Test de connexion avec un patient existant
    console.log('\n1. Test de connexion...');
    const loginResponse = await axios.post(`${API_BASE}/auth/login`, {
      email: 'test@example.com', // Remplacez par un email de patient existant
      password: 'password123'
    });

    if (loginResponse.data.success) {
      console.log('✅ Connexion réussie');
      const token = loginResponse.data.data.accessToken;
      
      // 2. Test de l'endpoint des spécialités
      console.log('\n2. Test des spécialités...');
      const specialitiesResponse = await axios.get(`${API_BASE}/medecins/specialites`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      console.log('✅ Spécialités récupérées:', specialitiesResponse.data.data);

      // 3. Test de l'endpoint des médecins
      console.log('\n3. Test des médecins...');
      const doctorsResponse = await axios.get(`${API_BASE}/medecins`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      console.log('✅ Médecins récupérés:', doctorsResponse.data.data.length, 'médecins');

      // 4. Test de recherche
      console.log('\n4. Test de recherche...');
      const searchResponse = await axios.get(`${API_BASE}/medecins/recherche?q=martin`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      console.log('✅ Recherche réussie:', searchResponse.data.data.length, 'résultats');

    } else {
      console.log('❌ Échec de la connexion:', loginResponse.data.message);
    }

  } catch (error) {
    console.error('❌ Erreur:', error.response?.data || error.message);
  }
}

testAPI();