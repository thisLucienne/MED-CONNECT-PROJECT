const express = require('express');
const router = express.Router();
const santeController = require('../controllers/santeController');
const { authenticateToken, requireRole } = require('../middleware/auth');
const { body } = require('express-validator');

// Middleware d'authentification pour toutes les routes
router.use(authenticateToken);

// Validation pour les paramètres de santé
const validateParametresSante = [
  body('groupeSanguin')
    .optional()
    .isIn(['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'])
    .withMessage('Groupe sanguin invalide'),
  body('poids')
    .optional()
    .isLength({ max: 10 })
    .withMessage('Le poids ne peut pas dépasser 10 caractères'),
  body('taille')
    .optional()
    .isLength({ max: 10 })
    .withMessage('La taille ne peut pas dépasser 10 caractères'),
  body('allergiesConnues')
    .optional()
    .isLength({ max: 1000 })
    .withMessage('Les allergies ne peuvent pas dépasser 1000 caractères'),
  body('medicamentsActuels')
    .optional()
    .isLength({ max: 1000 })
    .withMessage('Les médicaments ne peuvent pas dépasser 1000 caractères'),
  body('conditionsMedicales')
    .optional()
    .isLength({ max: 1000 })
    .withMessage('Les conditions ne peuvent pas dépasser 1000 caractères'),
  body('contactUrgence')
    .optional()
    .isLength({ max: 100 })
    .withMessage('Le contact d\'urgence ne peut pas dépasser 100 caractères'),
  body('telephoneUrgence')
    .optional()
    .matches(/^6\s\d{2}\s\d{2}\s\d{2}\s\d{2}$/)
    .withMessage('Format de téléphone invalide (ex: 6 12 34 56 78)')
];

/**
 * @swagger
 * /api/sante/tableau-de-bord:
 *   get:
 *     summary: Obtenir le tableau de bord de santé (patients uniquement)
 *     tags: [Santé]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Tableau de bord de santé
 */
router.get('/tableau-de-bord', requireRole(['PATIENT']), santeController.obtenirTableauDeBord);

/**
 * @swagger
 * /api/sante/parametres:
 *   get:
 *     summary: Obtenir les paramètres de santé (patients uniquement)
 *     tags: [Santé]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Paramètres de santé
 */
router.get('/parametres', requireRole(['PATIENT']), santeController.obtenirParametres);

/**
 * @swagger
 * /api/sante/parametres:
 *   put:
 *     summary: Mettre à jour les paramètres de santé (patients uniquement)
 *     tags: [Santé]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               groupeSanguin:
 *                 type: string
 *                 enum: [A+, A-, B+, B-, AB+, AB-, O+, O-]
 *               poids:
 *                 type: string
 *               taille:
 *                 type: string
 *               allergiesConnues:
 *                 type: string
 *               medicamentsActuels:
 *                 type: string
 *               conditionsMedicales:
 *                 type: string
 *               contactUrgence:
 *                 type: string
 *               telephoneUrgence:
 *                 type: string
 *     responses:
 *       200:
 *         description: Paramètres mis à jour
 */
router.put('/parametres', requireRole(['PATIENT']), validateParametresSante, santeController.mettreAJourParametres);

/**
 * @swagger
 * /api/sante/medecins-connectes:
 *   get:
 *     summary: Obtenir la liste des médecins connectés (patients uniquement)
 *     tags: [Santé]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Liste des médecins connectés
 */
router.get('/medecins-connectes', requireRole(['PATIENT']), santeController.obtenirMedecinsConnectes);

/**
 * @swagger
 * /api/sante/patients-connectes:
 *   get:
 *     summary: Obtenir la liste des patients connectés (médecins uniquement)
 *     tags: [Santé]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Liste des patients connectés
 */
router.get('/patients-connectes', requireRole(['DOCTOR']), santeController.obtenirPatientsConnectes);

module.exports = router;