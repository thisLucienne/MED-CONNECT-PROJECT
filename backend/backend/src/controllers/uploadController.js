const UploadService = require('../services/uploadService');

class UploadController {
  // Upload avec progression via WebSocket ou Server-Sent Events
  static async uploadWithProgress(req, res) {
    try {
      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: 'Aucun fichier fourni'
        });
      }

      const { folder = 'general' } = req.body;

      // Simuler la progression avec des événements
      res.writeHead(200, {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Cache-Control'
      });

      // Fonction de callback pour la progression
      const onProgress = (percentage) => {
        res.write(`data: ${JSON.stringify({ 
          type: 'progress', 
          percentage,
          message: `Upload en cours: ${percentage}%`
        })}\n\n`);
      };

      try {
        // Upload du fichier avec progression
        const result = await UploadService.uploadMedicalDocument(
          req.file.buffer,
          req.file.originalname,
          folder,
          onProgress
        );

        if (result.success) {
          res.write(`data: ${JSON.stringify({ 
            type: 'complete', 
            percentage: 100,
            data: result.data,
            message: 'Upload terminé avec succès'
          })}\n\n`);
        } else {
          res.write(`data: ${JSON.stringify({ 
            type: 'error', 
            message: result.error
          })}\n\n`);
        }

      } catch (uploadError) {
        res.write(`data: ${JSON.stringify({ 
          type: 'error', 
          message: 'Erreur lors de l\'upload'
        })}\n\n`);
      }

      res.end();

    } catch (error) {
      console.error('Erreur upload avec progression:', error);
      
      if (!res.headersSent) {
        res.status(500).json({
          success: false,
          message: 'Erreur lors de l\'upload'
        });
      }
    }
  }

  // Upload simple sans progression
  static async uploadSimple(req, res) {
    try {
      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: 'Aucun fichier fourni'
        });
      }

      const { folder = 'general' } = req.body;

      const result = await UploadService.uploadMedicalDocument(
        req.file.buffer,
        req.file.originalname,
        folder
      );

      if (result.success) {
        res.json({
          success: true,
          message: 'Fichier uploadé avec succès',
          data: result.data
        });
      } else {
        res.status(400).json({
          success: false,
          message: result.error
        });
      }

    } catch (error) {
      console.error('Erreur upload simple:', error);
      res.status(500).json({
        success: false,
        message: 'Erreur lors de l\'upload'
      });
    }
  }

  // Upload photo de profil
  static async uploadProfilePicture(req, res) {
    try {
      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: 'Aucune image fournie'
        });
      }

      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: 'Utilisateur non authentifié'
        });
      }

      // Vérifier que c'est bien une image
      if (!req.file.mimetype.startsWith('image/')) {
        return res.status(400).json({
          success: false,
          message: 'Le fichier doit être une image'
        });
      }

      // Extraire l'ancien public_id si l'utilisateur a déjà une photo
      let oldPublicId = null;
      if (req.user.profilePicture) {
        oldPublicId = UploadService.extractPublicIdFromUrl(req.user.profilePicture);
      }

      const result = await UploadService.uploadProfilePicture(
        req.file.buffer,
        req.user.id,
        oldPublicId
      );

      if (result.success) {
        // Mettre à jour l'URL de la photo de profil dans la base de données
        const { db } = require('../config/database');
        const { users } = require('../db/schema');
        const { eq } = require('drizzle-orm');

        await db
          .update(users)
          .set({ 
            profilePicture: result.data.url,
            updatedAt: new Date()
          })
          .where(eq(users.id, req.user.id));

        res.json({
          success: true,
          message: 'Photo de profil mise à jour avec succès',
          data: { url: result.data.url }
        });
      } else {
        res.status(400).json({
          success: false,
          message: result.error
        });
      }

    } catch (error) {
      console.error('Erreur upload photo de profil:', error);
      res.status(500).json({
        success: false,
        message: 'Erreur lors de l\'upload de la photo de profil'
      });
    }
  }

  // Supprimer un fichier
  static async deleteFile(req, res) {
    try {
      const { publicId } = req.params;

      const success = await UploadService.deleteMedicalDocument(publicId);

      if (success) {
        res.json({
          success: true,
          message: 'Fichier supprimé avec succès'
        });
      } else {
        res.status(400).json({
          success: false,
          message: 'Erreur lors de la suppression du fichier'
        });
      }

    } catch (error) {
      console.error('Erreur suppression fichier:', error);
      res.status(500).json({
        success: false,
        message: 'Erreur lors de la suppression'
      });
    }
  }
}

module.exports = UploadController;