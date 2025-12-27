const express = require('express');
const router = express.Router();
const dossierController = require('../controllers/dossierController');
const { authenticateToken, requireRole } = require('../middleware/auth');
const { body } = require('express-validator');
const multer = require('multer');

// Configuration multer pour l'upload de fichiers
const upload = multer({
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

// Validations
const validateDossier = [
  body('titre')
    .notEmpty()
    .withMessage('Titre requis')
    .isLength({ min: 3, max: 200 })
    .withMessage('Le titre doit faire entre 3 et 200 caractères'),
  body('description')
    .optional()
    .isLength({ max: 1000 })
    .withMessage('La description ne peut pas dépasser 1000 caractères'),
  body('type')
    .notEmpty()
    .withMessage('Type de dossier requis')
    .isIn(['CONSULTATION', 'URGENCE', 'SUIVI'])
    .withMessage('Type de dossier invalide')
];

const validateAccesMedecin = [
  body('medecinId')
    .notEmpty()
    .withMessage('ID du médecin requis')
    .isUUID()
    .withMessage('ID du médecin invalide'),
  body('typeAcces')
    .optional()
    .isIn(['LECTURE', 'ECRITURE'])
    .withMessage('Type d\'accès invalide')
];

const validateOrdonnance = [
  body('medicament')
    .notEmpty()
    .withMessage('Nom du médicament requis')
    .isLength({ min: 2, max: 200 })
    .withMessage('Le nom du médicament doit faire entre 2 et 200 caractères'),
  body('dosage')
    .optional()
    .isLength({ max: 100 })
    .withMessage('Le dosage ne peut pas dépasser 100 caractères'),
  body('duree')
    .optional()
    .isLength({ max: 100 })
    .withMessage('La durée ne peut pas dépasser 100 caractères')
];

const validateAllergie = [
  body('nom')
    .notEmpty()
    .withMessage('Nom de l\'allergie requis')
    .isLength({ min: 2, max: 100 })
    .withMessage('Le nom de l\'allergie doit faire entre 2 et 100 caractères')
];

const validateCommentaire = [
  body('contenu')
    .notEmpty()
    .withMessage('Contenu du commentaire requis')
    .isLength({ min: 1, max: 1000 })
    .withMessage('Le contenu doit faire entre 1 et 1000 caractères')
];

/**
 * @swagger
 * /api/dossiers:
 *   post:
 *     summary: Créer un nouveau dossier médical (patients uniquement)
 *     tags: [Dossiers médicaux]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - titre
 *               - type
 *             properties:
 *               titre:
 *                 type: string
 *                 minLength: 3
 *                 maxLength: 200
 *               description:
 *                 type: string
 *                 maxLength: 1000
 *               type:
 *                 type: string
 *                 enum: [CONSULTATION, URGENCE, SUIVI]
 *     responses:
 *       201:
 *         description: Dossier créé avec succès
 */
router.post('/', requireRole(['PATIENT']), validateDossier, dossierController.creerDossier);

/**
 * @swagger
 * /api/dossiers:
 *   get:
 *     summary: Obtenir la liste des dossiers médicaux
 *     tags: [Dossiers médicaux]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Liste des dossiers
 */
router.get('/', dossierController.obtenirDossiers);

/**
 * @swagger
 * /api/dossiers/dossier/{dossierId}:
 *   get:
 *     summary: Obtenir un dossier médical complet
 *     tags: [Dossiers médicaux]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: dossierId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Dossier médical complet
 */
router.get('/dossier/:dossierId', dossierController.obtenirDossierComplet);

/**
 * @swagger
 * /api/dossiers/{dossierId}/acces:
 *   post:
 *     summary: Donner accès à un médecin (patients uniquement)
 *     tags: [Dossiers médicaux]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: dossierId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - medecinId
 *             properties:
 *               medecinId:
 *                 type: string
 *                 format: uuid
 *               typeAcces:
 *                 type: string
 *                 enum: [LECTURE, ECRITURE]
 *     responses:
 *       200:
 *         description: Accès accordé
 */
router.post('/:dossierId/acces', requireRole(['PATIENT']), validateAccesMedecin, dossierController.donnerAccesMedecin);

/**
 * @swagger
 * /api/dossiers/{dossierId}/acces/{medecinId}:
 *   delete:
 *     summary: Révoquer l'accès d'un médecin (patients uniquement)
 *     tags: [Dossiers médicaux]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: dossierId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *       - in: path
 *         name: medecinId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Accès révoqué
 */
router.delete('/:dossierId/acces/:medecinId', requireRole(['PATIENT']), dossierController.revoquerAccesMedecin);

/**
 * @swagger
 * /api/dossiers/{dossierId}/documents:
 *   post:
 *     summary: Ajouter un document au dossier
 *     tags: [Dossiers médicaux]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: dossierId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - fichier
 *               - nom
 *               - type
 *             properties:
 *               fichier:
 *                 type: string
 *                 format: binary
 *               nom:
 *                 type: string
 *               type:
 *                 type: string
 *                 enum: [radio, analyse, rapport]
 *     responses:
 *       201:
 *         description: Document ajouté
 */
router.post('/:dossierId/documents', upload.single('fichier'), dossierController.ajouterDocument);

/**
 * @swagger
 * /api/dossiers/{dossierId}/ordonnances:
 *   post:
 *     summary: Ajouter une ordonnance (médecins uniquement)
 *     tags: [Dossiers médicaux]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: dossierId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - medicament
 *             properties:
 *               medicament:
 *                 type: string
 *               dosage:
 *                 type: string
 *               duree:
 *                 type: string
 *     responses:
 *       201:
 *         description: Ordonnance ajoutée
 */
router.post('/:dossierId/ordonnances', requireRole(['DOCTOR']), validateOrdonnance, dossierController.ajouterOrdonnance);

/**
 * @swagger
 * /api/dossiers/{dossierId}/allergies:
 *   post:
 *     summary: Ajouter une allergie
 *     tags: [Dossiers médicaux]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: dossierId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - nom
 *             properties:
 *               nom:
 *                 type: string
 *     responses:
 *       201:
 *         description: Allergie ajoutée
 */
router.post('/:dossierId/allergies', validateAllergie, dossierController.ajouterAllergie);

/**
 * @swagger
 * /api/dossiers/{dossierId}/commentaires:
 *   post:
 *     summary: Ajouter un commentaire
 *     tags: [Dossiers médicaux]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: dossierId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - contenu
 *             properties:
 *               contenu:
 *                 type: string
 *     responses:
 *       201:
 *         description: Commentaire ajouté
 */
router.post('/:dossierId/commentaires', validateCommentaire, dossierController.ajouterCommentaire);

/**
 * @swagger
 * /api/dossiers/{dossierId}/statut:
 *   patch:
 *     summary: Mettre à jour le statut d'un dossier (médecins uniquement)
 *     tags: [Dossiers médicaux]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: dossierId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Statut mis à jour
 */
router.patch('/:dossierId/statut', requireRole(['DOCTOR']), dossierController.mettreAJourStatut);

module.exports = router;