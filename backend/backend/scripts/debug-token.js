require('dotenv').config();
const JWTUtils = require('../src/utils/jwt');

async function debugToken() {
  try {
    console.log('🔍 Debug du token JWT...');

    // Créer un token de test
    const testPayload = {
      userId: 'test-user-id',
      email: 'test@example.com',
      role: 'PATIENT',
      status: 'ACTIVE'
    };

    console.log('\n1. Génération du token...');
    const accessToken = JWTUtils.generateAccessToken(testPayload);
    console.log('Token généré:', accessToken.substring(0, 50) + '...');

    console.log('\n2. Décodage du token...');
    const decoded = JWTUtils.decodeToken(accessToken);
    console.log('Token décodé:', JSON.stringify(decoded, null, 2));

    console.log('\n3. Vérification du type...');
    const isAccess = JWTUtils.isAccessToken(accessToken);
    console.log('Est un access token:', isAccess);

    console.log('\n4. Vérification complète...');
    try {
      const verified = JWTUtils.verifyToken(accessToken);
      console.log('Token vérifié avec succès:', verified.userId);
    } catch (error) {
      console.log('Erreur de vérification:', error.message);
    }

  } catch (error) {
    console.error('❌ Erreur:', error);
  }
}

debugToken();