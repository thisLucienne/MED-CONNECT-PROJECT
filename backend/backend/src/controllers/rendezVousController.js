const rendezVousService = require('../services/rendezVousService');
const { validationResult } = require('express-validator');

class RendezVousController {
  // Créer un rendez-vous (médecin uniquement)
  async creerRendezVous(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Données invalides',
          errors: errors.array()
        });
      }

      const { patientId, dateRendezVous, duree, motif } = req.body;
      const medecinId = req.user.id;

      if (req.user.role !== 'DOCTOR') {
        return res.status(403).json({
          success: false,
          message: 'Seuls les médecins peuvent créer des rendez-vous'
        });
      }

      const rdv = await rendezVousService.creerRendezVous(
        medecinId,
        patientId,
        dateRendezVous,
        duree,
        motif
      );

      res.status(201).json({
        success: true,
        message: 'Rendez-vous créé avec succès',
        data: rdv
      });
    } catch (error) {
      console.error('Erreur lors de la création du rendez-vous:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Erreur lors de la création du rendez-vous'
      });
    }
  }

  // Obtenir ses rendez-vous
  async obtenirRendezVous(req, res) {
    try {
      const { futurs } = req.query;
      const utilisateurId = req.user.id;
      const futursUniquement = futurs === 'true';

      let rdvs;
      if (req.user.role === 'PATIENT') {
        rdvs = await rendezVousService.obtenirRendezVousPatient(utilisateurId, futursUniquement);
      } else if (req.user.role === 'DOCTOR') {
        rdvs = await rendezVousService.obtenirRendezVousMedecin(utilisateurId, futursUniquement);
      } else {
        return res.status(403).json({
          success: false,
          message: 'Accès non autorisé'
        });
      }

      res.json({
        success: true,
        data: rdvs
      });
    } catch (error) {
      console.error('Erreur lors de la récupération des rendez-vous:', error);
      res.status(500).json({
        success: false,
        message: 'Erreur lors de la récupération des rendez-vous'
      });
    }
  }

  // Mettre à jour le statut d'un rendez-vous
  async mettreAJourStatut(req, res) {
    try {
      const { rdvId } = req.params;
      const { statut, notes } = req.body;
      const utilisateurId = req.user.id;

      if (!['CONFIRME', 'ANNULE', 'TERMINE'].includes(statut)) {
        return res.status(400).json({
          success: false,
          message: 'Statut invalide'
        });
      }

      await rendezVousService.mettreAJourStatut(rdvId, statut, utilisateurId, notes);

      res.json({
        success: true,
        message: 'Statut du rendez-vous mis à jour avec succès'
      });
    } catch (error) {
      console.error('Erreur lors de la mise à jour du statut:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Erreur lors de la mise à jour du statut'
      });
    }
  }

  // Annuler un rendez-vous
  async annulerRendezVous(req, res) {
    try {
      const { rdvId } = req.params;
      const { raison } = req.body;
      const utilisateurId = req.user.id;

      await rendezVousService.annulerRendezVous(rdvId, utilisateurId, raison);

      res.json({
        success: true,
        message: 'Rendez-vous annulé avec succès'
      });
    } catch (error) {
      console.error('Erreur lors de l\'annulation du rendez-vous:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Erreur lors de l\'annulation du rendez-vous'
      });
    }
  }
}

module.exports = new RendezVousController();