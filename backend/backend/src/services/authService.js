const { db } = require('../config/database');
const { users, doctors, twoFactorCodes, refreshTokens } = require('../db/schema');
const { eq, and, lt, gt } = require('drizzle-orm');
const CryptoUtils = require('../utils/crypto');
const JWTUtils = require('../utils/jwt');
const EmailService = require('./emailService');
const UploadService = require('./uploadService');

class AuthService {
  /**
   * Inscrire un nouveau patient
   * @param {Object} userData - Données du patient
   * @param {Object} profilePicture - Fichier de photo de profil (optionnel)
   * @returns {Promise<Object>} Résultat de l'inscription
   */
  static async registerPatient(userData, profilePicture = null) {
    try {
      // Vérifier si l'email existe déjà
      const existingUser = await db.select().from(users).where(eq(users.email, userData.email)).limit(1);
      
      if (existingUser.length > 0) {
        return {
          success: false,
          error: 'Un compte avec cet email existe déjà'
        };
      }

      // Hacher le mot de passe
      const hashedPassword = await CryptoUtils.hashPassword(userData.password);

      // Uploader la photo de profil si fournie
      let profilePictureUrl = null;
      if (profilePicture) {
        const uploadResult = await UploadService.uploadProfilePicture(
          profilePicture.buffer,
          `temp_${Date.now()}`
        );
        
        if (uploadResult.success) {
          profilePictureUrl = uploadResult.data.url;
        }
      }

      // Créer l'utilisateur
      const newUser = await db.insert(users).values({
        email: userData.email,
        password: hashedPassword,
        firstName: userData.firstName,
        lastName: userData.lastName,
        phone: userData.phone || null,
        profilePicture: profilePictureUrl,
        role: 'PATIENT',
        status: 'ACTIVE',
        isActive2FA: true,
        isVerified: false // Le compte n'est pas encore vérifié
      }).returning();

      const user = newUser[0];

      // Générer et envoyer le code de vérification pour l'inscription
      const code2FA = await this.generate2FACode(user.id);
      
      if (!code2FA.success) {
        return {
          success: false,
          error: 'Erreur lors de l\'envoi du code de vérification'
        };
      }

      // Envoyer l'email de bienvenue
      await EmailService.sendWelcomeEmail(user);

      return {
        success: true,
        data: {
          user: {
            id: user.id,
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName,
            phone: user.phone,
            profilePicture: user.profilePicture,
            role: user.role,
            status: user.status,
            requiresVerification: true
          },
          message: 'Inscription réussie ! Un code de vérification a été envoyé à votre email.'
        }
      };

    } catch (error) {
      console.error('Erreur inscription patient:', error);
      return {
        success: false,
        error: 'Erreur lors de l\'inscription'
      };
    }
  }

  /**
   * Inscrire un nouveau médecin (candidature)
   * @param {Object} userData - Données du médecin
   * @param {Object} profilePicture - Fichier de photo de profil (optionnel)
   * @returns {Promise<Object>} Résultat de l'inscription
   */
  static async registerDoctor(userData, profilePicture = null) {
    try {
      // Vérifier si l'email existe déjà
      const existingUser = await db.select().from(users).where(eq(users.email, userData.email)).limit(1);
      
      if (existingUser.length > 0) {
        return {
          success: false,
          error: 'Un compte avec cet email existe déjà'
        };
      }

      // Vérifier si le numéro d'ordre existe déjà
      const existingDoctor = await db.select().from(doctors).where(eq(doctors.licenseNumber, userData.licenseNumber)).limit(1);
      
      if (existingDoctor.length > 0) {
        return {
          success: false,
          error: 'Un médecin avec ce numéro d\'ordre existe déjà'
        };
      }

      // Hacher le mot de passe
      const hashedPassword = await CryptoUtils.hashPassword(userData.password);

      // Uploader la photo de profil si fournie
      let profilePictureUrl = null;
      if (profilePicture) {
        const uploadResult = await UploadService.uploadProfilePicture(
          profilePicture.buffer,
          `temp_${Date.now()}`
        );
        
        if (uploadResult.success) {
          profilePictureUrl = uploadResult.data.url;
        }
      }

      // Créer l'utilisateur avec statut PENDING
      const newUser = await db.insert(users).values({
        email: userData.email,
        password: hashedPassword,
        firstName: userData.firstName,
        lastName: userData.lastName,
        phone: userData.phone || null,
        profilePicture: profilePictureUrl,
        role: 'DOCTOR',
        status: 'PENDING',
        isActive2FA: true,
        isVerified: false // Le compte n'est pas encore vérifié
      }).returning();

      const user = newUser[0];

      // Créer le profil médecin
      await db.insert(doctors).values({
        userId: user.id,
        specialty: userData.specialty,
        licenseNumber: userData.licenseNumber
      });

      // Envoyer l'email de confirmation de candidature
      await EmailService.sendDoctorApplicationConfirmation({
        ...user,
        specialty: userData.specialty,
        licenseNumber: userData.licenseNumber
      });

      // Notifier les admins
      const admins = await db.select().from(users).where(eq(users.role, 'ADMIN'));
      const adminEmails = admins.map(admin => admin.email);
      
      if (adminEmails.length > 0) {
        await EmailService.sendAdminNotification({
          ...user,
          specialty: userData.specialty,
          licenseNumber: userData.licenseNumber
        }, adminEmails);
      }

      return {
        success: true,
        data: {
          user: {
            id: user.id,
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName,
            phone: user.phone,
            profilePicture: user.profilePicture,
            role: user.role,
            status: user.status
          },
          message: 'Candidature soumise avec succès. Vous recevrez un email une fois la validation terminée.'
        }
      };

    } catch (error) {
      console.error('Erreur inscription médecin:', error);
      return {
        success: false,
        error: 'Erreur lors de l\'inscription'
      };
    }
  }

  /**
   * Connexion utilisateur (première étape)
   * @param {string} email - Email de l'utilisateur
   * @param {string} password - Mot de passe
   * @returns {Promise<Object>} Résultat de la connexion
   */
  static async login(email, password) {
    try {
      // Trouver l'utilisateur
      const user = await db.select().from(users).where(eq(users.email, email)).limit(1);
      
      if (user.length === 0) {
        return {
          success: false,
          error: 'Email ou mot de passe incorrect'
        };
      }

      const userData = user[0];

      // Vérifier si le compte est bloqué
      if (userData.lockedUntil && new Date() < new Date(userData.lockedUntil)) {
        const remainingTime = Math.ceil((new Date(userData.lockedUntil) - new Date()) / (1000 * 60));
        return {
          success: false,
          error: `Compte temporairement bloqué. Réessayez dans ${remainingTime} minutes.`
        };
      }

      // Vérifier le mot de passe
      const isPasswordValid = await CryptoUtils.verifyPassword(password, userData.password);
      
      if (!isPasswordValid) {
        // Incrémenter les tentatives de connexion
        const attempts = parseInt(userData.loginAttempts || '0') + 1;
        const maxAttempts = parseInt(process.env.MAX_LOGIN_ATTEMPTS) || 3;
        
        if (attempts >= maxAttempts) {
          const lockoutTime = parseInt(process.env.LOCKOUT_TIME_MINUTES) || 30;
          const lockedUntil = new Date(Date.now() + lockoutTime * 60 * 1000);
          
          await db.update(users)
            .set({ 
              loginAttempts: attempts.toString(),
              lockedUntil: lockedUntil
            })
            .where(eq(users.id, userData.id));
          
          return {
            success: false,
            error: `Trop de tentatives échouées. Compte bloqué pour ${lockoutTime} minutes.`
          };
        } else {
          await db.update(users)
            .set({ loginAttempts: attempts.toString() })
            .where(eq(users.id, userData.id));
          
          return {
            success: false,
            error: `Email ou mot de passe incorrect. ${maxAttempts - attempts} tentative(s) restante(s).`
          };
        }
      }

      // Vérifier le statut du compte
      if (userData.status === 'PENDING') {
        return {
          success: false,
          error: 'Votre compte est en attente de validation par un administrateur.'
        };
      }

      if (userData.status === 'REJECTED') {
        return {
          success: false,
          error: 'Votre candidature a été rejetée. Contactez le support pour plus d\'informations.'
        };
      }

      if (userData.status === 'BLOCKED') {
        return {
          success: false,
          error: 'Votre compte a été bloqué. Contactez le support.'
        };
      }

      // Réinitialiser les tentatives de connexion
      await db.update(users)
        .set({ 
          loginAttempts: '0',
          lockedUntil: null,
          lastConnection: new Date()
        })
        .where(eq(users.id, userData.id));

      // Si c'est un admin, pas de 2FA
      if (userData.role === 'ADMIN') {
        const tokens = JWTUtils.generateTokenPair(userData);
        
        // Stocker le refresh token
        await db.insert(refreshTokens).values({
          userId: userData.id,
          token: tokens.refreshToken,
          expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
        });

        return {
          success: true,
          data: {
            user: {
              id: userData.id,
              email: userData.email,
              firstName: userData.firstName,
              lastName: userData.lastName,
              phone: userData.phone,
              profilePicture: userData.profilePicture,
              role: userData.role,
              status: userData.status,
              isVerified: true
            },
            tokens
          }
        };
      }

      // Si le compte est déjà vérifié, connexion directe
      if (userData.isVerified) {
        const tokens = JWTUtils.generateTokenPair(userData);
        
        // Stocker le refresh token
        await db.insert(refreshTokens).values({
          userId: userData.id,
          token: tokens.refreshToken,
          expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
        });

        return {
          success: true,
          data: {
            user: {
              id: userData.id,
              email: userData.email,
              firstName: userData.firstName,
              lastName: userData.lastName,
              phone: userData.phone,
              profilePicture: userData.profilePicture,
              role: userData.role,
              status: userData.status,
              isVerified: true,
              lastConnection: new Date()
            },
            tokens
          }
        };
      }

      // Pour les comptes non vérifiés, générer un code 2FA
      const code2FA = await this.generate2FACode(userData.id);
      
      if (!code2FA.success) {
        return {
          success: false,
          error: 'Erreur lors de la génération du code de vérification'
        };
      }

      return {
        success: true,
        data: {
          user: {
            id: userData.id,
            email: userData.email,
            firstName: userData.firstName,
            lastName: userData.lastName,
            role: userData.role,
            requiresVerification: true
          },
          message: 'Code de vérification envoyé par email'
        }
      };

    } catch (error) {
      console.error('Erreur connexion:', error);
      return {
        success: false,
        error: 'Erreur lors de la connexion'
      };
    }
  }

  /**
   * Générer et envoyer un code 2FA
   * @param {string} userId - ID de l'utilisateur
   * @returns {Promise<Object>} Résultat de la génération
   */
  static async generate2FACode(userId) {
    try {
      // Invalider les anciens codes
      await db.update(twoFactorCodes)
        .set({ isUsed: true })
        .where(and(
          eq(twoFactorCodes.userId, userId),
          eq(twoFactorCodes.isUsed, false)
        ));

      // Générer un nouveau code
      const code = CryptoUtils.generate2FACode();
      const expiresAt = CryptoUtils.get2FAExpiryDate();

      // Stocker le code
      await db.insert(twoFactorCodes).values({
        userId,
        code,
        expiresAt,
        isUsed: false,
        attempts: '0'
      });

      // Récupérer les infos utilisateur
      const user = await db.select().from(users).where(eq(users.id, userId)).limit(1);
      
      if (user.length === 0) {
        return {
          success: false,
          error: 'Utilisateur introuvable'
        };
      }

      // Envoyer le code par email
      const emailResult = await EmailService.send2FACode(user[0], code);
      
      return {
        success: emailResult.success,
        error: emailResult.success ? null : emailResult.error
      };

    } catch (error) {
      console.error('Erreur génération code 2FA:', error);
      return {
        success: false,
        error: 'Erreur lors de la génération du code'
      };
    }
  }

  /**
   * Vérifier le code 2FA et finaliser la connexion
   * @param {string} userId - ID de l'utilisateur
   * @param {string} code - Code 2FA saisi
   * @returns {Promise<Object>} Résultat de la vérification
   */
  static async verify2FA(userId, code) {
    try {
      // Trouver le code valide le plus récent
      const codeRecord = await db.select()
        .from(twoFactorCodes)
        .where(and(
          eq(twoFactorCodes.userId, userId),
          eq(twoFactorCodes.code, code),
          eq(twoFactorCodes.isUsed, false),
          gt(twoFactorCodes.expiresAt, new Date())
        ))
        .orderBy(twoFactorCodes.createdAt)
        .limit(1);

      if (codeRecord.length === 0) {
        // Incrémenter les tentatives pour tous les codes non utilisés
        const activeCodes = await db.select()
          .from(twoFactorCodes)
          .where(and(
            eq(twoFactorCodes.userId, userId),
            eq(twoFactorCodes.isUsed, false),
            gt(twoFactorCodes.expiresAt, new Date())
          ));

        if (activeCodes.length > 0) {
          const attempts = parseInt(activeCodes[0].attempts || '0') + 1;
          
          await db.update(twoFactorCodes)
            .set({ attempts: attempts.toString() })
            .where(and(
              eq(twoFactorCodes.userId, userId),
              eq(twoFactorCodes.isUsed, false)
            ));

          if (attempts >= 3) {
            // Invalider tous les codes après 3 tentatives
            await db.update(twoFactorCodes)
              .set({ isUsed: true })
              .where(and(
                eq(twoFactorCodes.userId, userId),
                eq(twoFactorCodes.isUsed, false)
              ));

            return {
              success: false,
              error: 'Trop de tentatives échouées. Veuillez vous reconnecter.'
            };
          }

          return {
            success: false,
            error: `Code incorrect. ${3 - attempts} tentative(s) restante(s).`
          };
        }

        return {
          success: false,
          error: 'Code incorrect ou expiré'
        };
      }

      // Marquer le code comme utilisé
      await db.update(twoFactorCodes)
        .set({ isUsed: true })
        .where(eq(twoFactorCodes.id, codeRecord[0].id));

      // Récupérer l'utilisateur
      const user = await db.select().from(users).where(eq(users.id, userId)).limit(1);
      
      if (user.length === 0) {
        return {
          success: false,
          error: 'Utilisateur introuvable'
        };
      }

      const userData = user[0];

      // Marquer le compte comme vérifié s'il ne l'était pas déjà
      if (!userData.isVerified) {
        await db.update(users)
          .set({ 
            isVerified: true,
            updatedAt: new Date()
          })
          .where(eq(users.id, userData.id));
      }

      // Générer les tokens
      const tokens = JWTUtils.generateTokenPair(userData);

      // Stocker le refresh token
      await db.insert(refreshTokens).values({
        userId: userData.id,
        token: tokens.refreshToken,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
      });

      return {
        success: true,
        data: {
          user: {
            id: userData.id,
            email: userData.email,
            firstName: userData.firstName,
            lastName: userData.lastName,
            phone: userData.phone,
            profilePicture: userData.profilePicture,
            role: userData.role,
            status: userData.status,
            isVerified: true
          },
          tokens
        }
      };

    } catch (error) {
      console.error('Erreur vérification 2FA:', error);
      return {
        success: false,
        error: 'Erreur lors de la vérification'
      };
    }
  }

  /**
   * Rafraîchir les tokens d'accès
   * @param {string} refreshToken - Refresh token
   * @returns {Promise<Object>} Nouveaux tokens
   */
  static async refreshToken(refreshToken) {
    try {
      // Vérifier le refresh token
      const decoded = JWTUtils.verifyToken(refreshToken);
      
      if (!JWTUtils.isRefreshToken(refreshToken)) {
        return {
          success: false,
          error: 'Token de rafraîchissement invalide'
        };
      }

      // Vérifier si le token existe en base et n'est pas révoqué
      const tokenRecord = await db.select()
        .from(refreshTokens)
        .where(and(
          eq(refreshTokens.token, refreshToken),
          eq(refreshTokens.isRevoked, false),
          gt(refreshTokens.expiresAt, new Date())
        ))
        .limit(1);

      if (tokenRecord.length === 0) {
        return {
          success: false,
          error: 'Token de rafraîchissement invalide ou expiré'
        };
      }

      // Récupérer l'utilisateur
      const user = await db.select().from(users).where(eq(users.id, decoded.userId)).limit(1);
      
      if (user.length === 0) {
        return {
          success: false,
          error: 'Utilisateur introuvable'
        };
      }

      const userData = user[0];

      // Générer de nouveaux tokens
      const newTokens = JWTUtils.generateTokenPair(userData);

      // Révoquer l'ancien refresh token
      await db.update(refreshTokens)
        .set({ isRevoked: true })
        .where(eq(refreshTokens.id, tokenRecord[0].id));

      // Stocker le nouveau refresh token
      await db.insert(refreshTokens).values({
        userId: userData.id,
        token: newTokens.refreshToken,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
      });

      return {
        success: true,
        data: {
          tokens: newTokens
        }
      };

    } catch (error) {
      console.error('Erreur refresh token:', error);
      return {
        success: false,
        error: 'Token invalide'
      };
    }
  }

  /**
   * Déconnexion utilisateur
   * @param {string} userId - ID de l'utilisateur
   * @param {string} refreshToken - Refresh token à révoquer (optionnel)
   * @returns {Promise<Object>} Résultat de la déconnexion
   */
  static async logout(userId, refreshToken = null) {
    try {
      if (refreshToken) {
        // Révoquer le refresh token spécifique
        await db.update(refreshTokens)
          .set({ isRevoked: true })
          .where(and(
            eq(refreshTokens.userId, userId),
            eq(refreshTokens.token, refreshToken)
          ));
      } else {
        // Révoquer tous les refresh tokens de l'utilisateur
        await db.update(refreshTokens)
          .set({ isRevoked: true })
          .where(eq(refreshTokens.userId, userId));
      }

      // Invalider tous les codes 2FA actifs
      await db.update(twoFactorCodes)
        .set({ isUsed: true })
        .where(and(
          eq(twoFactorCodes.userId, userId),
          eq(twoFactorCodes.isUsed, false)
        ));

      return {
        success: true,
        message: 'Déconnexion réussie'
      };

    } catch (error) {
      console.error('Erreur déconnexion:', error);
      return {
        success: false,
        error: 'Erreur lors de la déconnexion'
      };
    }
  }

  /**
   * Mettre à jour le profil d'un utilisateur
   * @param {string} userId - ID de l'utilisateur
   * @param {Object} updateData - Données à mettre à jour (firstName, lastName, phone)
   * @param {Object} profilePicture - Nouveau fichier de photo de profil (optionnel)
   * @returns {Promise<Object>} Résultat de la mise à jour
   */
  static async updateProfile(userId, updateData, profilePicture = null) {
    try {
      // Vérifier que l'utilisateur existe
      const user = await db.select().from(users).where(eq(users.id, userId)).limit(1);
      
      if (user.length === 0) {
        return {
          success: false,
          error: 'Utilisateur introuvable'
        };
      }

      const currentUser = user[0];
      const updateFields = {
        updatedAt: new Date()
      };

      // Mettre à jour les champs fournis
      if (updateData.firstName) {
        updateFields.firstName = updateData.firstName;
      }
      if (updateData.lastName) {
        updateFields.lastName = updateData.lastName;
      }
      if (updateData.phone !== undefined) {
        updateFields.phone = updateData.phone || null;
      }
      if (updateData.dateNaissance !== undefined) {
        // Convertir l'objet Date en chaîne au format YYYY-MM-DD
        if (updateData.dateNaissance instanceof Date) {
          updateFields.dateNaissance = updateData.dateNaissance.toISOString().split('T')[0];
        } else {
          updateFields.dateNaissance = updateData.dateNaissance || null;
        }
      }

      // Gérer la photo de profil
      if (profilePicture) {
        // Extraire le publicId de l'ancienne photo si elle existe
        let oldPublicId = null;
        if (currentUser.profilePicture) {
          // Extraire le public_id de l'URL Cloudinary
          // Format: https://res.cloudinary.com/.../image/upload/v1234567890/med-connect/profiles/profile_xxx_123456
          const urlMatch = currentUser.profilePicture.match(/\/v\d+\/(.+)$/);
          if (urlMatch) {
            oldPublicId = urlMatch[1].replace(/\.[^.]+$/, ''); // Enlever l'extension
          }
        }

        // Uploader la nouvelle photo
        const uploadResult = await UploadService.uploadProfilePicture(
          profilePicture.buffer,
          userId,
          oldPublicId
        );

        if (uploadResult.success) {
          updateFields.profilePicture = uploadResult.data.url;
        } else {
          return {
            success: false,
            error: `Erreur lors de l'upload de la photo: ${uploadResult.error}`
          };
        }
      }

      // Mettre à jour l'utilisateur
      const updatedUser = await db.update(users)
        .set(updateFields)
        .where(eq(users.id, userId))
        .returning();

      if (updatedUser.length === 0) {
        return {
          success: false,
          error: 'Erreur lors de la mise à jour'
        };
      }

      const userData = updatedUser[0];

      return {
        success: true,
        message: 'Profil mis à jour avec succès',
        data: {
          user: {
            id: userData.id,
            email: userData.email,
            firstName: userData.firstName,
            lastName: userData.lastName,
            phone: userData.phone,
            dateNaissance: userData.dateNaissance,
            profilePicture: userData.profilePicture,
            role: userData.role,
            status: userData.status,
            updatedAt: userData.updatedAt
          }
        }
      };

    } catch (error) {
      console.error('Erreur mise à jour profil:', error);
      return {
        success: false,
        error: 'Erreur lors de la mise à jour du profil'
      };
    }
  }
}

module.exports = AuthService;