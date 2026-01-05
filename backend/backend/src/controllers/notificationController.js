const notificationService = require('../services/notificationService');

class NotificationController {
  // Obtenir les notifications d'un utilisateur
  async obtenirNotifications(req, res) {
    try {
      const { page = 1, limite = 20, nonLuesUniquement = false } = req.query;
      const utilisateurId = req.user.id;

      const notifications = await notificationService.obtenirNotifications(
        utilisateurId,
        parseInt(page),
        parseInt(limite),
        nonLuesUniquement === 'true'
      );

      res.json({
        success: true,
        data: notifications,
        pagination: {
          page: parseInt(page),
          limite: parseInt(limite)
        }
      });
    } catch (error) {
      console.error('Erreur lors de la récupération des notifications:', error);
      res.status(500).json({
        success: false,
        message: 'Erreur lors de la récupération des notifications'
      });
    }
  }

  // Marquer une notification comme lue
  async marquerCommeLue(req, res) {
    try {
      const { notificationId } = req.params;
      const utilisateurId = req.user.id;

      await notificationService.marquerCommeLue(notificationId, utilisateurId);

      res.json({
        success: true,
        message: 'Notification marquée comme lue'
      });
    } catch (error) {
      console.error('Erreur lors du marquage comme lue:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Erreur lors du marquage comme lue'
      });
    }
  }

  // Marquer toutes les notifications comme lues
  async marquerToutesCommeLues(req, res) {
    try {
      const utilisateurId = req.user.id;

      await notificationService.marquerToutesCommeLues(utilisateurId);

      res.json({
        success: true,
        message: 'Toutes les notifications ont été marquées comme lues'
      });
    } catch (error) {
      console.error('Erreur lors du marquage de toutes les notifications:', error);
      res.status(500).json({
        success: false,
        message: 'Erreur lors du marquage de toutes les notifications'
      });
    }
  }

  // Compter les notifications non lues
  async compterNotificationsNonLues(req, res) {
    try {
      const utilisateurId = req.user.id;

      const count = await notificationService.compterNotificationsNonLues(utilisateurId);

      res.json({
        success: true,
        data: { count }
      });
    } catch (error) {
      console.error('Erreur lors du comptage des notifications non lues:', error);
      res.status(500).json({
        success: false,
        message: 'Erreur lors du comptage des notifications non lues'
      });
    }
  }

  // Supprimer une notification
  async supprimerNotification(req, res) {
    try {
      const { notificationId } = req.params;
      const utilisateurId = req.user.id;

      await notificationService.supprimerNotification(notificationId, utilisateurId);

      res.json({
        success: true,
        message: 'Notification supprimée avec succès'
      });
    } catch (error) {
      console.error('Erreur lors de la suppression de la notification:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Erreur lors de la suppression de la notification'
      });
    }
  }
}

module.exports = new NotificationController();