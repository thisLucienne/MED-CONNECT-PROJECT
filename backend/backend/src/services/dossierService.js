const { db } = require('../config/database');
const { dossiersMedicaux, accesDossiers, documentsMedicaux, ordonnances, allergies, commentaires, users } = require('../db/schema');
const { eq, and, desc, sql } = require('drizzle-orm');
const uploadService = require('./uploadService');

class DossierService {
  // Créer un dossier médical (par le patient)
  async creerDossier(patientId, titre, description, type) {
    try {
      const [dossier] = await db.insert(dossiersMedicaux).values({
        idPatient: patientId,
        titre,
        description,
        type
      }).returning();

      return dossier;
    } catch (error) {
      console.error('Erreur lors de la création du dossier:', error);
      throw error;
    }
  }

  // Donner accès à un médecin
  async donnerAccesMedecin(dossierId, medecinId, patientId, typeAcces = 'LECTURE') {
    try {
      // Vérifier que le dossier appartient au patient
      const [dossier] = await db
        .select()
        .from(dossiersMedicaux)
        .where(eq(dossiersMedicaux.id, dossierId))
        .limit(1);

      if (!dossier || dossier.idPatient !== patientId) {
        throw new Error('Dossier non trouvé ou accès non autorisé');
      }

      // Vérifier que le médecin existe et est actif
      const [medecin] = await db
        .select()
        .from(users)
        .where(and(
          eq(users.id, medecinId),
          eq(users.role, 'DOCTOR'),
          eq(users.status, 'ACTIVE')
        ))
        .limit(1);

      if (!medecin) {
        throw new Error('Médecin non trouvé ou non actif');
      }

      // Créer ou mettre à jour l'accès
      const [acces] = await db.insert(accesDossiers).values({
        idDossier: dossierId,
        idMedecin: medecinId,
        typeAcces,
        statut: 'ACTIF'
      }).onConflictDoUpdate({
        target: [accesDossiers.idDossier, accesDossiers.idMedecin],
        set: {
          typeAcces,
          statut: 'ACTIF',
          dateAutorisation: new Date()
        }
      }).returning();

      return acces;
    } catch (error) {
      console.error('Erreur lors de l\'octroi d\'accès:', error);
      throw error;
    }
  }

  // Révoquer l'accès d'un médecin
  async revoquerAccesMedecin(dossierId, medecinId, patientId) {
    try {
      // Vérifier que le dossier appartient au patient
      const [dossier] = await db
        .select()
        .from(dossiersMedicaux)
        .where(eq(dossiersMedicaux.id, dossierId))
        .limit(1);

      if (!dossier || dossier.idPatient !== patientId) {
        throw new Error('Dossier non trouvé ou accès non autorisé');
      }

      await db
        .update(accesDossiers)
        .set({ statut: 'REVOQUE' })
        .where(and(
          eq(accesDossiers.idDossier, dossierId),
          eq(accesDossiers.idMedecin, medecinId)
        ));

      return { success: true };
    } catch (error) {
      console.error('Erreur lors de la révocation d\'accès:', error);
      throw error;
    }
  }

  // Obtenir les dossiers d'un patient
  async obtenirDossiersPatient(patientId, page = 1, limite = 20) {
    try {
      const offset = (page - 1) * limite;

      const dossiers = await db
        .select({
          id: dossiersMedicaux.id,
          titre: dossiersMedicaux.titre,
          description: dossiersMedicaux.description,
          type: dossiersMedicaux.type,
          statut: dossiersMedicaux.statut,
          dateCreation: dossiersMedicaux.dateCreation,
          dateModification: dossiersMedicaux.dateModification
        })
        .from(dossiersMedicaux)
        .where(eq(dossiersMedicaux.idPatient, patientId))
        .orderBy(desc(dossiersMedicaux.dateCreation))
        .limit(limite)
        .offset(offset);

      // Compter le total pour la pagination
      const [{ count }] = await db
        .select({ count: sql`count(*)` })
        .from(dossiersMedicaux)
        .where(eq(dossiersMedicaux.idPatient, patientId));

      return {
        dossiers,
        total: parseInt(count)
      };
    } catch (error) {
      console.error('Erreur lors de la récupération des dossiers:', error);
      throw error;
    }
  }

  // Obtenir un dossier complet avec tous ses éléments
  async obtenirDossierComplet(dossierId, utilisateurId) {
    try {
      // Vérifier l'accès au dossier
      const [dossier] = await db
        .select()
        .from(dossiersMedicaux)
        .where(eq(dossiersMedicaux.id, dossierId))
        .limit(1);

      if (!dossier) {
        throw new Error('Dossier non trouvé');
      }

      // Vérifier l'accès
      let hasAccess = false;
      
      if (dossier.idPatient === utilisateurId) {
        // Le patient a toujours accès à ses dossiers
        hasAccess = true;
      } else {
        // Vérifier si le médecin a un accès autorisé
        const [acces] = await db
          .select()
          .from(accesDossiers)
          .where(and(
            eq(accesDossiers.idDossier, dossierId),
            eq(accesDossiers.idMedecin, utilisateurId),
            eq(accesDossiers.statut, 'ACTIF')
          ))
          .limit(1);
        
        hasAccess = !!acces;
      }

      if (!hasAccess) {
        throw new Error('Accès non autorisé à ce dossier');
      }

      // Récupérer les ordonnances
      const ordonnancesDossier = await db
        .select()
        .from(ordonnances)
        .where(eq(ordonnances.idDossier, dossierId))
        .orderBy(desc(ordonnances.dateCreation));

      // Récupérer les documents
      const documents = await db
        .select()
        .from(documentsMedicaux)
        .where(eq(documentsMedicaux.idDossier, dossierId))
        .orderBy(desc(documentsMedicaux.dateUpload));

      // Récupérer les allergies
      const allergiesDossier = await db
        .select()
        .from(allergies)
        .where(eq(allergies.idDossier, dossierId))
        .orderBy(desc(allergies.dateCreation));

      // Récupérer les commentaires
      const commentairesDossier = await db
        .select({
          id: commentaires.id,
          contenu: commentaires.contenu,
          dateCreation: commentaires.dateCreation,
          auteur: {
            id: users.id,
            firstName: users.firstName,
            lastName: users.lastName,
            role: users.role,
            profilePicture: users.profilePicture
          }
        })
        .from(commentaires)
        .innerJoin(users, eq(commentaires.auteur, users.id))
        .where(eq(commentaires.idDossier, dossierId))
        .orderBy(desc(commentaires.dateCreation));

      return {
        ...dossier,
        ordonnances: ordonnancesDossier,
        documents,
        allergies: allergiesDossier,
        commentaires: commentairesDossier
      };
    } catch (error) {
      console.error('Erreur lors de la récupération du dossier complet:', error);
      throw error;
    }
  }

  // Ajouter un document au dossier
  async ajouterDocument(dossierId, nom, type, file, utilisateurId) {
    try {
      // Vérifier l'accès au dossier
      const [dossier] = await db
        .select()
        .from(dossiersMedicaux)
        .where(eq(dossiersMedicaux.id, dossierId))
        .limit(1);

      if (!dossier) {
        throw new Error('Dossier non trouvé');
      }

      // Vérifier l'accès (patient propriétaire ou médecin autorisé)
      let hasAccess = false;
      
      if (dossier.idPatient === utilisateurId) {
        hasAccess = true;
      } else {
        // Vérifier si le médecin a un accès autorisé
        const [acces] = await db
          .select()
          .from(accesDossiers)
          .where(and(
            eq(accesDossiers.idDossier, dossierId),
            eq(accesDossiers.idMedecin, utilisateurId),
            eq(accesDossiers.statut, 'ACTIF')
          ))
          .limit(1);
        
        hasAccess = !!acces;
      }

      if (!hasAccess) {
        throw new Error('Accès non autorisé à ce dossier');
      }

      // Upload du fichier vers Cloudinary
      const uploadResult = await uploadService.uploadMedicalDocument(
        file.buffer, 
        file.originalname, 
        `dossier_${dossierId}`
      );

      if (!uploadResult.success) {
        throw new Error('Erreur lors de l\'upload du fichier');
      }

      // Enregistrer en base
      const [document] = await db.insert(documentsMedicaux).values({
        idDossier: dossierId,
        nom,
        type,
        cheminFichier: uploadResult.data.url
      }).returning();

      return document;
    } catch (error) {
      console.error('Erreur lors de l\'ajout du document:', error);
      throw error;
    }
  }

  // Ajouter une ordonnance
  async ajouterOrdonnance(dossierId, medicament, dosage, duree, medecinId) {
    try {
      // Vérifier que le médecin a accès au dossier
      const [dossier] = await db
        .select()
        .from(dossiersMedicaux)
        .where(eq(dossiersMedicaux.id, dossierId))
        .limit(1);

      if (!dossier || dossier.idMedecin !== medecinId) {
        throw new Error('Accès non autorisé à ce dossier');
      }

      const [ordonnance] = await db.insert(ordonnances).values({
        idDossier: dossierId,
        medicament,
        dosage,
        duree
      }).returning();

      return ordonnance;
    } catch (error) {
      console.error('Erreur lors de l\'ajout de l\'ordonnance:', error);
      throw error;
    }
  }

  // Ajouter une allergie
  async ajouterAllergie(dossierId, nom, utilisateurId) {
    try {
      // Vérifier l'accès au dossier
      const [dossier] = await db
        .select()
        .from(dossiersMedicaux)
        .where(eq(dossiersMedicaux.id, dossierId))
        .limit(1);

      if (!dossier) {
        throw new Error('Dossier non trouvé');
      }

      if (dossier.idPatient !== utilisateurId && dossier.idMedecin !== utilisateurId) {
        throw new Error('Accès non autorisé à ce dossier');
      }

      const [allergie] = await db.insert(allergies).values({
        idDossier: dossierId,
        nom
      }).returning();

      return allergie;
    } catch (error) {
      console.error('Erreur lors de l\'ajout de l\'allergie:', error);
      throw error;
    }
  }

  // Ajouter un commentaire
  async ajouterCommentaire(dossierId, contenu, auteurId) {
    try {
      // Vérifier l'accès au dossier
      const [dossier] = await db
        .select()
        .from(dossiersMedicaux)
        .where(eq(dossiersMedicaux.id, dossierId))
        .limit(1);

      if (!dossier) {
        throw new Error('Dossier non trouvé');
      }

      if (dossier.idPatient !== auteurId && dossier.idMedecin !== auteurId) {
        throw new Error('Accès non autorisé à ce dossier');
      }

      const [commentaire] = await db.insert(commentaires).values({
        idDossier: dossierId,
        contenu,
        auteur: auteurId
      }).returning();

      return commentaire;
    } catch (error) {
      console.error('Erreur lors de l\'ajout du commentaire:', error);
      throw error;
    }
  }

  // Mettre à jour le statut d'un dossier
  async mettreAJourStatut(dossierId, statut, medecinId) {
    try {
      const [dossier] = await db
        .select()
        .from(dossiersMedicaux)
        .where(eq(dossiersMedicaux.id, dossierId))
        .limit(1);

      if (!dossier || dossier.idMedecin !== medecinId) {
        throw new Error('Accès non autorisé à ce dossier');
      }

      await db
        .update(dossiersMedicaux)
        .set({ 
          statut,
          dateModification: new Date()
        })
        .where(eq(dossiersMedicaux.id, dossierId));

      return { success: true };
    } catch (error) {
      console.error('Erreur lors de la mise à jour du statut:', error);
      throw error;
    }
  }

  // Supprimer un dossier médical
  async supprimerDossier(dossierId, patientId) {
    try {
      // Vérifier que le dossier appartient au patient
      const [dossier] = await db
        .select()
        .from(dossiersMedicaux)
        .where(eq(dossiersMedicaux.id, dossierId))
        .limit(1);

      if (!dossier || dossier.idPatient !== patientId) {
        throw new Error('Dossier non trouvé ou accès non autorisé');
      }

      // Supprimer les documents associés de Cloudinary
      const documents = await db
        .select()
        .from(documentsMedicaux)
        .where(eq(documentsMedicaux.idDossier, dossierId));

      for (const document of documents) {
        try {
          // Extraire le public_id de l'URL Cloudinary pour supprimer le fichier
          const urlMatch = document.cheminFichier.match(/\/v\d+\/(.+)$/);
          if (urlMatch) {
            const publicId = urlMatch[1].replace(/\.[^.]+$/, '');
            await uploadService.deleteFile(publicId);
          }
        } catch (deleteError) {
          console.warn('Erreur lors de la suppression du fichier Cloudinary:', deleteError);
        }
      }

      // Supprimer le dossier (cascade supprimera les éléments liés)
      await db
        .delete(dossiersMedicaux)
        .where(eq(dossiersMedicaux.id, dossierId));

      return { success: true };
    } catch (error) {
      console.error('Erreur lors de la suppression du dossier:', error);
      throw error;
    }
  }

  // Générer un PDF du dossier complet
  async genererPDFDossier(dossierId, utilisateurId) {
    try {
      const dossier = await this.obtenirDossierComplet(dossierId, utilisateurId);
      
      // Ici, nous utiliserions une bibliothèque comme PDFKit ou Puppeteer
      // Pour l'instant, nous retournons un PDF simple avec les informations de base
      const PDFDocument = require('pdfkit');
      const doc = new PDFDocument();
      
      let buffers = [];
      doc.on('data', buffers.push.bind(buffers));
      
      return new Promise((resolve, reject) => {
        doc.on('end', () => {
          const pdfBuffer = Buffer.concat(buffers);
          resolve(pdfBuffer);
        });

        doc.on('error', reject);

        // Contenu du PDF
        doc.fontSize(20).text('Dossier Médical', 100, 100);
        doc.fontSize(14).text(`Titre: ${dossier.titre}`, 100, 140);
        doc.text(`Type: ${dossier.type}`, 100, 160);
        doc.text(`Statut: ${dossier.statut}`, 100, 180);
        doc.text(`Date de création: ${new Date(dossier.dateCreation).toLocaleDateString('fr-FR')}`, 100, 200);
        
        if (dossier.description) {
          doc.text(`Description: ${dossier.description}`, 100, 220);
        }

        let yPosition = 260;

        // Ordonnances
        if (dossier.ordonnances && dossier.ordonnances.length > 0) {
          doc.fontSize(16).text('Ordonnances:', 100, yPosition);
          yPosition += 30;
          
          dossier.ordonnances.forEach((ordonnance, index) => {
            doc.fontSize(12).text(`${index + 1}. ${ordonnance.medicament} - ${ordonnance.dosage} - ${ordonnance.duree}`, 120, yPosition);
            yPosition += 20;
          });
          yPosition += 20;
        }

        // Allergies
        if (dossier.allergies && dossier.allergies.length > 0) {
          doc.fontSize(16).text('Allergies:', 100, yPosition);
          yPosition += 30;
          
          dossier.allergies.forEach((allergie, index) => {
            doc.fontSize(12).text(`${index + 1}. ${allergie.nom}`, 120, yPosition);
            yPosition += 20;
          });
          yPosition += 20;
        }

        // Documents
        if (dossier.documents && dossier.documents.length > 0) {
          doc.fontSize(16).text('Documents:', 100, yPosition);
          yPosition += 30;
          
          dossier.documents.forEach((document, index) => {
            doc.fontSize(12).text(`${index + 1}. ${document.nom} (${document.type})`, 120, yPosition);
            yPosition += 20;
          });
        }

        doc.end();
      });
    } catch (error) {
      console.error('Erreur lors de la génération du PDF:', error);
      throw error;
    }
  }

  // Télécharger un document spécifique
  async telechargerDocument(dossierId, documentId, utilisateurId) {
    try {
      // Vérifier l'accès au dossier
      const [dossier] = await db
        .select()
        .from(dossiersMedicaux)
        .where(eq(dossiersMedicaux.id, dossierId))
        .limit(1);

      if (!dossier) {
        throw new Error('Dossier non trouvé');
      }

      // Vérifier l'accès
      let hasAccess = false;
      
      if (dossier.idPatient === utilisateurId) {
        hasAccess = true;
      } else {
        const [acces] = await db
          .select()
          .from(accesDossiers)
          .where(and(
            eq(accesDossiers.idDossier, dossierId),
            eq(accesDossiers.idMedecin, utilisateurId),
            eq(accesDossiers.statut, 'ACTIF')
          ))
          .limit(1);
        
        hasAccess = !!acces;
      }

      if (!hasAccess) {
        throw new Error('Accès non autorisé à ce dossier');
      }

      // Récupérer le document
      const [document] = await db
        .select()
        .from(documentsMedicaux)
        .where(and(
          eq(documentsMedicaux.id, documentId),
          eq(documentsMedicaux.idDossier, dossierId)
        ))
        .limit(1);

      if (!document) {
        throw new Error('Document non trouvé');
      }

      // Télécharger le fichier depuis Cloudinary
      const fileData = await uploadService.downloadFile(document.cheminFichier);
      
      return {
        buffer: fileData.buffer,
        fileName: document.nom,
        contentType: fileData.contentType || 'application/octet-stream'
      };
    } catch (error) {
      console.error('Erreur lors du téléchargement du document:', error);
      throw error;
    }
  }

  // Obtenir la liste des médecins ayant accès à un dossier
  async obtenirAccesDossier(dossierId, patientId) {
    try {
      // Vérifier que le dossier appartient au patient
      const [dossier] = await db
        .select()
        .from(dossiersMedicaux)
        .where(eq(dossiersMedicaux.id, dossierId))
        .limit(1);

      if (!dossier || dossier.idPatient !== patientId) {
        throw new Error('Dossier non trouvé ou accès non autorisé');
      }

      // Récupérer les accès actifs
      const acces = await db
        .select({
          id: accesDossiers.id,
          typeAcces: accesDossiers.typeAcces,
          dateAutorisation: accesDossiers.dateAutorisation,
          medecin: {
            id: users.id,
            firstName: users.firstName,
            lastName: users.lastName,
            profilePicture: users.profilePicture
          }
        })
        .from(accesDossiers)
        .innerJoin(users, eq(accesDossiers.idMedecin, users.id))
        .where(and(
          eq(accesDossiers.idDossier, dossierId),
          eq(accesDossiers.statut, 'ACTIF')
        ))
        .orderBy(desc(accesDossiers.dateAutorisation));

      return acces;
    } catch (error) {
      console.error('Erreur lors de la récupération des accès:', error);
      throw error;
    }
  }
}

module.exports = new DossierService();