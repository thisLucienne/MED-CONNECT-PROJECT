const express = require('express');
const router = express.Router();
const medecinController = require('../controllers/medecinController');
const { authenticateToken } = require('../middleware/auth');

// Middleware d'authentification pour toutes les routes
router.use(authenticateToken);

/**
 * @swagger
 * /api/medecins/specialites:
 *   get:
 *     summary: Obtenir toutes les spécialités disponibles
 *     tags: [Médecins]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Liste des spécialités
 */
router.get('/specialites', medecinController.obtenirSpecialites);

/**
 * @swagger
 * /api/medecins/recherche:
 *   get:
 *     summary: Rechercher des médecins
 *     tags: [Médecins]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: q
 *         required: true
 *         schema:
 *           type: string
 *           minLength: 2
 *         description: Terme de recherche
 *     responses:
 *       200:
 *         description: Liste des médecins trouvés
 */
router.get('/recherche', medecinController.rechercherMedecins);

/**
 * @swagger
 * /api/medecins/{medecinId}:
 *   get:
 *     summary: Obtenir les détails d'un médecin
 *     tags: [Médecins]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: medecinId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Détails du médecin
 */
router.get('/:medecinId', medecinController.obtenirMedecin);

/**
 * @swagger
 * /api/medecins:
 *   get:
 *     summary: Obtenir tous les médecins actifs
 *     tags: [Médecins]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limite
 *         schema:
 *           type: integer
 *           default: 20
 *     responses:
 *       200:
 *         description: Liste des médecins
 */
router.get('/', medecinController.obtenirTousMedecins);

module.exports = router;