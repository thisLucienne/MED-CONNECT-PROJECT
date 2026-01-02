# Architecture de Med-Connect

## Vue d'ensemble

Med-Connect est une application mobile React Native construite avec Expo, utilisant une architecture basée sur des composants avec une navigation par état centralisée.

## Structure du projet

```
med-connect/
├── src/
│   └── components/           # Tous les écrans de l'application
├── assets/                   # Images, icônes, fonts
├── App.tsx                   # Point d'entrée principal
├── index.ts                  # Configuration Expo
├── package.json             # Dépendances et scripts
└── tsconfig.json            # Configuration TypeScript
```

## Gestion de la navigation

### Système de navigation par état

L'application utilise un système de navigation simple basé sur un état React (`currentScreen`) dans le composant principal `App.tsx`.

```typescript
type Screen = 
  | 'splash'
  | 'login' 
  | 'register'
  | 'dashboard'
  | 'messaging'
  | 'chat'
  | 'profile'
  | 'medicalRecords'
  | 'uploadDocument'
  | 'findDoctor'
  | 'doctorProfile';
```

### Flux de navigation

```
SplashScreen
    ↓
LoginScreen ↔ RegisterScreen
    ↓
DashboardScreen
    ├── MessagingList → ChatConversation
    ├── ProfileScreen
    ├── MedicalRecordsScreen → UploadDocumentScreen
    └── FindDoctorScreen → DoctorProfileScreen
```

## Composants principaux

### Écrans d'authentification
- **SplashScreen** : Écran de démarrage avec branding
- **LoginScreen** : Authentification utilisateur
- **RegisterScreen** : Création de compte

### Écrans principaux
- **DashboardScreen** : Hub central avec accès à toutes les fonctionnalités
- **ProfileScreen** : Gestion du profil utilisateur

### Fonctionnalités de messagerie
- **MessagingList** : Liste des conversations
- **ChatConversation** : Interface de chat

### Gestion médicale
- **MedicalRecordsScreen** : Consultation des dossiers
- **UploadDocumentScreen** : Upload de documents médicaux

### Recherche de médecins
- **FindDoctorScreen** : Recherche et filtrage
- **DoctorProfileScreen** : Profil détaillé du médecin

## Patterns utilisés

### Props drilling pour la navigation
Chaque composant reçoit des callbacks pour naviguer vers d'autres écrans :

```typescript
interface ScreenProps {
  onNavigateTo?: () => void;
  onBack?: () => void;
  // autres props spécifiques
}
```

### Gestion d'état locale
- État centralisé dans `App.tsx` pour la navigation
- État local dans chaque composant pour les données spécifiques

### TypeScript
- Typage strict pour tous les composants
- Interfaces définies pour les props
- Types pour la navigation

## Considérations techniques

### Performance
- Rendu conditionnel des écrans
- Composants légers sans sur-optimisation prématurée

### Maintenabilité
- Séparation claire des responsabilités
- Composants réutilisables
- Structure de fichiers logique

### Évolutivité
- Architecture simple permettant l'ajout facile de nouveaux écrans
- Système de navigation extensible
- Composants modulaires

## Améliorations futures possibles

1. **Navigation avancée** : Intégration de React Navigation
2. **Gestion d'état globale** : Redux ou Context API
3. **Persistance** : AsyncStorage pour les données utilisateur
4. **API Integration** : Services pour les appels backend
5. **Tests** : Jest et React Native Testing Library