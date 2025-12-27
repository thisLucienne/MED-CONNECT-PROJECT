const multer = require('multer');
const { ValidationService } = require('../utils/validators');

// Configuration de stockage en mémoire pour Multer
const storage = multer.memoryStorage();

// Configuration Multer
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB max
    files: 1 // Un seul fichier à la fois
  },
  fileFilter: (req, file, cb) => {
    // Vérifier le type MIME
    const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/webp'];
    
    if (allowedMimeTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Format de fichier non supporté. Utilisez JPG, PNG ou WEBP'), false);
    }
  }
});

// Middleware pour gérer les erreurs d'upload
const handleUploadError = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    let message = 'Erreur lors de l\'upload du fichier';
    
    switch (err.code) {
      case 'LIMIT_FILE_SIZE':
        message = 'Le fichier est trop volumineux. Taille maximum: 5MB';
        break;
      case 'LIMIT_FILE_COUNT':
        message = 'Trop de fichiers. Un seul fichier autorisé';
        break;
      case 'LIMIT_UNEXPECTED_FILE':
        message = 'Champ de fichier inattendu';
        break;
      default:
        message = err.message;
    }

    return res.status(400).json({
      success: false,
      error: {
        code: 'UPLOAD_ERROR',
        message: message
      }
    });
  }

  if (err) {
    return res.status(400).json({
      success: false,
      error: {
        code: 'FILE_ERROR',
        message: err.message
      }
    });
  }

  next();
};

// Middleware pour l'upload de photo de profil
const uploadProfilePicture = [
  upload.single('profilePicture'),
  handleUploadError,
  (req, res, next) => {
    // Validation supplémentaire du fichier si présent
    if (req.file) {
      const validation = ValidationService.validateFile(req.file);
      
      if (!validation.isValid) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'FILE_VALIDATION_ERROR',
            message: validation.error
          }
        });
      }
    }
    
    next();
  }
];

// Middleware pour l'upload optionnel (ne génère pas d'erreur si pas de fichier)
const uploadOptionalProfilePicture = [
  (req, res, next) => {
    upload.single('profilePicture')(req, res, (err) => {
      // Ignorer l'erreur si aucun fichier n'est fourni
      if (err && err.code !== 'LIMIT_UNEXPECTED_FILE') {
        return handleUploadError(err, req, res, next);
      }
      next();
    });
  },
  (req, res, next) => {
    // Validation seulement si un fichier est présent
    if (req.file) {
      const validation = ValidationService.validateFile(req.file);
      
      if (!validation.isValid) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'FILE_VALIDATION_ERROR',
            message: validation.error
          }
        });
      }
    }
    
    next();
  }
];

module.exports = {
  upload,
  uploadProfilePicture,
  uploadOptionalProfilePicture,
  handleUploadError
};