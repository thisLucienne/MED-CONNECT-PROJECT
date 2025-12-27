const cloudinary = require('cloudinary').v2;

// Configuration Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true
});

// Vérifier la configuration
const testCloudinaryConnection = async () => {
  try {
    const result = await cloudinary.api.ping();
    console.log('✅ Connexion Cloudinary réussie');
    return true;
  } catch (error) {
    console.error('❌ Erreur de connexion Cloudinary:', error.message);
    return false;
  }
};

module.exports = {
  cloudinary,
  testCloudinaryConnection
};