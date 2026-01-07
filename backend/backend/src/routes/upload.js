const express = require('express');
const router = express.Router();
const UploadController = require('../controllers/uploadController');
const { authenticateToken } = require('../middleware/auth');
const multer = require('multer');

// Configuration multer pour l'upload en mémoire
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = [
      'image/jpeg',
      'image/jpg', 
      'image/png',
      'image/gif',
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ];

    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Type de fichier non autorisé'), false);
    }
  }
});

// Configuration multer spécifique pour les photos de profil
const uploadProfilePicture = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB pour les photos de profil
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = [
      'image/jpeg',
      'image/jpg', 
      'image/png',
      'image/webp'
    ];

    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Seules les images JPEG, PNG et WebP sont autorisées'), false);
    }
  }
});

// Middleware d'authentification pour toutes les routes
router.use(authenticateToken);

/**
 * @swagger
 * /api/upload/progress:
 *   post:
 *     summary: Upload de fichier avec progression (Server-Sent Events)
 *     tags: [Upload]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - file
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *               folder:
 *                 type: string
 *     responses:
 *       200:
 *         description: Upload avec progression
 */
router.post('/progress', upload.single('file'), UploadController.uploadWithProgress);

/**
 * @swagger
 * /api/upload/simple:
 *   post:
 *     summary: Upload simple de fichier
 *     tags: [Upload]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - file
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *               folder:
 *                 type: string
 *     responses:
 *       200:
 *         description: Fichier uploadé avec succès
 */
router.post('/simple', upload.single('file'), UploadController.uploadSimple);

/**
 * @swagger
 * /api/upload/profile-picture:
 *   post:
 *     summary: Upload photo de profil
 *     tags: [Upload]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - profilePicture
 *             properties:
 *               profilePicture:
 *                 type: string
 *                 format: binary
 *                 description: Image de profil (JPEG, PNG, WebP, max 5MB)
 *     responses:
 *       200:
 *         description: Photo de profil mise à jour avec succès
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *                   properties:
 *                     url:
 *                       type: string
 *       400:
 *         description: Erreur de validation
 */
router.post('/profile-picture', uploadProfilePicture.single('profilePicture'), UploadController.uploadProfilePicture);

/**
 * @swagger
 * /api/upload/{publicId}:
 *   delete:
 *     summary: Supprimer un fichier uploadé
 *     tags: [Upload]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: publicId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Fichier supprimé
 */
router.delete('/:publicId', UploadController.deleteFile);

module.exports = router;