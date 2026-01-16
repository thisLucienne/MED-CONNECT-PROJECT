const express = require('express');
const router = express.Router();
const rendezVousController = require('../controllers/rendezVousController');
const { authenticateToken, requireRole } = require('../middleware/auth');
const { body } = require('express-validator');

// Middleware d'authentification pour toutes les routes
router.use(authenticateToken);

// Validation pour la création de rendez-vous
const validateRendezVous = [
  body('patientId')
    .notEmpty()
    .withMessage('ID du patient requis')
    .isUUID()
    .withMessage('ID du patient invalide'),
  body('dateRendezVous')
    .notEmpty()
    .withMessage('Date du rendez-vous requise')
    .isISO8601()
    .withMessage('Format de date invalide'),
  body('duree')
    .optional()
    .isInt({ min: 15, max: 180 })
    .withMessage('Durée doit être entre 15 et 180 minutes'),
  body('motif')
    .notEmpty()
    .withMessage('Motif du rendez-vous requis')
    .isLength({ min: 5, max: 500 })
    .withMessage('Le motif doit faire entre 5 et 500 caractères')
];

// Validation pour la mise à jour de statut
const validateStatut = [
  body('statut')
    .notEmpty()
    .withMessage('Statut requis')
    .isIn(['CONFIRME', 'ANNULE', 'TERMINE'])
    .withMessage('Statut invalide'),
  body('notes')
    .optional()
    .isLength({ max: 1000 })
    .withMessage('Les notes ne peuvent pas dépasser 1000 caractères')
];

/**
 * @swagger
 * /api/rendez-vous:
 *   post:
 *     summary: Créer un rendez-vous (médecins uniquement)
 *     tags: [Rendez-vous]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - patientId
 *               - dateRendezVous
 *               - motif
 *             properties:
 *               patientId:
 *                 type: string
 *                 format: uuid
 *               dateRendezVous:
 *                 type: string
 *                 format: date-time
 *               duree:
 *                 type: integer
 *                 minimum: 15
 *                 maximum: 180
 *               motif:
 *                 type: string
 *                 minLength: 5
 *                 maxLength: 500
 *     responses:
 *       201:
 *         description: Rendez-vous créé
 */
router.post('/', requireRole(['DOCTOR']), validateRendezVous, rendezVousController.creerRendezVous);

/**
 * @swagger
 * /api/rendez-vous:
 *   get:
 *     summary: Obtenir la liste des rendez-vous
 *     tags: [Rendez-vous]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Liste des rendez-vous
 */
router.get('/', rendezVousController.obtenirRendezVous);

/**
 * @swagger
 * /api/rendez-vous/{rdvId}/statut:
 *   patch:
 *     summary: Mettre à jour le statut d'un rendez-vous
 *     tags: [Rendez-vous]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: rdvId
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
 *               - statut
 *             properties:
 *               statut:
 *                 type: string
 *                 enum: [CONFIRME, ANNULE, TERMINE]
 *               notes:
 *                 type: string
 *                 maxLength: 1000
 *     responses:
 *       200:
 *         description: Statut mis à jour
 */
router.patch('/:rdvId/statut', validateStatut, rendezVousController.mettreAJourStatut);

/**
 * @swagger
 * /api/rendez-vous/{rdvId}/annuler:
 *   patch:
 *     summary: Annuler un rendez-vous
 *     tags: [Rendez-vous]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: rdvId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Rendez-vous annulé
 */
router.patch('/:rdvId/annuler', rendezVousController.annulerRendezVous);

module.exports = router;