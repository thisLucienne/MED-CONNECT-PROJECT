# Med Connect - Backend API

![Med Connect Logo](assets/med-connect.png)

## 📋 Description

Med Connect est une plateforme mobile de santé connectée qui révolutionne la façon dont les patients et les professionnels de santé gèrent et accèdent aux dossiers médicaux. 

## 🎯 Principe Fondamental : Contrôle Patient

**Les patients sont propriétaires de leurs données médicales** et contrôlent entièrement qui peut y accéder. Les médecins n'ont accès aux dossiers qu'avec l'autorisation explicite du patient.

### Flux de Connexion Patient-Médecin

1. **Patient crée son dossier médical** et y ajoute ses documents
2. **Patient envoie une demande de connexion** au médecin de son choix
3. **Médecin accepte la demande** → Accès automatique au dossier du patient
4. **Médecin peut consulter, prescrire des ordonnances, organiser des rendez-vous**
5. **Patient peut annuler la connexion** à tout moment → Médecin perd l'accès immédiatement

Ce repository contient l'API backend développée avec Node.js, Express, et PostgreSQL, conçue pour une application mobile multiplateforme.

## 🚀 Fonctionnalités

### 🔐 Authentification & Sécurité
- **Authentification à deux facteurs (2FA)** par email pour patients et médecins
- **Gestion des rôles** : Patients, Médecins, Administrateurs
- **Tokens JWT** avec refresh tokens
- **Hachage sécurisé** des mots de passe avec bcrypt
- **Rate limiting** et protection contre les attaques par force brute
- **Validation stricte** des données d'entrée

### 👥 Gestion des Utilisateurs
- **Inscription patients** : Inscription directe avec activation immédiate
- **Inscription médecins** : Candidature soumise pour validation par les admins
- **Validation manuelle** des médecins par les administrateurs
- **Upload de photos de profil** avec Cloudinary et progression temps réel
- **Gestion des statuts** : Actif, En attente, Approuvé, Rejeté, Bloqué
- **Contrôle d'accès granulaire** : Patients contrôlent qui accède à leurs données

### 🏥 Dossiers Médicaux (100% Patient-Centric)
- **Création exclusive par les patients** : Seuls les patients créent leurs dossiers
- **Demandes de connexion** : Les patients invitent les médecins à accéder à leurs données
- **Accès conditionnel** : Les médecins n'accèdent qu'aux dossiers autorisés
- **Upload de documents** : PDF, images avec progression temps réel
- **Classification par type** : Résultats de laboratoire, radiographies, ordonnances, notes
- **Révocation instantanée** : Le patient peut couper l'accès à tout moment

### 🩺 Fonctionnalités Médecin (Accès Autorisé Uniquement)
- **Consultation des dossiers** : Accès en lecture aux dossiers partagés
- **Prescription d'ordonnances** : Ajout d'ordonnances aux dossiers autorisés
- **Organisation de rendez-vous** : Planification de consultations avec les patients
- **Suivi médical** : Ajout de commentaires et notes de suivi
- **Pas de modification** : Les médecins ne peuvent pas modifier les documents patients

### 🔗 Système de Connexion Patient-Médecin

#### Pour les Patients
- **Recherche de médecins** : Par nom, spécialité, localisation
- **Envoi de demandes** : Demande d'accès avec message personnalisé
- **Gestion des connexions** : Voir tous les médecins connectés
- **Révocation d'accès** : Annuler une connexion en un clic
- **Contrôle total** : Décision finale sur qui accède aux données

#### Pour les Médecins
- **Réception de demandes** : Notifications des demandes patients
- **Acceptation simple** : Accès automatique après acceptation
- **Consultation complète** : Vue d'ensemble du dossier patient
- **Outils médicaux** : Ordonnances, rendez-vous, commentaires
- **Respect de la révocation** : Perte d'accès immédiate si patient annule

### 💬 Communication Sécurisée
- **Messagerie chiffrée** : Communication directe patient-médecin connecté
- **Notifications temps réel** : Alertes pour nouveaux messages et activités
- **Historique sécurisé** : Conservation des échanges médicaux

### 📧 Système d'Emails
- **Templates HTML professionnels** avec design responsive
- **Emails de bienvenue** pour les nouveaux patients
- **Codes 2FA** envoyés par email
- **Notifications de validation** pour les médecins
- **Alertes administrateurs** pour les nouvelles candidatures

### 🛡️ Sécurité Avancée
- **Protection CSRF** et headers de sécurité
- **Validation des fichiers** uploadés (type, taille)
- **Sanitisation des entrées** utilisateur
- **Nettoyage automatique** des données expirées
- **Logs de sécurité** et monitoring

## 🛠️ Technologies Utilisées

### Backend
- **Node.js** - Runtime JavaScript
- **Express.js** - Framework web
- **Drizzle ORM** - ORM pour PostgreSQL
- **PostgreSQL** - Base de données relationnelle
- **JWT** - Authentification par tokens
- **bcrypt** - Hachage des mots de passe

### Services Externes
- **Cloudinary** - Stockage et traitement d'images
- **Nodemailer** - Envoi d'emails
- **Gmail SMTP** - Service d'email

### Outils de Développement
- **Jest** - Framework de tests
- **Supertest** - Tests d'API
- **Nodemon** - Rechargement automatique en développement
- **Drizzle Kit** - Migrations de base de données

## 📦 Installation

### Prérequis
- **Node.js** >= 18.0.0
- **PostgreSQL** >= 13.0
- **npm** ou **yarn**

### 1. Cloner le repository
```bash
git clone <repository-url>
cd med-connect/backend
```

### 2. Installer les dépendances
```bash
npm install
```

### 3. Configuration de l'environnement
Copiez le fichier `.env.example` vers `.env` et configurez les variables :

```bash
cp .env.example .env
```

Éditez le fichier `.env` avec vos configurations :

```env
# Base de données PostgreSQL
DB_HOST=localhost
DB_PORT=5432
DB_NAME=med_connect
DB_USER=your_db_user
DB_PASSWORD=your_db_password

# JWT Configuration
JWT_SECRET=your_super_secret_jwt_key_change_in_production
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

# Serveur
PORT=5000
NODE_ENV=development

# Cloudinary (pour l'upload d'images)
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Configuration Email (Gmail)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASSWORD=your_app_password
EMAIL_FROM=Med Connect <noreply@medconnect.com>

# Admin par défaut
DEFAULT_ADMIN_EMAIL=admin@medconnect.com
DEFAULT_ADMIN_PASSWORD=Admin123!@#

# Sécurité
BCRYPT_ROUNDS=12
2FA_CODE_EXPIRY_MINUTES=10
MAX_LOGIN_ATTEMPTS=3
LOCKOUT_TIME_MINUTES=30
```

### 4. Configuration de la base de données

#### Créer la base de données PostgreSQL
```sql
CREATE DATABASE med_connect;
CREATE USER med_connect_user WITH PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE med_connect TO med_connect_user;
```

#### Appliquer les migrations
```bash
npm run db:push
```

### 5. Configuration des services externes

#### Cloudinary
1. Créez un compte sur [Cloudinary](https://cloudinary.com/)
2. Récupérez vos clés API dans le dashboard
3. Ajoutez-les dans votre fichier `.env`

#### Gmail SMTP
1. Activez l'authentification à 2 facteurs sur votre compte Gmail
2. Générez un mot de passe d'application
3. Utilisez ce mot de passe dans `EMAIL_PASSWORD`

## 🚀 Démarrage

### Mode développement
```bash
npm run dev
```

### Mode production
```bash
npm start
```

Le serveur démarre sur `http://localhost:5000` (ou le port configuré dans `.env`).

## 🧪 Tests

### Lancer tous les tests
```bash
npm test
```

### Tests en mode watch
```bash
npm run test:watch
```

### Tests avec couverture de code
```bash
npm run test:coverage
```

### Types de tests disponibles
- **Tests unitaires** : Validation des utilitaires et services
- **Tests d'intégration** : Flux complets d'authentification
- **Tests de sécurité** : Validation des mesures de sécurité
- **Tests d'API** : Endpoints et validation des données

## 🔄 Flux de Connexion Patient-Médecin Détaillé

### Étape 1 : Patient crée son dossier
```bash
POST /api/dossiers
{
  "titre": "Mon dossier médical",
  "description": "Suivi de ma santé",
  "type": "CONSULTATION"
}
```

### Étape 2 : Patient recherche un médecin
```bash
GET /api/messages/medecins/recherche?specialite=Cardiologie
```

### Étape 3 : Patient envoie une demande de connexion
```bash
POST /api/connexions/demandes
{
  "medecinId": "uuid-medecin",
  "message": "Bonjour docteur, j'aimerais vous donner accès à mon dossier pour un suivi cardiologique."
}
```

### Étape 4 : Médecin accepte la demande
```bash
POST /api/connexions/demandes/:demandeId/repondre
{
  "reponse": "accepter"
}
```
**→ Le médecin obtient automatiquement l'accès à TOUS les dossiers du patient**

### Étape 5 : Médecin peut maintenant
- **Consulter** : `GET /api/dossiers/dossier/:dossierId`
- **Prescrire** : `POST /api/dossiers/:dossierId/ordonnances`
- **Planifier RDV** : `POST /api/rendez-vous`
- **Commenter** : `POST /api/dossiers/:dossierId/commentaires`

### Étape 6 : Patient peut annuler la connexion
```bash
DELETE /api/dossiers/:dossierId/acces/:medecinId
```
**→ Le médecin perd immédiatement l'accès à TOUS les dossiers du patient**

## 📚 Documentation API

### Endpoints d'Authentification

#### `POST /api/auth/register/patient`
Inscription d'un nouveau patient.

**Body:**
```json
{
  "firstName": "John",
  "lastName": "Doe",
  "email": "john@example.com",
  "password": "StrongPass123!",
  "phone": "6 12 34 56 78"
}
```

**Réponse:**
```json
{
  "success": true,
  "message": "Inscription réussie ! Bienvenue sur Med Connect.",
  "data": {
    "user": {
      "id": "uuid",
      "email": "john@example.com",
      "firstName": "John",
      "lastName": "Doe",
      "role": "PATIENT",
      "status": "ACTIVE"
    },
    "tokens": {
      "accessToken": "jwt_token",
      "refreshToken": "refresh_token"
    }
  }
}
```

#### `POST /api/auth/register/doctor`
Inscription d'un nouveau médecin (candidature).

**Body:**
```json
{
  "firstName": "Dr. Jane",
  "lastName": "Smith",
  "email": "jane@example.com",
  "password": "StrongPass123!",
  "specialty": "Cardiology",
  "licenseNumber": "MED-2024/001",
  "phone": "6 12 34 56 78"
}
```

#### `POST /api/auth/login`
Connexion utilisateur (première étape).

**Body:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Réponse (2FA requis):**
```json
{
  "success": true,
  "message": "Code de vérification envoyé par email",
  "data": {
    "user": {
      "id": "uuid",
      "email": "user@example.com",
      "requiresVerification": true
    }
  }
}
```

#### `POST /api/auth/verify-2fa`
Vérification du code 2FA.

**Body:**
```json
{
  "userId": "user-uuid",
  "code": "1234"
}
```

#### `POST /api/auth/refresh`
Rafraîchissement des tokens.

**Body:**
```json
{
  "refreshToken": "refresh_token"
}
```

#### `GET /api/auth/profile`
Obtenir le profil utilisateur (authentification requise).

**Headers:**
```
Authorization: Bearer <access_token>
```

### Endpoints d'Administration

#### `GET /api/admin/doctors/pending`
Liste des médecins en attente de validation (admin requis).

#### `POST /api/admin/doctors/:doctorId/validate`
Valider ou rejeter une candidature de médecin.

**Body:**
```json
{
  "action": "approve", // ou "reject"
  "rejectionReason": "Raison du rejet (si action = reject)"
}
```

#### `GET /api/admin/users`
Liste de tous les utilisateurs avec filtres.

**Query Parameters:**
- `page`: Numéro de page (défaut: 1)
- `limit`: Nombre d'éléments par page (défaut: 10)
- `role`: Filtrer par rôle (PATIENT, DOCTOR, ADMIN)
- `status`: Filtrer par statut
- `search`: Recherche textuelle

#### `GET /api/admin/stats`
Statistiques du système.

### Endpoints de Messagerie

#### `POST /api/messages`
Envoyer un message à un autre utilisateur.

**Headers:**
```
Authorization: Bearer <access_token>
```

**Body:**
```json
{
  "destinataireId": "uuid-destinataire",
  "contenu": "Bonjour docteur, j'ai besoin d'une consultation.",
  "objet": "Demande de consultation"
}
```

#### `GET /api/messages/conversations`
Obtenir toutes les conversations de l'utilisateur connecté.

#### `GET /api/messages/conversations/:autreUtilisateurId`
Obtenir les messages d'une conversation spécifique.

#### `PATCH /api/messages/:messageId/lu`
Marquer un message comme lu.

#### `GET /api/messages/medecins/recherche`
Rechercher des médecins (patients uniquement).

**Query Parameters:**
- `specialite`: Filtrer par spécialité
- `nom`: Rechercher par nom

### Endpoints de Notifications

#### `GET /api/notifications`
Obtenir les notifications de l'utilisateur.

**Query Parameters:**
- `page`: Numéro de page
- `limite`: Nombre par page
- `nonLuesUniquement`: true/false

#### `GET /api/notifications/count`
Compter les notifications non lues.

#### `PATCH /api/notifications/:notificationId/lu`
Marquer une notification comme lue.

#### `PATCH /api/notifications/marquer-toutes-lues`
Marquer toutes les notifications comme lues.

#### `DELETE /api/notifications/:notificationId`
Supprimer une notification.

### Endpoints de Dossiers Médicaux

#### `POST /api/dossiers`
Créer un dossier médical (patients uniquement - ils créent leurs propres dossiers).

**Body:**
```json
{
  "titre": "Mon dossier cardiologie",
  "description": "Suivi de ma santé cardiaque",
  "type": "CONSULTATION"
}
```

#### `GET /api/dossiers`
Obtenir les dossiers de l'utilisateur connecté.

#### `GET /api/dossiers/dossier/:dossierId`
Obtenir un dossier complet avec tous ses éléments.

#### `POST /api/dossiers/:dossierId/documents`
Ajouter un document au dossier.

**Content-Type:** `multipart/form-data`

**Form Data:**
- `fichier`: Le fichier à uploader
- `nom`: Nom du document
- `type`: Type de document (radio, analyse, rapport)

#### `POST /api/dossiers/:dossierId/ordonnances`
Ajouter une ordonnance (médecins uniquement).

**Body:**
```json
{
  "medicament": "Paracétamol",
  "dosage": "500mg",
  "duree": "7 jours"
}
```

#### `POST /api/dossiers/:dossierId/allergies`
Ajouter une allergie.

**Body:**
```json
{
  "nom": "Pénicilline"
}
```

#### `POST /api/dossiers/:dossierId/commentaires`
Ajouter un commentaire.

**Body:**
```json
{
  "contenu": "Patient en bonne voie de guérison"
}
```

### Endpoints de Connexion Patient-Médecin

#### `POST /api/connexions/demandes`
Envoyer une demande de connexion à un médecin (patients uniquement).

**Body:**
```json
{
  "medecinId": "uuid-medecin",
  "message": "Bonjour docteur, j'aimerais vous donner accès à mon dossier médical pour un suivi cardiologique."
}
```

#### `GET /api/connexions/demandes/patient`
Obtenir ses demandes de connexion envoyées (patients).

#### `GET /api/connexions/demandes/medecin`
Obtenir les demandes de connexion reçues (médecins).

#### `POST /api/connexions/demandes/:demandeId/repondre`
Répondre à une demande de connexion (médecins uniquement).

**Body:**
```json
{
  "reponse": "accepter", // ou "refuser"
  "raisonRefus": "Raison du refus si applicable"
}
```

### Endpoints de Santé et Tableau de Bord

#### `GET /api/sante/tableau-de-bord`
Obtenir le tableau de bord de santé complet (patients).

**Réponse:**
```json
{
  "success": true,
  "data": {
    "patient": {
      "id": "uuid",
      "firstName": "John",
      "lastName": "Doe"
    },
    "parametresSante": {
      "groupeSanguin": "A+",
      "allergiesConnues": "Pénicilline",
      "medicamentsActuels": "Aspirine 100mg"
    },
    "statistiques": {
      "nombreDossiers": 3,
      "nombreDocuments": 15,
      "nombreAllergies": 2
    }
  }
}
```

#### `PUT /api/sante/parametres`
Mettre à jour ses paramètres de santé (patients).

**Body:**
```json
{
  "groupeSanguin": "A+",
  "poids": "70kg",
  "taille": "175cm",
  "allergiesConnues": "Pénicilline, Pollen",
  "medicamentsActuels": "Aspirine 100mg quotidien",
  "conditionsMedicales": "Hypertension légère",
  "contactUrgence": "Marie Doe (épouse)",
  "telephoneUrgence": "6 12 34 56 78"
}
```

#### `GET /api/sante/medecins-connectes`
Obtenir la liste des médecins ayant accès à ses dossiers (patients).

#### `GET /api/sante/patients-connectes`
Obtenir la liste des patients ayant donné accès (médecins).

### Endpoints de Rendez-vous

#### `POST /api/rendez-vous`
Créer un rendez-vous (médecins uniquement, pour leurs patients connectés).

**Body:**
```json
{
  "patientId": "uuid-patient",
  "dateRendezVous": "2024-02-15T14:30:00.000Z",
  "duree": 30,
  "motif": "Consultation de suivi cardiologique"
}
```

#### `GET /api/rendez-vous`
Obtenir ses rendez-vous (patients voient leurs RDV, médecins voient leurs consultations).

**Query Parameters:**
- `futurs=true` : Afficher uniquement les rendez-vous à venir

#### `PATCH /api/rendez-vous/:rdvId/statut`
Mettre à jour le statut d'un rendez-vous.

**Body:**
```json
{
  "statut": "CONFIRME", // CONFIRME, ANNULE, TERMINE
  "notes": "Notes du médecin (optionnel)"
}
```

#### `PATCH /api/rendez-vous/:rdvId/annuler`
Annuler un rendez-vous.

**Body:**
```json
{
  "raison": "Raison de l'annulation"
}
```

### Endpoints d'Upload

#### `POST /api/upload/progress`
Upload de fichier avec progression en temps réel (Server-Sent Events).

**Content-Type:** `multipart/form-data`

**Form Data:**
- `file`: Le fichier à uploader
- `folder`: Dossier de destination (optionnel)

**Réponse:** Stream d'événements avec progression
```
data: {"type":"progress","percentage":25,"message":"Upload en cours: 25%"}

data: {"type":"progress","percentage":50,"message":"Upload en cours: 50%"}

data: {"type":"complete","percentage":100,"data":{"url":"...","publicId":"..."},"message":"Upload terminé avec succès"}
```

#### `POST /api/upload/simple`
Upload simple sans progression.

**Content-Type:** `multipart/form-data`

**Form Data:**
- `file`: Le fichier à uploader
- `folder`: Dossier de destination (optionnel)

**Réponse:**
```json
{
  "success": true,
  "message": "Fichier uploadé avec succès",
  "data": {
    "url": "https://res.cloudinary.com/...",
    "publicId": "med-connect/documents/doc_123456",
    "format": "pdf",
    "size": 1024000
  }
}
```

#### `DELETE /api/upload/:publicId`
Supprimer un fichier uploadé.

### Endpoint de Santé

#### `GET /health`
Vérification de l'état du serveur et des services.

**Réponse:**
```json
{
  "success": true,
  "status": "healthy",
  "timestamp": "2024-01-01T12:00:00.000Z",
  "services": {
    "server": {
      "status": "running",
      "uptime": 3600,
      "memory": {...},
      "version": "v18.0.0"
    },
    "database": {
      "status": "connected",
      "type": "PostgreSQL"
    }
  }
}
```

## � Géuide d'Upload de Fichiers

### Upload de Photo de Profil

#### Méthode 1 : Via l'endpoint d'authentification
```javascript
// Lors de l'inscription ou mise à jour du profil
const formData = new FormData();
formData.append('firstName', 'John');
formData.append('lastName', 'Doe');
formData.append('email', 'john@example.com');
formData.append('password', 'StrongPass123!');
formData.append('profilePicture', fileInput.files[0]); // Fichier image

fetch('/api/auth/register/patient', {
  method: 'POST',
  body: formData
});
```

#### Méthode 2 : Upload séparé avec progression
```javascript
// Upload avec suivi de progression
const formData = new FormData();
formData.append('file', fileInput.files[0]);
formData.append('folder', 'profiles');

// Utiliser EventSource pour suivre la progression
const eventSource = new EventSource('/api/upload/progress');

fetch('/api/upload/progress', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${accessToken}`
  },
  body: formData
});

eventSource.onmessage = function(event) {
  const data = JSON.parse(event.data);
  
  if (data.type === 'progress') {
    console.log(`Progression: ${data.percentage}%`);
    updateProgressBar(data.percentage);
  } else if (data.type === 'complete') {
    console.log('Upload terminé:', data.data.url);
    eventSource.close();
  } else if (data.type === 'error') {
    console.error('Erreur:', data.message);
    eventSource.close();
  }
};
```

### Upload de Documents Médicaux

#### Upload simple
```javascript
const formData = new FormData();
formData.append('fichier', fileInput.files[0]);
formData.append('nom', 'Radio thoracique');
formData.append('type', 'radio');

fetch(`/api/dossiers/${dossierId}/documents`, {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${accessToken}`
  },
  body: formData
})
.then(response => response.json())
.then(data => {
  if (data.success) {
    console.log('Document ajouté:', data.data);
  }
});
```

#### Upload avec progression (recommandé pour gros fichiers)
```html
<!-- HTML -->
<input type="file" id="fileInput" accept=".pdf,.jpg,.png,.doc,.docx">
<div id="progressContainer" style="display: none;">
  <div id="progressBar" style="width: 0%; height: 20px; background: #1C74BC;"></div>
  <span id="progressText">0%</span>
</div>
<button onclick="uploadWithProgress()">Upload avec progression</button>

<script>
function uploadWithProgress() {
  const fileInput = document.getElementById('fileInput');
  const file = fileInput.files[0];
  
  if (!file) {
    alert('Veuillez sélectionner un fichier');
    return;
  }

  const formData = new FormData();
  formData.append('file', file);
  formData.append('folder', 'medical-documents');

  // Afficher la barre de progression
  document.getElementById('progressContainer').style.display = 'block';

  // Créer EventSource pour recevoir les mises à jour de progression
  const eventSource = new EventSource('/api/upload/progress');
  
  eventSource.onmessage = function(event) {
    const data = JSON.parse(event.data);
    
    if (data.type === 'progress') {
      updateProgress(data.percentage);
    } else if (data.type === 'complete') {
      updateProgress(100);
      console.log('Upload terminé:', data.data);
      eventSource.close();
      
      // Maintenant ajouter le document au dossier
      addDocumentToFolder(data.data.url, data.data.publicId);
    } else if (data.type === 'error') {
      console.error('Erreur upload:', data.message);
      eventSource.close();
    }
  };

  // Démarrer l'upload
  fetch('/api/upload/progress', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
    },
    body: formData
  });
}

function updateProgress(percentage) {
  document.getElementById('progressBar').style.width = percentage + '%';
  document.getElementById('progressText').textContent = percentage + '%';
}

function addDocumentToFolder(fileUrl, publicId) {
  // Ajouter le document au dossier médical
  fetch(`/api/dossiers/${dossierId}/documents`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      nom: document.getElementById('fileInput').files[0].name,
      type: 'document',
      cheminFichier: fileUrl,
      publicId: publicId
    })
  });
}
</script>
```

### Types de Fichiers Supportés

#### Photos de Profil
- **Formats:** JPG, JPEG, PNG, WEBP
- **Taille max:** 5MB
- **Résolution:** Redimensionnement automatique à 300x300px
- **Optimisation:** Compression automatique

#### Documents Médicaux
- **Formats:** PDF, DOC, DOCX, JPG, JPEG, PNG
- **Taille max:** 10MB
- **Stockage:** Cloudinary avec organisation par dossiers

### Exemple d'Intégration React

```jsx
import React, { useState } from 'react';

const FileUpload = ({ dossierId, onUploadComplete }) => {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);

  const handleUpload = async (file) => {
    setUploading(true);
    setProgress(0);

    const formData = new FormData();
    formData.append('file', file);
    formData.append('folder', 'medical-documents');

    // EventSource pour la progression
    const eventSource = new EventSource('/api/upload/progress');
    
    eventSource.onmessage = (event) => {
      const data = JSON.parse(event.data);
      
      if (data.type === 'progress') {
        setProgress(data.percentage);
      } else if (data.type === 'complete') {
        setProgress(100);
        setUploading(false);
        eventSource.close();
        onUploadComplete(data.data);
      } else if (data.type === 'error') {
        console.error('Erreur:', data.message);
        setUploading(false);
        eventSource.close();
      }
    };

    // Démarrer l'upload
    try {
      await fetch('/api/upload/progress', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
        },
        body: formData
      });
    } catch (error) {
      console.error('Erreur upload:', error);
      setUploading(false);
      eventSource.close();
    }
  };

  return (
    <div>
      <input
        type="file"
        onChange={(e) => handleUpload(e.target.files[0])}
        disabled={uploading}
        accept=".pdf,.jpg,.png,.doc,.docx"
      />
      
      {uploading && (
        <div style={{ marginTop: '10px' }}>
          <div style={{
            width: '100%',
            height: '20px',
            backgroundColor: '#f0f0f0',
            borderRadius: '10px',
            overflow: 'hidden'
          }}>
            <div style={{
              width: `${progress}%`,
              height: '100%',
              backgroundColor: '#1C74BC',
              transition: 'width 0.3s ease'
            }} />
          </div>
          <p>{progress}% - Upload en cours...</p>
        </div>
      )}
    </div>
  );
};

export default FileUpload;
```

### Gestion des Erreurs d'Upload

```javascript
// Gestion complète des erreurs
const handleUploadError = (error) => {
  switch (error.code) {
    case 'FILE_TOO_LARGE':
      alert('Le fichier est trop volumineux (max 10MB)');
      break;
    case 'INVALID_FILE_TYPE':
      alert('Type de fichier non supporté');
      break;
    case 'UPLOAD_FAILED':
      alert('Échec de l\'upload, veuillez réessayer');
      break;
    default:
      alert('Erreur inconnue lors de l\'upload');
  }
};
```

## 🔒 Sécurité

### Mesures de Sécurité Implémentées

1. **Authentification Forte**
   - Mots de passe complexes obligatoires
   - Hachage bcrypt avec 12 rounds
   - 2FA par email pour patients et médecins

2. **Protection des Tokens**
   - JWT avec expiration courte (15 min)
   - Refresh tokens avec rotation
   - Validation stricte des claims

3. **Rate Limiting**
   - Limitation globale : 100 req/15min par IP
   - Protection contre le brute force sur login
   - Blocage temporaire après échecs répétés

4. **Validation des Données**
   - Validation Joi sur tous les endpoints
   - Sanitisation des entrées utilisateur
   - Validation stricte des fichiers uploadés

5. **Headers de Sécurité**
   - Helmet.js pour les headers HTTP
   - CORS configuré
   - Protection CSRF

### Politique de Mots de Passe
- Minimum 8 caractères
- Au moins 1 majuscule, 1 minuscule, 1 chiffre
- Au moins 1 caractère spécial
- Pas de mots de passe communs

### Gestion des Fichiers
- Types autorisés : JPG, PNG, WEBP
- Taille maximum : 5MB
- Redimensionnement automatique
- Stockage sécurisé sur Cloudinary

## 🗄️ Base de Données

### Schéma Principal

#### Table `users`
- `id` (UUID, PK)
- `email` (VARCHAR, UNIQUE)
- `password` (VARCHAR, haché)
- `firstName`, `lastName` (VARCHAR)
- `phone` (VARCHAR, optionnel)
- `profilePicture` (VARCHAR, URL Cloudinary)
- `role` (ENUM: PATIENT, DOCTOR, ADMIN)
- `status` (ENUM: ACTIVE, PENDING, APPROVED, REJECTED, BLOCKED)
- `isActive2FA` (BOOLEAN)
- `loginAttempts`, `lockedUntil` (sécurité)
- `lastConnection`, `createdAt`, `updatedAt`

#### Table `doctors`
- `id` (UUID, PK)
- `userId` (UUID, FK vers users)
- `specialty` (VARCHAR)
- `licenseNumber` (VARCHAR, UNIQUE)
- `approvedBy` (UUID, FK vers users)
- `approvedAt` (TIMESTAMP)
- `rejectionReason` (TEXT)

#### Table `two_factor_codes`
- `id` (UUID, PK)
- `userId` (UUID, FK vers users)
- `code` (VARCHAR(6))
- `expiresAt` (TIMESTAMP)
- `isUsed` (BOOLEAN)
- `attempts` (VARCHAR)

#### Table `refresh_tokens`
- `id` (UUID, PK)
- `userId` (UUID, FK vers users)
- `token` (VARCHAR, UNIQUE)
- `expiresAt` (TIMESTAMP)
- `isRevoked` (BOOLEAN)

### Migrations
```bash
# Générer une nouvelle migration
npm run db:generate

# Appliquer les migrations
npm run db:push

# Interface graphique pour la DB
npm run db:studio
```

## 📧 Templates d'Emails

Le système utilise des templates HTML professionnels avec :
- Design responsive
- Couleurs de marque (#1C74BC)
- Icônes Font Awesome
- Logo Med Connect intégré

### Templates Disponibles
- `welcome.html` - Email de bienvenue patients
- `2fa-code.html` - Code de vérification 2FA
- `doctor-application.html` - Confirmation candidature médecin
- `doctor-approved.html` - Approbation médecin
- `doctor-rejected.html` - Rejet candidature médecin
- `admin-notification.html` - Notification admin nouvelle candidature

## 🔧 Scripts Disponibles

```bash
# Développement
npm run dev              # Démarrage avec nodemon
npm start               # Démarrage production

# Base de données
npm run db:generate     # Générer migrations
npm run db:push         # Appliquer migrations
npm run db:studio       # Interface graphique DB

# Tests
npm test               # Tous les tests
npm run test:watch     # Tests en mode watch
npm run test:coverage  # Tests avec couverture
```

## 🚀 Déploiement

### Variables d'Environnement Production
```env
NODE_ENV=production
JWT_SECRET=<strong-secret-key>
DB_HOST=<production-db-host>
# ... autres variables
```

### Checklist de Déploiement
- [ ] Changer les mots de passe par défaut
- [ ] Configurer les variables d'environnement
- [ ] Activer HTTPS
- [ ] Configurer les CORS pour le domaine frontend
- [ ] Mettre en place la surveillance et les logs
- [ ] Configurer les sauvegardes de base de données

## 🤝 Contribution

1. Fork le projet
2. Créez une branche feature (`git checkout -b feature/AmazingFeature`)
3. Committez vos changements (`git commit -m 'Add some AmazingFeature'`)
4. Push vers la branche (`git push origin feature/AmazingFeature`)
5. Ouvrez une Pull Request

### Standards de Code
- Utilisez ESLint et Prettier
- Écrivez des tests pour les nouvelles fonctionnalités
- Documentez les nouvelles API
- Suivez les conventions de nommage existantes

## 📝 Changelog

### Version 1.0.0 (2024-01-01)
- ✅ Système d'authentification complet avec 2FA
- ✅ Gestion des rôles (Patients, Médecins, Admins)
- ✅ Upload de photos de profil
- ✅ Templates d'emails professionnels
- ✅ API REST complète
- ✅ Tests de sécurité et d'intégration
- ✅ Documentation complète

## 📞 Support

Pour toute question ou problème :
- 📧 Email : support@medconnect.com
- 📋 Issues : [GitHub Issues](repository-url/issues)
- 📖 Documentation : Ce README

## 📄 Licence

Ce projet est sous licence MIT. Voir le fichier `LICENSE` pour plus de détails.

---

**Med Connect** - Votre plateforme de santé connectée 🏥

Développé avec ❤️ par l'équipe Med Connect