const express = require('express');
const router = express.Router();
const notificationController = require('../controllers/notificationController');
const { authenticateToken } = require('../middleware/auth');

// Middleware d'authentification pour toutes les routes
router.use(authenticateToken);

/**
 * @swagger
 * /api/notifications:
 *   get:
 *     summary: Obtenir la liste des notifications
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Liste des notifications
 */
router.get('/', notificationController.obtenirNotifications);

/**
 * @swagger
 * /api/notifications/count:
 *   get:
 *     summary: Compter les notifications non lues
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Nombre de notifications non lues
 */
router.get('/count', notificationController.compterNotificationsNonLues);

/**
 * @swagger
 * /api/notifications/{notificationId}/lu:
 *   patch:
 *     summary: Marquer une notification comme lue
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: notificationId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Notification marquée comme lue
 */
router.patch('/:notificationId/lu', notificationController.marquerCommeLue);

/**
 * @swagger
 * /api/notifications/marquer-toutes-lues:
 *   patch:
 *     summary: Marquer toutes les notifications comme lues
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Toutes les notifications marquées comme lues
 */
router.patch('/marquer-toutes-lues', notificationController.marquerToutesCommeLues);

/**
 * @swagger
 * /api/notifications/{notificationId}:
 *   delete:
 *     summary: Supprimer une notification
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: notificationId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Notification supprimée
 */
router.delete('/:notificationId', notificationController.supprimerNotification);

module.exports = router;