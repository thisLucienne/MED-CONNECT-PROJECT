const dossierService = require('../services/dossierService');
const { validationResult } = require('express-validator');

class DossierController {
  // Créer un dossier médical (par le patient)
  async creerDossier(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Données invalides',
          errors: errors.array()
        });
      }

      const { titre, description, type } = req.body;
      const patientId = req.user.id;

      // Vérifier que l'utilisateur est un patient
      if (req.user.role !== 'PATIENT') {
        return res.status(403).json({
          success: false,
          message: 'Seuls les patients peuvent créer leurs dossiers médicaux'
        });
      }

      const dossier = await dossierService.creerDossier(
        patientId,
        titre,
        description,
        type
      );

      res.status(201).json({
        success: true,
        message: 'Dossier médical créé avec succès',
        data: dossier
      });
    } catch (error) {
      console.error('Erreur lors de la création du dossier:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Erreur lors de la création du dossier'
      });
    }
  }

  // Donner accès à un médecin
  async donnerAccesMedecin(req, res) {
    try {
      const { dossierId } = req.params;
      const { medecinId, typeAcces = 'LECTURE' } = req.body;
      const patientId = req.user.id;

      if (req.user.role !== 'PATIENT') {
        return res.status(403).json({
          success: false,
          message: 'Seuls les patients peuvent donner accès à leurs dossiers'
        });
      }

      const acces = await dossierService.donnerAccesMedecin(
        dossierId,
        medecinId,
        patientId,
        typeAcces
      );

      res.status(201).json({
        success: true,
        message: 'Accès accordé au médecin avec succès',
        data: acces
      });
    } catch (error) {
      console.error('Erreur lors de l\'octroi d\'accès:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Erreur lors de l\'octroi d\'accès'
      });
    }
  }

  // Révoquer l'accès d'un médecin
  async revoquerAccesMedecin(req, res) {
    try {
      const { dossierId, medecinId } = req.params;
      const patientId = req.user.id;

      if (req.user.role !== 'PATIENT') {
        return res.status(403).json({
          success: false,
          message: 'Seuls les patients peuvent révoquer l\'accès à leurs dossiers'
        });
      }

      await dossierService.revoquerAccesMedecin(dossierId, medecinId, patientId);

      res.json({
        success: true,
        message: 'Accès révoqué avec succès'
      });
    } catch (error) {
      console.error('Erreur lors de la révocation d\'accès:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Erreur lors de la révocation d\'accès'
      });
    }
  }

  // Obtenir les dossiers d'un patient
  async obtenirDossiers(req, res) {
    try {
      const { page = 1, limite = 20 } = req.query;
      let patientId;

      // Si c'est un patient, il ne peut voir que ses propres dossiers
      if (req.user.role === 'PATIENT') {
        patientId = req.user.id;
      } else if (req.user.role === 'DOCTOR' && req.params.patientId) {
        patientId = req.params.patientId;
      } else {
        return res.status(400).json({
          success: false,
          message: 'ID patient requis'
        });
      }

      const dossiers = await dossierService.obtenirDossiersPatient(
        patientId,
        parseInt(page),
        parseInt(limite)
      );

      res.json({
        success: true,
        data: dossiers,
        pagination: {
          page: parseInt(page),
          limite: parseInt(limite)
        }
      });
    } catch (error) {
      console.error('Erreur lors de la récupération des dossiers:', error);
      res.status(500).json({
        success: false,
        message: 'Erreur lors de la récupération des dossiers'
      });
    }
  }

  // Obtenir un dossier complet
  async obtenirDossierComplet(req, res) {
    try {
      const { dossierId } = req.params;
      const utilisateurId = req.user.id;

      const dossier = await dossierService.obtenirDossierComplet(dossierId, utilisateurId);

      res.json({
        success: true,
        data: dossier
      });
    } catch (error) {
      console.error('Erreur lors de la récupération du dossier:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Erreur lors de la récupération du dossier'
      });
    }
  }

  // Ajouter un document avec upload et pourcentage
  async ajouterDocument(req, res) {
    try {
      const { dossierId } = req.params;
      const { nom, type } = req.body;
      const utilisateurId = req.user.id;

      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: 'Fichier requis'
        });
      }

      const document = await dossierService.ajouterDocument(
        dossierId,
        nom,
        type,
        req.file,
        utilisateurId
      );

      res.status(201).json({
        success: true,
        message: 'Document ajouté avec succès',
        data: document
      });
    } catch (error) {
      console.error('Erreur lors de l\'ajout du document:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Erreur lors de l\'ajout du document'
      });
    }
  }

  // Ajouter une ordonnance
  async ajouterOrdonnance(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Données invalides',
          errors: errors.array()
        });
      }

      const { dossierId } = req.params;
      const { medicament, dosage, duree } = req.body;
      const medecinId = req.user.id;

      if (req.user.role !== 'DOCTOR') {
        return res.status(403).json({
          success: false,
          message: 'Seuls les médecins peuvent ajouter des ordonnances'
        });
      }

      const ordonnance = await dossierService.ajouterOrdonnance(
        dossierId,
        medicament,
        dosage,
        duree,
        medecinId
      );

      res.status(201).json({
        success: true,
        message: 'Ordonnance ajoutée avec succès',
        data: ordonnance
      });
    } catch (error) {
      console.error('Erreur lors de l\'ajout de l\'ordonnance:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Erreur lors de l\'ajout de l\'ordonnance'
      });
    }
  }

  // Ajouter une allergie
  async ajouterAllergie(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Données invalides',
          errors: errors.array()
        });
      }

      const { dossierId } = req.params;
      const { nom } = req.body;
      const utilisateurId = req.user.id;

      const allergie = await dossierService.ajouterAllergie(dossierId, nom, utilisateurId);

      res.status(201).json({
        success: true,
        message: 'Allergie ajoutée avec succès',
        data: allergie
      });
    } catch (error) {
      console.error('Erreur lors de l\'ajout de l\'allergie:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Erreur lors de l\'ajout de l\'allergie'
      });
    }
  }

  // Ajouter un commentaire
  async ajouterCommentaire(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Données invalides',
          errors: errors.array()
        });
      }

      const { dossierId } = req.params;
      const { contenu } = req.body;
      const auteurId = req.user.id;

      const commentaire = await dossierService.ajouterCommentaire(dossierId, contenu, auteurId);

      res.status(201).json({
        success: true,
        message: 'Commentaire ajouté avec succès',
        data: commentaire
      });
    } catch (error) {
      console.error('Erreur lors de l\'ajout du commentaire:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Erreur lors de l\'ajout du commentaire'
      });
    }
  }

  // Mettre à jour le statut d'un dossier
  async mettreAJourStatut(req, res) {
    try {
      const { dossierId } = req.params;
      const { statut } = req.body;
      const medecinId = req.user.id;

      if (req.user.role !== 'DOCTOR') {
        return res.status(403).json({
          success: false,
          message: 'Seuls les médecins peuvent modifier le statut des dossiers'
        });
      }

      await dossierService.mettreAJourStatut(dossierId, statut, medecinId);

      res.json({
        success: true,
        message: 'Statut du dossier mis à jour avec succès'
      });
    } catch (error) {
      console.error('Erreur lors de la mise à jour du statut:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Erreur lors de la mise à jour du statut'
      });
    }
  }
}

module.exports = new DossierController();