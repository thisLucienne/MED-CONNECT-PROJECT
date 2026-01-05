const express = require('express');
const PatientController = require('../controllers/patientController');
const { authenticateToken, requireRole } = require('../middleware/auth');

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Patients
 *   description: Endpoints pour les patients
 */

/**
 * @swagger
 * /api/patients/profile:
 *   get:
 *     summary: Obtenir le profil du patient connecté
 *     tags: [Patients]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Profil du patient récupéré avec succès
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                     email:
 *                       type: string
 *                     firstName:
 *                       type: string
 *                     lastName:
 *                       type: string
 *                     phone:
 *                       type: string
 *                     profilePicture:
 *                       type: string
 *                     role:
 *                       type: string
 *                       example: PATIENT
 *                     status:
 *                       type: string
 *                     isActive2FA:
 *                       type: boolean
 *                     lastConnection:
 *                       type: string
 *                       format: date-time
 *                     createdAt:
 *                       type: string
 *                       format: date-time
 *       401:
 *         description: Token d'authentification requis
 *       404:
 *         description: Patient introuvable
 */
router.get('/profile', authenticateToken, requireRole(['PATIENT']), PatientController.getProfile);

/**
 * @swagger
 * /api/patients/profile:
 *   put:
 *     summary: Mettre à jour le profil du patient connecté
 *     tags: [Patients]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               firstName:
 *                 type: string
 *               lastName:
 *                 type: string
 *               phone:
 *                 type: string
 *               profilePicture:
 *                 type: string
 *     responses:
 *       200:
 *         description: Profil mis à jour avec succès
 *       400:
 *         description: Données invalides
 *       401:
 *         description: Token d'authentification requis
 */
router.put('/profile', authenticateToken, requireRole(['PATIENT']), PatientController.updateProfile);

/**
 * @swagger
 * /api/patients/dashboard:
 *   get:
 *     summary: Obtenir les données du dashboard patient
 *     tags: [Patients]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Données du dashboard récupérées avec succès
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     totalRecords:
 *                       type: number
 *                     unreadMessages:
 *                       type: number
 *                     totalDoctors:
 *                       type: number
 *                     pendingAppointments:
 *                       type: number
 *                     recentActivity:
 *                       type: array
 *                       items:
 *                         type: object
 *                     quickStats:
 *                       type: object
 *                       properties:
 *                         lastConnection:
 *                           type: string
 *                           format: date-time
 *                         accountCreated:
 *                           type: string
 *                           format: date-time
 *                         profileComplete:
 *                           type: number
 *       401:
 *         description: Token d'authentification requis
 */
router.get('/dashboard', authenticateToken, requireRole(['PATIENT']), PatientController.getDashboard);

/**
 * @swagger
 * /api/patients/doctors:
 *   get:
 *     summary: Obtenir la liste des médecins disponibles
 *     tags: [Patients]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Numéro de page
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Nombre d'éléments par page
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Terme de recherche
 *       - in: query
 *         name: specialty
 *         schema:
 *           type: string
 *         description: Filtrer par spécialité
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *           default: firstName
 *         description: Champ de tri
 *       - in: query
 *         name: sortOrder
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *           default: asc
 *         description: Ordre de tri
 *     responses:
 *       200:
 *         description: Liste des médecins récupérée avec succès
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     doctors:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: string
 *                           userId:
 *                             type: string
 *                           firstName:
 *                             type: string
 *                           lastName:
 *                             type: string
 *                           email:
 *                             type: string
 *                           phone:
 *                             type: string
 *                           profilePicture:
 *                             type: string
 *                           specialty:
 *                             type: string
 *                           licenseNumber:
 *                             type: string
 *                     pagination:
 *                       type: object
 *                       properties:
 *                         page:
 *                           type: number
 *                         limit:
 *                           type: number
 *                         total:
 *                           type: number
 *                         totalPages:
 *                           type: number
 *                         hasNext:
 *                           type: boolean
 *                         hasPrev:
 *                           type: boolean
 *       401:
 *         description: Token d'authentification requis
 */
router.get('/doctors', authenticateToken, requireRole(['PATIENT']), PatientController.getAvailableDoctors);

/**
 * @swagger
 * /api/patients/doctors/search:
 *   get:
 *     summary: Rechercher des médecins
 *     tags: [Patients]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: q
 *         required: true
 *         schema:
 *           type: string
 *         description: Terme de recherche (nom, prénom, spécialité)
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Numéro de page
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Nombre d'éléments par page
 *     responses:
 *       200:
 *         description: Résultats de recherche récupérés avec succès
 *       400:
 *         description: Paramètre de recherche manquant
 *       401:
 *         description: Token d'authentification requis
 */
router.get('/doctors/search', authenticateToken, requireRole(['PATIENT']), PatientController.searchDoctors);

/**
 * @swagger
 * /api/patients/specialties:
 *   get:
 *     summary: Obtenir la liste des spécialités médicales disponibles
 *     tags: [Patients]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Liste des spécialités récupérée avec succès
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     specialties:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           name:
 *                             type: string
 *                           doctorCount:
 *                             type: number
 *       401:
 *         description: Token d'authentification requis
 */
router.get('/specialties', authenticateToken, requireRole(['PATIENT']), PatientController.getSpecialties);

module.exports = router;