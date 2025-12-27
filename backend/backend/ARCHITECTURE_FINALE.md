# Med Connect - Architecture Finale Clarifiée

## 🎯 Principe Fondamental : Contrôle Total du Patient

**Les patients sont les seuls propriétaires de leurs données médicales.** Ils contrôlent entièrement qui peut accéder à leurs dossiers et peuvent révoquer cet accès à tout moment.

## 🔄 Flux de Connexion Patient-Médecin

### 1. Patient Crée Son Dossier
- **Qui** : Patient uniquement
- **Action** : Création de dossier médical personnel
- **API** : `POST /api/dossiers`
- **Résultat** : Dossier privé, accessible uniquement au patient

### 2. Patient Recherche un Médecin
- **Qui** : Patient
- **Action** : Recherche par spécialité, nom, localisation
- **API** : `GET /api/messages/medecins/recherche`
- **Résultat** : Liste des médecins disponibles

### 3. Patient Envoie une Demande de Connexion
- **Qui** : Patient
- **Action** : Demande d'accès avec message personnalisé
- **API** : `POST /api/connexions/demandes`
- **Résultat** : Demande envoyée au médecin + notification

### 4. Médecin Reçoit et Accepte la Demande
- **Qui** : Médecin
- **Action** : Acceptation ou refus de la demande
- **API** : `POST /api/connexions/demandes/:id/repondre`
- **Résultat** : Accès automatique à TOUS les dossiers du patient

### 5. Médecin Peut Maintenant
- ✅ **Consulter** tous les dossiers du patient
- ✅ **Prescrire des ordonnances**
- ✅ **Organiser des rendez-vous**
- ✅ **Ajouter des commentaires médicaux**
- ❌ **Ne peut PAS modifier** les documents du patient

### 6. Patient Peut Annuler la Connexion
- **Qui** : Patient uniquement
- **Action** : Révocation immédiate de l'accès
- **API** : `DELETE /api/dossiers/:id/acces/:medecinId`
- **Résultat** : Médecin perd immédiatement l'accès à TOUS les dossiers

## 🏗️ Architecture de Base de Données

```
users (patients, médecins, admins)
├── parametres_sante (tableau de bord patient)
├── dossiers_medicaux (créés par patients uniquement)
│   ├── acces_dossiers (autorisations données par patients)
│   ├── documents_medicaux (uploadés par patients)
│   ├── ordonnances (prescrites par médecins autorisés)
│   ├── allergies (gérées par patients)
│   └── commentaires (patients + médecins autorisés)
├── demandes_connexion (patients → médecins)
├── rendez_vous (organisés par médecins autorisés)
├── messages (communication sécurisée)
└── notifications (système + utilisateur)
```

## 🎭 Rôles et Permissions

### Patient (Propriétaire des Données)
- ✅ Créer ses dossiers médicaux
- ✅ Uploader ses documents (PDF, images)
- ✅ Gérer ses paramètres de santé
- ✅ Rechercher et contacter des médecins
- ✅ Envoyer des demandes de connexion
- ✅ Donner/révoquer l'accès aux médecins
- ✅ Voir ses rendez-vous
- ✅ Communiquer avec médecins connectés

### Médecin (Accès Conditionnel)
- ✅ Recevoir des demandes de connexion
- ✅ Accepter/refuser les demandes
- ✅ Consulter dossiers des patients connectés
- ✅ Prescrire des ordonnances
- ✅ Organiser des rendez-vous
- ✅ Ajouter des commentaires médicaux
- ✅ Communiquer avec patients connectés
- ❌ Ne peut PAS créer de dossiers patients
- ❌ Ne peut PAS modifier les documents patients
- ❌ Perd l'accès si patient révoque

### Administrateur (Gestion Système)
- ✅ Valider les candidatures médecins
- ✅ Gérer les utilisateurs (activer/désactiver)
- ✅ Consulter les statistiques système
- ✅ Recevoir notifications système

## 📱 APIs Complètes par Fonctionnalité

### Gestion des Dossiers (Patient-Centric)
```
POST   /api/dossiers                    # Créer dossier (patient)
GET    /api/dossiers                    # Lister ses dossiers
GET    /api/dossiers/dossier/:id        # Dossier complet
POST   /api/dossiers/:id/acces          # Donner accès médecin
DELETE /api/dossiers/:id/acces/:medId   # Révoquer accès
POST   /api/dossiers/:id/documents      # Ajouter documents
POST   /api/dossiers/:id/allergies      # Ajouter allergies
POST   /api/dossiers/:id/commentaires   # Ajouter commentaires
POST   /api/dossiers/:id/ordonnances    # Prescrire (médecin)
```

### Système de Connexion
```
POST   /api/connexions/demandes         # Envoyer demande (patient)
GET    /api/connexions/demandes/patient # Mes demandes (patient)
GET    /api/connexions/demandes/medecin # Demandes reçues (médecin)
POST   /api/connexions/demandes/:id/repondre # Répondre (médecin)
```

### Tableau de Bord Santé
```
GET    /api/sante/tableau-de-bord       # Dashboard patient
GET    /api/sante/parametres            # Paramètres santé
PUT    /api/sante/parametres            # Mettre à jour paramètres
GET    /api/sante/medecins-connectes    # Médecins autorisés
GET    /api/sante/patients-connectes    # Patients (médecin)
```

### Rendez-vous
```
POST   /api/rendez-vous                 # Créer RDV (médecin)
GET    /api/rendez-vous                 # Lister RDV
PATCH  /api/rendez-vous/:id/statut      # Modifier statut
PATCH  /api/rendez-vous/:id/annuler     # Annuler RDV
```

### Communication
```
POST   /api/messages                    # Envoyer message
GET    /api/messages/conversations      # Lister conversations
GET    /api/messages/medecins/recherche # Rechercher médecins
```

### Upload avec Progression
```
POST   /api/upload/progress             # Upload avec SSE
POST   /api/upload/simple               # Upload simple
DELETE /api/upload/:publicId            # Supprimer fichier
```

## 🔒 Sécurité et Contrôle d'Accès

### Authentification
- **2FA obligatoire** pour tous les utilisateurs
- **Tokens JWT** avec expiration courte (15min)
- **Refresh tokens** avec rotation automatique

### Autorisation
- **Contrôle granulaire** par dossier
- **Vérification systématique** des accès avant chaque opération
- **Révocation immédiate** possible par le patient

### Validation
- **Validation stricte** de toutes les données d'entrée
- **Sanitisation** des contenus utilisateur
- **Rate limiting** pour prévenir les abus

## 🎯 Avantages de cette Architecture

### Pour les Patients
- **Contrôle total** de leurs données médicales
- **Transparence complète** sur qui accède à quoi
- **Révocation instantanée** des accès
- **Centralisation** de tous leurs documents médicaux

### Pour les Médecins
- **Vue d'ensemble** du patient après autorisation
- **Outils intégrés** (ordonnances, RDV, commentaires)
- **Communication directe** avec les patients
- **Respect automatique** des révocations d'accès

### Pour le Système de Santé
- **Continuité des soins** améliorée
- **Réduction des doublons** d'examens
- **Traçabilité complète** des accès
- **Conformité RGPD** par design

## ✅ Conformité aux Spécifications

Cette architecture respecte parfaitement le document de spécifications :
- ✅ Plateforme à deux faces (patients/médecins)
- ✅ Contrôle total des patients sur leurs données
- ✅ Vue sécurisée et centralisée pour les médecins
- ✅ Communication directe et sécurisée
- ✅ Gestion complète des documents médicaux
- ✅ Système de demandes de connexion
- ✅ Tableau de bord de santé personnel

**Status** : ✅ **PRODUCTION READY** - Architecture patient-centric complète et sécurisée