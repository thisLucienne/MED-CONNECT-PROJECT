const express = require('express');
const AuthController = require('../controllers/authController');
const validationMiddleware = require('../middleware/validation');
const { ValidationService } = require('../utils/validators');
const { uploadOptionalProfilePicture } = require('../middleware/upload');
const { authenticateToken, optionalAuth } = require('../middleware/auth');

const router = express.Router();

/**
 * @swagger
 * /api/auth/register/patient:
 *   post:
 *     summary: Inscription d'un nouveau patient
 *     tags: [Authentification]
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - firstName
 *               - lastName
 *               - email
 *               - password
 *             properties:
 *               firstName:
 *                 type: string
 *                 example: John
 *               lastName:
 *                 type: string
 *                 example: Doe
 *               email:
 *                 type: string
 *                 format: email
 *                 example: john@example.com
 *               password:
 *                 type: string
 *                 format: password
 *                 example: StrongPass123!
 *                 description: Minimum 8 caractères, 1 majuscule, 1 minuscule, 1 chiffre, 1 caractère spécial
 *               phone:
 *                 type: string
 *                 example: "6 12 34 56 78"
 *                 description: Format camerounais (optionnel)
 *               profilePicture:
 *                 type: string
 *                 format: binary
 *                 description: Photo de profil (optionnel, JPG/PNG/WEBP, max 5MB)
 *     responses:
 *       201:
 *         description: Inscription réussie
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Inscription réussie ! Bienvenue sur Med Connect.
 *                 data:
 *                   type: object
 *                   properties:
 *                     user:
 *                       $ref: '#/components/schemas/User'
 *                     tokens:
 *                       type: object
 *                       properties:
 *                         accessToken:
 *                           type: string
 *                         refreshToken:
 *                           type: string
 *       400:
 *         description: Erreur de validation
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post('/register/patient',
  uploadOptionalProfilePicture,
  validationMiddleware.validatePatientRegistration,
  AuthController.registerPatient
);

/**
 * @swagger
 * /api/auth/register/doctor:
 *   post:
 *     summary: Inscription d'un médecin (candidature en attente de validation)
 *     tags: [Authentification]
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - firstName
 *               - lastName
 *               - email
 *               - password
 *               - specialty
 *               - licenseNumber
 *             properties:
 *               firstName:
 *                 type: string
 *                 example: Dr. Jane
 *               lastName:
 *                 type: string
 *                 example: Smith
 *               email:
 *                 type: string
 *                 format: email
 *                 example: jane.smith@example.com
 *               password:
 *                 type: string
 *                 format: password
 *                 example: StrongPass123!
 *               phone:
 *                 type: string
 *                 example: "6 12 34 56 78"
 *               specialty:
 *                 type: string
 *                 example: Cardiologie
 *               licenseNumber:
 *                 type: string
 *                 example: MED-12345
 *               profilePicture:
 *                 type: string
 *                 format: binary
 *     responses:
 *       201:
 *         description: Candidature soumise avec succès
 *       400:
 *         description: Erreur de validation
 */
router.post('/register/doctor',
  uploadOptionalProfilePicture,
  validationMiddleware.validateDoctorRegistration,
  AuthController.registerDoctor
);

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Connexion utilisateur
 *     tags: [Authentification]
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: user@example.com
 *               password:
 *                 type: string
 *                 format: password
 *                 example: StrongPass123!
 *     responses:
 *       200:
 *         description: Connexion réussie (admin) ou code 2FA requis (patient/médecin)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *                   properties:
 *                     user:
 *                       $ref: '#/components/schemas/User'
 *                     requiresVerification:
 *                       type: boolean
 *                       description: true si un code 2FA est requis
 *                     tokens:
 *                       type: object
 *                       description: Présent uniquement pour les admins
 *       401:
 *         description: Identifiants incorrects
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post('/login',
  validationMiddleware.validateLogin,
  AuthController.login
);

/**
 * @swagger
 * /api/auth/verify-2fa:
 *   post:
 *     summary: Vérifier le code 2FA
 *     tags: [Authentification]
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - userId
 *               - code
 *             properties:
 *               userId:
 *                 type: string
 *                 format: uuid
 *               code:
 *                 type: string
 *                 pattern: '^[0-9]{4}$'
 *                 example: "1234"
 *     responses:
 *       200:
 *         description: Vérification réussie
 *       400:
 *         description: Code invalide
 */
router.post('/verify-2fa',
  validationMiddleware.validateTwoFactorAuth,
  AuthController.verify2FA
);

/**
 * @swagger
 * /api/auth/resend-2fa:
 *   post:
 *     summary: Demander un nouveau code 2FA
 *     tags: [Authentification]
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - userId
 *             properties:
 *               userId:
 *                 type: string
 *                 format: uuid
 *     responses:
 *       200:
 *         description: Nouveau code envoyé
 */
router.post('/resend-2fa',
  ValidationService.validateMiddleware(
    require('../utils/validators').validationSchemas.requestNew2FA,
    'body'
  ),
  AuthController.resend2FA
);

/**
 * @swagger
 * /api/auth/refresh:
 *   post:
 *     summary: Rafraîchir les tokens d'accès
 *     tags: [Authentification]
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - refreshToken
 *             properties:
 *               refreshToken:
 *                 type: string
 *     responses:
 *       200:
 *         description: Tokens rafraîchis
 *       401:
 *         description: Token invalide
 */
router.post('/refresh',
  validationMiddleware.validateRefreshToken,
  AuthController.refreshToken
);

/**
 * @swagger
 * /api/auth/logout:
 *   post:
 *     summary: Déconnexion utilisateur
 *     tags: [Authentification]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               refreshToken:
 *                 type: string
 *     responses:
 *       200:
 *         description: Déconnexion réussie
 */
router.post('/logout',
  optionalAuth, // Optionnel car l'utilisateur peut être déjà déconnecté côté client
  AuthController.logout
);

/**
 * @swagger
 * /api/auth/profile:
 *   get:
 *     summary: Obtenir le profil de l'utilisateur connecté
 *     tags: [Authentification]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Profil utilisateur
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
 *                     user:
 *                       $ref: '#/components/schemas/User'
 *       401:
 *         description: Non authentifié
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/profile',
  authenticateToken,
  AuthController.getProfile
);

/**
 * @swagger
 * /api/auth/profile:
 *   put:
 *     summary: Mettre à jour le profil utilisateur
 *     tags: [Authentification]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               firstName:
 *                 type: string
 *                 example: John
 *               lastName:
 *                 type: string
 *                 example: Doe
 *               phone:
 *                 type: string
 *                 example: "6 12 34 56 78"
 *               profilePicture:
 *                 type: string
 *                 format: binary
 *                 description: Photo de profil (optionnel, JPG/PNG/WEBP, max 5MB)
 *     responses:
 *       200:
 *         description: Profil mis à jour avec succès
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Success'
 *       400:
 *         description: Erreur de validation
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.put('/profile',
  authenticateToken,
  uploadOptionalProfilePicture,
  validationMiddleware.validateProfileUpdate,
  AuthController.updateProfile
);

/**
 * @swagger
 * /api/auth/verify-token:
 *   get:
 *     summary: Vérifier la validité d'un token
 *     tags: [Authentification]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Token valide
 *       401:
 *         description: Token invalide
 */
router.get('/verify-token',
  authenticateToken,
  AuthController.verifyToken
);

/**
 * @swagger
 * /api/auth/stats:
 *   get:
 *     summary: Obtenir les statistiques de l'utilisateur connecté
 *     tags: [Authentification]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Statistiques utilisateur
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
 *                     totalVisits:
 *                       type: integer
 *                     totalReports:
 *                       type: integer
 *                     totalMessages:
 *                       type: integer
 *                     connectedDoctors:
 *                       type: integer
 *       401:
 *         description: Non authentifié
 */
router.get('/stats',
  authenticateToken,
  AuthController.getUserStats
);

module.exports = router;