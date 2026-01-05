const santeService = require('../services/santeService');
const { validationResult } = require('express-validator');

class SanteController {
  // Obtenir le tableau de bord de santé (patient)
  async obtenirTableauDeBord(req, res) {
    try {
      const patientId = req.user.id;

      if (req.user.role !== 'PATIENT') {
        return res.status(403).json({
          success: false,
          message: 'Accès réservé aux patients'
        });
      }

      const tableauDeBord = await santeService.obtenirTableauDeBord(patientId);

      res.json({
        success: true,
        data: tableauDeBord
      });
    } catch (error) {
      console.error('Erreur lors de la récupération du tableau de bord:', error);
      res.status(500).json({
        success: false,
        message: 'Erreur lors de la récupération du tableau de bord'
      });
    }
  }

  // Obtenir les paramètres de santé (patient)
  async obtenirParametres(req, res) {
    try {
      const patientId = req.user.id;

      if (req.user.role !== 'PATIENT') {
        return res.status(403).json({
          success: false,
          message: 'Accès réservé aux patients'
        });
      }

      const parametres = await santeService.obtenirParametresSante(patientId);

      res.json({
        success: true,
        data: parametres
      });
    } catch (error) {
      console.error('Erreur lors de la récupération des paramètres:', error);
      res.status(500).json({
        success: false,
        message: 'Erreur lors de la récupération des paramètres'
      });
    }
  }

  // Mettre à jour les paramètres de santé (patient)
  async mettreAJourParametres(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Données invalides',
          errors: errors.array()
        });
      }

      const patientId = req.user.id;

      if (req.user.role !== 'PATIENT') {
        return res.status(403).json({
          success: false,
          message: 'Accès réservé aux patients'
        });
      }

      const parametres = await santeService.mettreAJourParametres(patientId, req.body);

      res.json({
        success: true,
        message: 'Paramètres de santé mis à jour avec succès',
        data: parametres
      });
    } catch (error) {
      console.error('Erreur lors de la mise à jour des paramètres:', error);
      res.status(500).json({
        success: false,
        message: 'Erreur lors de la mise à jour des paramètres'
      });
    }
  }

  // Obtenir les médecins connectés (patient)
  async obtenirMedecinsConnectes(req, res) {
    try {
      const patientId = req.user.id;

      if (req.user.role !== 'PATIENT') {
        return res.status(403).json({
          success: false,
          message: 'Accès réservé aux patients'
        });
      }

      const medecins = await santeService.obtenirMedecinsConnectes(patientId);

      res.json({
        success: true,
        data: medecins
      });
    } catch (error) {
      console.error('Erreur lors de la récupération des médecins:', error);
      res.status(500).json({
        success: false,
        message: 'Erreur lors de la récupération des médecins connectés'
      });
    }
  }

  // Obtenir les patients connectés (médecin)
  async obtenirPatientsConnectes(req, res) {
    try {
      const medecinId = req.user.id;

      if (req.user.role !== 'DOCTOR') {
        return res.status(403).json({
          success: false,
          message: 'Accès réservé aux médecins'
        });
      }

      // Récupérer tous les patients qui ont donné accès à ce médecin
      const { db } = require('../config/database');
      const { accesDossiers, dossiersMedicaux, users, parametresSante } = require('../db/schema');
      const { eq, and } = require('drizzle-orm');

      const patients = await db
        .select({
          id: users.id,
          firstName: users.firstName,
          lastName: users.lastName,
          email: users.email,
          profilePicture: users.profilePicture,
          dateAutorisation: accesDossiers.dateAutorisation,
          typeAcces: accesDossiers.typeAcces,
          parametresSante: {
            groupeSanguin: parametresSante.groupeSanguin,
            allergiesConnues: parametresSante.allergiesConnues,
            medicamentsActuels: parametresSante.medicamentsActuels,
            conditionsMedicales: parametresSante.conditionsMedicales
          }
        })
        .from(accesDossiers)
        .innerJoin(dossiersMedicaux, eq(accesDossiers.idDossier, dossiersMedicaux.id))
        .innerJoin(users, eq(dossiersMedicaux.idPatient, users.id))
        .leftJoin(parametresSante, eq(users.id, parametresSante.idPatient))
        .where(and(
          eq(accesDossiers.idMedecin, medecinId),
          eq(accesDossiers.statut, 'ACTIF')
        ))
        .groupBy(
          users.id, 
          users.firstName, 
          users.lastName, 
          users.email, 
          users.profilePicture,
          accesDossiers.dateAutorisation,
          accesDossiers.typeAcces,
          parametresSante.groupeSanguin,
          parametresSante.allergiesConnues,
          parametresSante.medicamentsActuels,
          parametresSante.conditionsMedicales
        );

      res.json({
        success: true,
        data: patients
      });
    } catch (error) {
      console.error('Erreur lors de la récupération des patients:', error);
      res.status(500).json({
        success: false,
        message: 'Erreur lors de la récupération des patients connectés'
      });
    }
  }
}

module.exports = new SanteController();