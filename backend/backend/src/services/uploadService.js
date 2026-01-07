const { cloudinary } = require('../config/cloudinary');
const sharp = require('sharp');

class UploadService {
  /**
   * Uploader une photo de profil sur Cloudinary
   * @param {Buffer} fileBuffer - Buffer du fichier
   * @param {string} userId - ID de l'utilisateur
   * @param {string} oldPublicId - Ancien public_id à supprimer (optionnel)
   * @returns {Promise<Object>} Résultat de l'upload
   */
  static async uploadProfilePicture(fileBuffer, userId, oldPublicId = null) {
    try {
      // Redimensionner l'image avec Sharp
      const resizedBuffer = await this.resizeImage(fileBuffer, 300, 300);

      // Configuration de l'upload
      const uploadOptions = {
        folder: 'med-connect/profiles',
        public_id: `profile_${userId}_${Date.now()}`,
        transformation: [
          { width: 300, height: 300, crop: 'fill', gravity: 'face' },
          { quality: 'auto:good', format: 'auto' }
        ],
        overwrite: false,
        resource_type: 'image'
      };

      // Upload vers Cloudinary
      const result = await new Promise((resolve, reject) => {
        cloudinary.uploader.upload_stream(
          uploadOptions,
          (error, result) => {
            if (error) reject(error);
            else resolve(result);
          }
        ).end(resizedBuffer);
      });

      // Supprimer l'ancienne image si elle existe
      if (oldPublicId) {
        await this.deleteProfilePicture(oldPublicId);
      }

      return {
        success: true,
        data: {
          url: result.secure_url,
          publicId: result.public_id,
          width: result.width,
          height: result.height,
          format: result.format,
          bytes: result.bytes
        }
      };

    } catch (error) {
      console.error('Erreur upload Cloudinary:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Supprimer une photo de profil de Cloudinary
   * @param {string} publicId - Public ID de l'image à supprimer
   * @returns {Promise<boolean>} Succès de la suppression
   */
  static async deleteProfilePicture(publicId) {
    try {
      const result = await cloudinary.uploader.destroy(publicId);
      return result.result === 'ok';
    } catch (error) {
      console.error('Erreur suppression Cloudinary:', error);
      return false;
    }
  }

  /**
   * Redimensionner une image avec Sharp
   * @param {Buffer} buffer - Buffer de l'image
   * @param {number} width - Largeur cible
   * @param {number} height - Hauteur cible
   * @returns {Promise<Buffer>} Buffer de l'image redimensionnée
   */
  static async resizeImage(buffer, width = 300, height = 300) {
    try {
      return await sharp(buffer)
        .resize(width, height, {
          fit: 'cover',
          position: 'center'
        })
        .jpeg({
          quality: 85,
          progressive: true
        })
        .toBuffer();
    } catch (error) {
      console.error('Erreur redimensionnement:', error);
      throw new Error('Erreur lors du redimensionnement de l\'image');
    }
  }

  /**
   * Extraire le public_id d'une URL Cloudinary
   * @param {string} url - URL Cloudinary
   * @returns {string|null} Public ID extrait
   */
  static extractPublicIdFromUrl(url) {
    if (!url || typeof url !== 'string') return null;

    try {
      // Pattern pour extraire le public_id d'une URL Cloudinary
      const match = url.match(/\/v\d+\/(.+)\.[a-zA-Z]+$/);
      return match ? match[1] : null;
    } catch (error) {
      console.error('Erreur extraction public_id:', error);
      return null;
    }
  }

  /**
   * Générer une URL de transformation Cloudinary
   * @param {string} publicId - Public ID de l'image
   * @param {Object} transformations - Transformations à appliquer
   * @returns {string} URL transformée
   */
  static generateTransformedUrl(publicId, transformations = {}) {
    const defaultTransformations = {
      width: 300,
      height: 300,
      crop: 'fill',
      quality: 'auto:good',
      format: 'auto'
    };

    const finalTransformations = { ...defaultTransformations, ...transformations };

    return cloudinary.url(publicId, finalTransformations);
  }

  /**
   * Obtenir les informations d'une image Cloudinary
   * @param {string} publicId - Public ID de l'image
   * @returns {Promise<Object>} Informations de l'image
   */
  static async getImageInfo(publicId) {
    try {
      const result = await cloudinary.api.resource(publicId);
      return {
        success: true,
        data: {
          publicId: result.public_id,
          url: result.secure_url,
          width: result.width,
          height: result.height,
          format: result.format,
          bytes: result.bytes,
          createdAt: result.created_at
        }
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Lister toutes les images d'un dossier
   * @param {string} folder - Nom du dossier
   * @param {number} maxResults - Nombre maximum de résultats
   * @returns {Promise<Object>} Liste des images
   */
  static async listImages(folder = 'med-connect/profiles', maxResults = 100) {
    try {
      const result = await cloudinary.api.resources({
        type: 'upload',
        prefix: folder,
        max_results: maxResults
      });

      return {
        success: true,
        data: result.resources.map(resource => ({
          publicId: resource.public_id,
          url: resource.secure_url,
          width: resource.width,
          height: resource.height,
          format: resource.format,
          bytes: resource.bytes,
          createdAt: resource.created_at
        }))
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Uploader un document médical avec progression
   * @param {Buffer} fileBuffer - Buffer du fichier
   * @param {string} fileName - Nom du fichier
   * @param {string} folder - Dossier de destination
   * @param {Function} onProgress - Callback de progression
   * @returns {Promise<Object>} Résultat de l'upload
   */
  static async uploadMedicalDocument(fileBuffer, fileName, folder = 'medical-documents', onProgress = null) {
    try {
      const uploadOptions = {
        folder: `med-connect/${folder}`,
        public_id: `doc_${Date.now()}_${fileName.replace(/[^a-zA-Z0-9]/g, '_')}`,
        resource_type: 'auto',
        overwrite: false
      };

      // Upload avec progression
      const result = await new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          uploadOptions,
          (error, result) => {
            if (error) {
              reject(error);
            } else {
              resolve(result);
            }
          }
        );

        // Simuler la progression pour les petits fichiers
        if (onProgress && typeof onProgress === 'function') {
          let progress = 0;
          const interval = setInterval(() => {
            progress += 10;
            onProgress(Math.min(progress, 90));
            if (progress >= 90) {
              clearInterval(interval);
            }
          }, 100);

          uploadStream.on('finish', () => {
            clearInterval(interval);
            onProgress(100);
          });
        }

        uploadStream.end(fileBuffer);
      });

      return {
        success: true,
        data: {
          url: result.secure_url,
          publicId: result.public_id,
          format: result.format,
          bytes: result.bytes,
          resourceType: result.resource_type
        }
      };

    } catch (error) {
      console.error('Erreur upload document médical:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Supprimer un document médical
   * @param {string} publicId - Public ID du document
   * @returns {Promise<boolean>} Succès de la suppression
   */
  static async deleteMedicalDocument(publicId) {
    try {
      const result = await cloudinary.uploader.destroy(publicId, {
        resource_type: 'auto'
      });
      return result.result === 'ok';
    } catch (error) {
      console.error('Erreur suppression document médical:', error);
      return false;
    }
  }

  /**
   * Télécharger un fichier depuis Cloudinary
   * @param {string} url - URL du fichier
   * @returns {Promise<Object>} Buffer et informations du fichier
   */
  static async downloadFile(url) {
    try {
      const https = require('https');
      const http = require('http');
      
      return new Promise((resolve, reject) => {
        const client = url.startsWith('https:') ? https : http;
        
        client.get(url, (response) => {
          if (response.statusCode !== 200) {
            reject(new Error(`Erreur HTTP: ${response.statusCode}`));
            return;
          }

          const chunks = [];
          response.on('data', (chunk) => chunks.push(chunk));
          response.on('end', () => {
            const buffer = Buffer.concat(chunks);
            resolve({
              buffer,
              contentType: response.headers['content-type'] || 'application/octet-stream',
              contentLength: response.headers['content-length']
            });
          });
          response.on('error', reject);
        }).on('error', reject);
      });
    } catch (error) {
      console.error('Erreur téléchargement fichier:', error);
      throw error;
    }
  }

  /**
   * Supprimer un fichier (alias pour compatibilité)
   * @param {string} publicId - Public ID du fichier
   * @returns {Promise<boolean>} Succès de la suppression
   */
  static async deleteFile(publicId) {
    return await this.deleteMedicalDocument(publicId);
  }
}

module.exports = UploadService;