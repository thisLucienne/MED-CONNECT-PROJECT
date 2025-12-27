const express = require('express');
const router = express.Router();
const connexionController = require('../controllers/connexionController');
const { authenticateToken, requireRole } = require('../middleware/auth');
const { body } = require('express-validator');

// Middleware d'authentification pour toutes les routes
router.use(authenticateToken);

// Validation pour l'envoi de demande
const validateDemandeConnexion = [
  body('medecinId')
    .notEmpty()
    .withMessage('ID du médecin requis')
    .isUUID()
    .withMessage('ID du médecin invalide'),
  body('message')
    .optional()
    .isLength({ max: 500 })
    .withMessage('Le message ne peut pas dépasser 500 caractères')
];

// Validation pour la réponse
const validateReponse = [
  body('reponse')
    .notEmpty()
    .withMessage('Réponse requise')
    .isIn(['accepter', 'refuser'])
    .withMessage('Réponse invalide'),
  body('raisonRefus')
    .optional()
    .isLength({ max: 500 })
    .withMessage('La raison ne peut pas dépasser 500 caractères')
];

/**
 * @swagger
 * /api/connexions/demandes:
 *   post:
 *     summary: Envoyer une demande de connexion à un médecin (patients uniquement)
 *     tags: [Connexions]
 *     security:
 *       - bearerAuth: []
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
 *               message:
 *                 type: string
 *                 maxLength: 500
 *     responses:
 *       201:
 *         description: Demande envoyée
 */
router.post('/demandes', requireRole(['PATIENT']), validateDemandeConnexion, connexionController.envoyerDemande);

/**
 * @swagger
 * /api/connexions/demandes/{demandeId}/repondre:
 *   post:
 *     summary: Répondre à une demande de connexion (médecins uniquement)
 *     tags: [Connexions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: demandeId
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
 *               - reponse
 *             properties:
 *               reponse:
 *                 type: string
 *                 enum: [accepter, refuser]
 *               raisonRefus:
 *                 type: string
 *                 maxLength: 500
 *     responses:
 *       200:
 *         description: Réponse enregistrée
 */
router.post('/demandes/:demandeId/repondre', requireRole(['DOCTOR']), validateReponse, connexionController.repondreDemande);

/**
 * @swagger
 * /api/connexions/demandes/medecin:
 *   get:
 *     summary: Obtenir les demandes de connexion reçues (médecins uniquement)
 *     tags: [Connexions]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Liste des demandes reçues
 */
router.get('/demandes/medecin', requireRole(['DOCTOR']), connexionController.obtenirDemandesMedecin);

/**
 * @swagger
 * /api/connexions/demandes/patient:
 *   get:
 *     summary: Obtenir les demandes de connexion envoyées (patients uniquement)
 *     tags: [Connexions]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Liste des demandes envoyées
 */
router.get('/demandes/patient', requireRole(['PATIENT']), connexionController.obtenirDemandesPatient);

module.exports = router;