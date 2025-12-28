const connexionService = require('../services/connexionService');
const { validationResult } = require('express-validator');

class ConnexionController {
  // Envoyer une demande de connexion (patient)
  async envoyerDemande(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Données invalides',
          errors: errors.array()
        });
      }

      const { medecinId, message } = req.body;
      const patientId = req.user.id;

      if (req.user.role !== 'PATIENT') {
        return res.status(403).json({
          success: false,
          message: 'Seuls les patients peuvent envoyer des demandes de connexion'
        });
      }

      const demande = await connexionService.envoyerDemandeConnexion(
        patientId,
        medecinId,
        message
      );

      res.status(201).json({
        success: true,
        message: 'Demande de connexion envoyée avec succès',
        data: demande
      });
    } catch (error) {
      console.error('Erreur lors de l\'envoi de la demande:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Erreur lors de l\'envoi de la demande'
      });
    }
  }

  // Répondre à une demande de connexion (médecin)
  async repondreDemande(req, res) {
    try {
      const { demandeId } = req.params;
      const { reponse, raisonRefus } = req.body;
      const medecinId = req.user.id;

      if (req.user.role !== 'DOCTOR') {
        return res.status(403).json({
          success: false,
          message: 'Seuls les médecins peuvent répondre aux demandes'
        });
      }

      if (!['accepter', 'refuser'].includes(reponse)) {
        return res.status(400).json({
          success: false,
          message: 'Réponse invalide. Utilisez "accepter" ou "refuser"'
        });
      }

      const resultat = await connexionService.repondreDemandeConnexion(
        demandeId,
        medecinId,
        reponse,
        raisonRefus
      );

      res.json({
        success: true,
        message: `Demande ${reponse === 'accepter' ? 'acceptée' : 'refusée'} avec succès`,
        data: resultat
      });
    } catch (error) {
      console.error('Erreur lors de la réponse à la demande:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Erreur lors de la réponse à la demande'
      });
    }
  }

  // Obtenir les demandes de connexion (médecin)
  async obtenirDemandesMedecin(req, res) {
    try {
      const { statut } = req.query;
      const medecinId = req.user.id;

      if (req.user.role !== 'DOCTOR') {
        return res.status(403).json({
          success: false,
          message: 'Accès réservé aux médecins'
        });
      }

      const demandes = await connexionService.obtenirDemandesMedecin(medecinId, statut);

      res.json({
        success: true,
        data: demandes
      });
    } catch (error) {
      console.error('Erreur lors de la récupération des demandes:', error);
      res.status(500).json({
        success: false,
        message: 'Erreur lors de la récupération des demandes'
      });
    }
  }

  // Obtenir les demandes de connexion (patient)
  async obtenirDemandesPatient(req, res) {
    try {
      const patientId = req.user.id;

      if (req.user.role !== 'PATIENT') {
        return res.status(403).json({
          success: false,
          message: 'Accès réservé aux patients'
        });
      }

      const demandes = await connexionService.obtenirDemandesPatient(patientId);

      res.json({
        success: true,
        data: demandes
      });
    } catch (error) {
      console.error('Erreur lors de la récupération des demandes patient:', error);
      res.status(500).json({
        success: false,
        message: 'Erreur lors de la récupération des demandes'
      });
    }
  }
}

module.exports = new ConnexionController();