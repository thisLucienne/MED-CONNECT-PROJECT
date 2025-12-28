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