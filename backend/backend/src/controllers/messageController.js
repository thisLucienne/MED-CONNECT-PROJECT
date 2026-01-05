const messageService = require('../services/messageService');
const { validationResult } = require('express-validator');

class MessageController {
  // Envoyer un message
  async envoyerMessage(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Données invalides',
          errors: errors.array()
        });
      }

      const { destinataireId, contenu, objet } = req.body;
      const expediteurId = req.user.id;

      const message = await messageService.envoyerMessage(
        expediteurId,
        destinataireId,
        contenu,
        objet
      );

      res.status(201).json({
        success: true,
        message: 'Message envoyé avec succès',
        data: message
      });
    } catch (error) {
      console.error('Erreur lors de l\'envoi du message:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Erreur lors de l\'envoi du message'
      });
    }
  }

  // Obtenir une conversation
  async obtenirConversation(req, res) {
    try {
      const { autreUtilisateurId } = req.params;
      const { page = 1, limite = 50 } = req.query;
      const utilisateurId = req.user.id;

      const messages = await messageService.obtenirConversation(
        utilisateurId,
        autreUtilisateurId,
        parseInt(page),
        parseInt(limite)
      );

      res.json({
        success: true,
        data: messages,
        pagination: {
          page: parseInt(page),
          limite: parseInt(limite),
          total: messages.length
        }
      });
    } catch (error) {
      console.error('Erreur lors de la récupération de la conversation:', error);
      res.status(500).json({
        success: false,
        message: 'Erreur lors de la récupération de la conversation'
      });
    }
  }

  // Obtenir toutes les conversations d'un utilisateur
  async obtenirConversations(req, res) {
    try {
      const utilisateurId = req.user.id;

      const conversations = await messageService.obtenirConversations(utilisateurId);

      res.json({
        success: true,
        data: conversations
      });
    } catch (error) {
      console.error('Erreur lors de la récupération des conversations:', error);
      res.status(500).json({
        success: false,
        message: 'Erreur lors de la récupération des conversations'
      });
    }
  }

  // Marquer un message comme lu
  async marquerCommeLu(req, res) {
    try {
      const { messageId } = req.params;
      const utilisateurId = req.user.id;

      await messageService.marquerCommeLu(messageId, utilisateurId);

      res.json({
        success: true,
        message: 'Message marqué comme lu'
      });
    } catch (error) {
      console.error('Erreur lors du marquage comme lu:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Erreur lors du marquage comme lu'
      });
    }
  }

  // Rechercher des médecins (pour les patients)
  async rechercherMedecins(req, res) {
    try {
      const { specialite, nom } = req.query;
      const patientId = req.user.id;

      // Vérifier que l'utilisateur est un patient
      if (req.user.role !== 'PATIENT') {
        return res.status(403).json({
          success: false,
          message: 'Seuls les patients peuvent rechercher des médecins'
        });
      }

      const medecins = await messageService.rechercherMedecins(
        patientId,
        specialite,
        nom
      );

      res.json({
        success: true,
        data: medecins
      });
    } catch (error) {
      console.error('Erreur lors de la recherche de médecins:', error);
      res.status(500).json({
        success: false,
        message: 'Erreur lors de la recherche de médecins'
      });
    }
  }

  // Obtenir les détails d'un message
  async obtenirMessage(req, res) {
    try {
      const { messageId } = req.params;
      const utilisateurId = req.user.id;

      const message = await messageService.obtenirMessage(messageId, utilisateurId);

      if (!message) {
        return res.status(404).json({
          success: false,
          message: 'Message non trouvé'
        });
      }

      res.json({
        success: true,
        data: message
      });
    } catch (error) {
      console.error('Erreur lors de la récupération du message:', error);
      res.status(500).json({
        success: false,
        message: 'Erreur lors de la récupération du message'
      });
    }
  }
}

module.exports = new MessageController();