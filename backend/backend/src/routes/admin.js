const express = require('express');
const AdminController = require('../controllers/adminController');
const validationMiddleware = require('../middleware/validation');
const { ValidationService } = require('../utils/validators');
const { requireAdmin } = require('../middleware/auth');

const router = express.Router();

// Toutes les routes admin nécessitent une authentification admin
router.use(requireAdmin);

/**
 * @swagger
 * /api/admin/doctors/pending:
 *   get:
 *     summary: Obtenir la liste des médecins en attente de validation
 *     tags: [Administration]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Liste des médecins en attente
 */
router.get('/doctors/pending',
  validationMiddleware.validatePagination,
  validationMiddleware.sanitizeSearch,
  AdminController.getPendingDoctors
);

/**
 * @swagger
 * /api/admin/doctors:
 *   get:
 *     summary: Obtenir la liste de tous les médecins
 *     tags: [Administration]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [ACTIVE, PENDING, APPROVED, REJECTED, BLOCKED]
 *       - in: query
 *         name: specialty
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Liste de tous les médecins
 */
router.get('/doctors',
  validationMiddleware.validatePagination,
  validationMiddleware.sanitizeSearch,
  AdminController.getAllDoctors
);

/**
 * @swagger
 * /api/admin/doctors/{doctorId}/validate:
 *   post:
 *     summary: Valider ou rejeter une candidature de médecin
 *     tags: [Administration]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: doctorId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID du médecin
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - action
 *             properties:
 *               action:
 *                 type: string
 *                 enum: [approve, reject]
 *                 example: approve
 *               rejectionReason:
 *                 type: string
 *                 minLength: 10
 *                 maxLength: 500
 *                 description: Requis si action = reject
 *                 example: Documents incomplets ou non conformes
 *     responses:
 *       200:
 *         description: Action effectuée avec succès
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Success'
 *       400:
 *         description: Erreur de validation ou action invalide
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post('/doctors/:doctorId/validate',
  validationMiddleware.validateUuidParam('doctorId'),
  validationMiddleware.validateDoctorAction,
  AdminController.validateDoctor
);

/**
 * @swagger
 * /api/admin/users:
 *   get:
 *     summary: Obtenir la liste de tous les utilisateurs
 *     tags: [Administration]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *       - in: query
 *         name: role
 *         schema:
 *           type: string
 *           enum: [PATIENT, DOCTOR, ADMIN]
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [ACTIVE, PENDING, APPROVED, REJECTED, BLOCKED]
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Liste des utilisateurs
 */
router.get('/users',
  validationMiddleware.validatePagination,
  validationMiddleware.validateUserFilters,
  validationMiddleware.sanitizeSearch,
  AdminController.getAllUsers
);

/**
 * @swagger
 * /api/admin/users/{userId}:
 *   get:
 *     summary: Obtenir les détails complets d'un utilisateur
 *     tags: [Administration]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID de l'utilisateur
 *     responses:
 *       200:
 *         description: Détails de l'utilisateur
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                       format: uuid
 *                     email:
 *                       type: string
 *                     firstName:
 *                       type: string
 *                     lastName:
 *                       type: string
 *                     role:
 *                       type: string
 *                       enum: [PATIENT, DOCTOR, ADMIN]
 *                     status:
 *                       type: string
 *                     doctorInfo:
 *                       type: object
 *                       nullable: true
 *                       description: Informations supplémentaires si c'est un médecin
 *       404:
 *         description: Utilisateur non trouvé
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/users/:userId',
  validationMiddleware.validateUuidParam('userId'),
  AdminController.getUserDetails
);

/**
 * @swagger
 * /api/admin/users/{userId}/status:
 *   post:
 *     summary: Changer le statut d'un utilisateur (activer/désactiver)
 *     tags: [Administration]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
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
 *               - status
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [ACTIVE, BLOCKED]
 *     responses:
 *       200:
 *         description: Statut modifié avec succès
 */
router.post('/users/:userId/status',
  validationMiddleware.validateUuidParam('userId'),
  ValidationService.validateMiddleware(
    require('joi').object({
      status: require('joi').string().valid('ACTIVE', 'BLOCKED').required()
    }),
    'body'
  ),
  AdminController.changeUserStatus
);

/**
 * @swagger
 * /api/admin/stats:
 *   get:
 *     summary: Obtenir les statistiques du système
 *     tags: [Administration]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Statistiques du système
 */
router.get('/stats',
  AdminController.getSystemStats
);

module.exports = router;