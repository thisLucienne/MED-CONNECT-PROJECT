const express = require('express');
const router = express.Router();
const messageController = require('../controllers/messageController');
const { authenticateToken, requireRole } = require('../middleware/auth');
const { body } = require('express-validator');

// Middleware d'authentification pour toutes les routes
router.use(authenticateToken);

// Validation pour l'envoi de message
const validateMessage = [
  body('destinataireId')
    .notEmpty()
    .withMessage('ID du destinataire requis')
    .isUUID()
    .withMessage('ID du destinataire invalide'),
  body('contenu')
    .notEmpty()
    .withMessage('Contenu du message requis')
    .isLength({ min: 1, max: 2000 })
    .withMessage('Le contenu doit faire entre 1 et 2000 caractères'),
  body('objet')
    .optional()
    .isLength({ max: 200 })
    .withMessage('L\'objet ne peut pas dépasser 200 caractères')
];

/**
 * @swagger
 * /api/messages:
 *   post:
 *     summary: Envoyer un message
 *     tags: [Messages]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - destinataireId
 *               - contenu
 *             properties:
 *               destinataireId:
 *                 type: string
 *                 format: uuid
 *               contenu:
 *                 type: string
 *                 minLength: 1
 *                 maxLength: 2000
 *               objet:
 *                 type: string
 *                 maxLength: 200
 *     responses:
 *       201:
 *         description: Message envoyé avec succès
 */
router.post('/', validateMessage, messageController.envoyerMessage);

/**
 * @swagger
 * /api/messages/conversations:
 *   get:
 *     summary: Obtenir la liste des conversations
 *     tags: [Messages]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Liste des conversations
 */
router.get('/conversations', messageController.obtenirConversations);

/**
 * @swagger
 * /api/messages/conversations/{autreUtilisateurId}:
 *   get:
 *     summary: Obtenir une conversation avec un utilisateur
 *     tags: [Messages]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: autreUtilisateurId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limite
 *         schema:
 *           type: integer
 *           default: 50
 *     responses:
 *       200:
 *         description: Messages de la conversation
 */
router.get('/conversations/:autreUtilisateurId', messageController.obtenirConversation);

/**
 * @swagger
 * /api/messages/{messageId}/lu:
 *   patch:
 *     summary: Marquer un message comme lu
 *     tags: [Messages]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: messageId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Message marqué comme lu
 */
router.patch('/:messageId/lu', messageController.marquerCommeLu);

/**
 * @swagger
 * /api/messages/medecins/recherche:
 *   get:
 *     summary: Rechercher des médecins (patients uniquement)
 *     tags: [Messages]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: specialite
 *         schema:
 *           type: string
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Liste des médecins trouvés
 */
router.get('/medecins/recherche', requireRole(['PATIENT']), messageController.rechercherMedecins);

module.exports = router;