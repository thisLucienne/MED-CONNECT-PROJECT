# Med-Connect 📱

Une application mobile de santé connectée développée avec React Native et Expo, permettant aux patients de gérer leurs dossiers médicaux et de communiquer avec les professionnels de santé.

## 🚀 Fonctionnalités

### Authentification
- Connexion utilisateur
- Création de compte
- Écran de démarrage

### Tableau de bord
- Vue d'ensemble des informations de santé
- Accès rapide aux fonctionnalités principales
- Navigation intuitive

### Messagerie
- Liste des conversations
- Chat en temps réel avec les médecins
- Interface de messagerie moderne

### Dossiers médicaux
- Consultation des dossiers médicaux
- Upload de documents
- Gestion des documents de santé

### Recherche de médecins
- Recherche et filtrage des médecins
- Profils détaillés des praticiens
- Prise de contact directe

### Profil utilisateur
- Gestion des informations personnelles
- Paramètres de l'application
- Déconnexion sécurisée

## 🛠️ Technologies utilisées

- **React Native** 0.81.5
- **Expo** ~54.0.25
- **TypeScript** ~5.9.2
- **React** 19.1.0
- **Expo Linear Gradient** pour les interfaces modernes

## 📋 Prérequis

- Node.js (version 16 ou supérieure)
- npm ou yarn
- Expo CLI
- Un émulateur Android/iOS ou un appareil physique

## 🔧 Installation

1. Cloner le repository
```bash
git clone [url-du-repo]
cd Frontend/med-connect
```

2. Installer les dépendances
```bash
npm install
```

3. Démarrer l'application
```bash
npm start
```

## 📱 Scripts disponibles

- `npm start` - Démarre le serveur de développement Expo
- `npm run android` - Lance l'application sur Android
- `npm run ios` - Lance l'application sur iOS  
- `npm run web` - Lance l'application sur le web

## 🏗️ Architecture

L'application suit une architecture simple et modulaire :

```
src/
└── components/
    ├── SplashScreen.tsx          # Écran de démarrage
    ├── LoginScreen.tsx           # Connexion
    ├── RegisterScreen.tsx        # Inscription
    ├── DashboardScreen.tsx       # Tableau de bord
    ├── MessagingList.tsx         # Liste des messages
    ├── ChatConversation.tsx      # Conversation chat
    ├── ProfileScreen.tsx         # Profil utilisateur
    ├── MedicalRecordsScreen.tsx  # Dossiers médicaux
    ├── UploadDocumentScreen.tsx  # Upload de documents
    ├── FindDoctorScreen.tsx      # Recherche de médecins
    └── DoctorProfileScreen.tsx   # Profil du médecin
```

## 🎯 Navigation

L'application utilise un système de navigation par état avec les écrans suivants :

- `splash` → `login` → `dashboard`
- `login` ↔ `register`
- `dashboard` → `messaging` → `chat`
- `dashboard` → `profile`
- `dashboard` → `medicalRecords` → `uploadDocument`
- `dashboard` → `findDoctor` → `doctorProfile`

## 🎨 Design

L'interface utilise :
- Gradients linéaires pour un design moderne
- Palette de couleurs cohérente
- Interface responsive adaptée aux mobiles
- Composants réutilisables

## 🔐 Sécurité

- Authentification utilisateur
- Gestion sécurisée des sessions
- Protection des données médicales sensibles

## 📄 Licence

[Ajouter la licence appropriée]

## 👥 Contribution

[Ajouter les guidelines de contribution]

## 📞 Support

Pour toute question ou problème, contactez l'équipe de développement.