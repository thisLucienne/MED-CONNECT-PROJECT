# Page Patients - Documentation

## ✅ Fonctionnalités implémentées

### 1. Vue d'ensemble
La page patients permet au médecin de gérer l'ensemble de ses patients avec une interface moderne et responsive.

### 2. Statistiques en temps réel
Quatre cartes de statistiques affichent :
- **Total Patients** : Nombre total de patients (8)
- **Patients Actifs** : Patients avec un suivi actif (6)
- **Demandes en attente** : Nouvelles demandes de connexion (3)
- **Cas Urgents** : Patients nécessitant une attention immédiate (2)

### 3. Recherche et filtres

#### Barre de recherche
- Recherche par nom du patient
- Recherche par ID patient (ex: MD-1892)
- Recherche par pathologie/condition

#### Filtres rapides
- **Tous** : Affiche tous les patients
- **Actifs** : Patients avec un suivi actif
- **Urgents** : Cas nécessitant une attention immédiate
- **En attente** : Patients en attente de validation

### 4. Modes d'affichage

#### Vue Grille (par défaut)
- Cartes patients avec photo, informations et actions
- Design moderne avec hover effects
- Affichage des conditions médicales en tags colorés
- Statut visuel (Actif/Urgent/En attente)
- Boutons d'action : Message et Dossier

#### Vue Liste
- Tableau détaillé avec colonnes :
  - Checkbox de sélection
  - Patient (photo + nom)
  - Âge
  - ID Patient
  - Dernière consultation
  - Conditions médicales
  - Statut
  - Actions (Message + Dossier)
- Sélection multiple possible
- Tri et filtrage avancés

### 5. Actions sur les patients

#### Bouton Message
- Ouvre une conversation avec le patient
- Affiche actuellement une alerte (à connecter avec la messagerie)
- Navigation future vers `/messages?patientId=XXX`

#### Bouton Dossier (icône)
- Ouvre le dossier médical complet du patient
- Affiche les informations détaillées
- Navigation future vers `/dossiers/:patientId`

### 6. Ajouter un patient

#### Modal "Demandes de Connexion"
Le bouton "Ajouter un Patient" ouvre un modal affichant :
- Liste des patients ayant demandé une connexion
- Informations : Photo, Nom, Âge, Raison, Date de demande
- Actions :
  - **Accepter** : Ajoute le patient à la liste avec un nouvel ID
  - **Refuser** : Supprime la demande après confirmation

#### Patients en attente (3 actuellement)
1. Emma Rousseau, 38 ans - Suivi diabète
2. Thomas Bernard, 52 ans - Consultation cardiologie
3. Julie Moreau, 26 ans - Suivi grossesse

### 7. Données patients (8 patients)

1. **Bernard Julien** (MD-1892)
   - 45 ans, Urgent
   - Diabète Type 2, HTA
   - Dernière consultation: 24 Mars 2024

2. **Marie Dubois** (MD-2847)
   - 34 ans, Actif
   - Hypothyroïdie
   - Dernière consultation: 22 Mars 2024

3. **Anne Legrand** (MD-4128)
   - 29 ans, Actif
   - Asthme
   - Dernière consultation: 01 Mars 2024

4. **Jean Martin** (MD-1523)
   - 56 ans, Actif
   - Post-Chirurgie
   - Dernière consultation: 02 Avril 2024

5. **Sophie Laurent** (MD-3456)
   - 42 ans, Actif
   - Migraine chronique
   - Dernière consultation: 20 Mars 2024

6. **Pierre Durand** (MD-7890)
   - 67 ans, Urgent
   - Insuffisance cardiaque, Diabète
   - Dernière consultation: 25 Mars 2024

7. **Claire Petit** (MD-5678)
   - 31 ans, Actif
   - Grossesse
   - Dernière consultation: 18 Mars 2024

8. **Lucas Blanc** (MD-9012)
   - 28 ans, Actif
   - Allergie
   - Dernière consultation: 15 Mars 2024

## 🎨 Design et UX

### Palette de couleurs
- **Bleu principal** : #3b82f6 (boutons, liens)
- **Vert** : #10b981 (statut actif, accepter)
- **Rouge** : #ef4444 (urgent, refuser)
- **Orange** : #f59e0b (en attente)
- **Gris** : Nuances pour textes et backgrounds

### Animations et transitions
- Hover effects sur les cartes (translateY + shadow)
- Transitions fluides (0.2s)
- Boutons avec feedback visuel
- Modal avec overlay semi-transparent

### Responsive Design

#### Desktop (> 1024px)
- Grille 4 colonnes pour les stats
- Grille auto-fill pour les patients
- Tableau complet avec toutes les colonnes
- Navbar visible à gauche

#### Tablet (768px - 1024px)
- Grille 2 colonnes pour les stats
- Navbar masquée (menu hamburger)
- Tableau avec colonnes réduites

#### Mobile (< 768px)
- Grille 1 colonne pour les stats
- Cartes patients en pleine largeur
- Tableau simplifié (4 colonnes essentielles)
- Boutons en pleine largeur
- Filtres empilés verticalement

## 🔗 Liaisons et Navigation

### Routes configurées
- `/patients` : Page principale des patients
- `/messages` : Messagerie (à implémenter)
- `/dossiers/:id` : Dossier patient (à implémenter)

### Intégrations futures
1. **API Backend**
   - GET /api/patients : Liste des patients
   - GET /api/patients/:id : Détails d'un patient
   - GET /api/patient-requests : Demandes en attente
   - POST /api/patient-requests/:id/accept : Accepter une demande
   - DELETE /api/patient-requests/:id : Refuser une demande

2. **Messagerie**
   - Navigation avec paramètre patientId
   - Ouverture directe d'une conversation

3. **Dossiers médicaux**
   - Navigation vers le dossier complet
   - Historique des consultations
   - Documents médicaux
   - Prescriptions

## 🚀 Utilisation

1. Accéder à la page : http://localhost:4200/patients
2. Utiliser la recherche pour trouver un patient
3. Filtrer par statut (Tous/Actifs/Urgents/En attente)
4. Basculer entre vue Grille et Liste
5. Cliquer sur "Message" pour contacter un patient
6. Cliquer sur l'icône dossier pour voir les détails
7. Cliquer sur "Ajouter un Patient" pour gérer les demandes
8. Accepter ou refuser les demandes de connexion

## 📱 Tests Responsive

Pour tester le responsive :
1. Ouvrir les DevTools (F12)
2. Activer le mode responsive (Ctrl+Shift+M)
3. Tester différentes résolutions :
   - Mobile : 375px, 414px
   - Tablet : 768px, 1024px
   - Desktop : 1280px, 1920px

## ✨ Points forts

- Interface moderne et professionnelle
- Recherche et filtres performants
- Deux modes d'affichage (grille/liste)
- Gestion des demandes de connexion
- Design responsive complet
- Animations fluides
- Code modulaire et maintenable
- Prêt pour l'intégration backend
