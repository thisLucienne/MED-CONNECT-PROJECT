# Guide d'utilisation de la documentation Swagger - Med Connect API

## 📚 Accès à la documentation

Une fois le serveur démarré, accédez à la documentation Swagger interactive via :

### URL de développement
```
http://localhost:5000/api-docs
```

### URL de production
```
http://194.238.25.170:5000/api-docs
```

### JSON Swagger (OpenAPI)
```
http://localhost:5000/api-docs.json
```

## 🔐 Authentification dans Swagger

Pour tester les endpoints protégés dans Swagger :

1. **Connectez-vous d'abord** via `/api/auth/login`
2. **Copiez le `accessToken`** de la réponse
3. **Cliquez sur le bouton "Authorize"** en haut à droite de la page Swagger
4. **Collez le token** dans le champ (sans le préfixe "Bearer ")
5. **Cliquez sur "Authorize"** puis "Close"

Toutes vos requêtes suivantes incluront automatiquement le token d'authentification.

## 📋 Endpoints documentés

### Authentification
- `POST /api/auth/register/patient` - Inscription patient
- `POST /api/auth/register/doctor` - Inscription médecin
- `POST /api/auth/login` - Connexion
- `POST /api/auth/verify-2fa` - Vérification 2FA
- `GET /api/auth/profile` - Obtenir le profil
- `PUT /api/auth/profile` - Mettre à jour le profil

### Administration
- `GET /api/admin/doctors/pending` - Médecins en attente
- `POST /api/admin/doctors/:doctorId/validate` - Valider/rejeter médecin
- `GET /api/admin/users` - Liste des utilisateurs
- `GET /api/admin/users/:userId` - Détails utilisateur
- `GET /api/admin/stats` - Statistiques système

### Messages
- `POST /api/messages` - Envoyer un message
- `GET /api/messages/conversations` - Liste des conversations
- `GET /api/messages/conversations/:autreUtilisateurId` - Conversation spécifique

### Dossiers médicaux
- `POST /api/dossiers` - Créer un dossier
- `GET /api/dossiers` - Liste des dossiers
- `GET /api/dossiers/dossier/:dossierId` - Détails d'un dossier

### Et plus...

## 🧪 Tester les endpoints

### Exemple : Inscription d'un patient

1. Allez sur `POST /api/auth/register/patient`
2. Cliquez sur "Try it out"
3. Remplissez les champs requis :
   ```json
   {
     "firstName": "John",
     "lastName": "Doe",
     "email": "john@example.com",
     "password": "StrongPass123!",
     "phone": "6 12 34 56 78"
   }
   ```
4. Cliquez sur "Execute"
5. Consultez la réponse

### Exemple : Upload de photo de profil

1. Allez sur `PUT /api/auth/profile`
2. Cliquez sur "Try it out"
3. Cliquez sur "Authorize" et entrez votre token
4. Dans le formulaire, utilisez le champ `profilePicture` pour uploader une image
5. Remplissez les autres champs si nécessaire
6. Cliquez sur "Execute"

## 📝 Notes importantes

- **Format des dates** : Utilisez le format ISO 8601 (ex: `2024-11-22T10:30:00Z`)
- **UUID** : Les IDs sont des UUID v4
- **Taille des fichiers** : Maximum 5MB pour les photos de profil
- **Rate limiting** : 100 requêtes par 15 minutes par IP

## 🔄 Mise à jour de la documentation

La documentation Swagger est générée automatiquement à partir des annotations JSDoc dans les fichiers de routes.

Pour ajouter de la documentation à une nouvelle route :

```javascript
/**
 * @swagger
 * /api/ma-route:
 *   get:
 *     summary: Description courte
 *     tags: [Nom du tag]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Succès
 */
```

## 🐛 Dépannage

### La documentation ne s'affiche pas
- Vérifiez que le serveur est démarré
- Vérifiez l'URL : `/api-docs` (pas `/swagger`)

### Erreur 401 sur les endpoints protégés
- Assurez-vous d'avoir cliqué sur "Authorize" et entré votre token
- Vérifiez que le token n'a pas expiré (15 minutes)

### Erreur CORS
- La configuration CORS accepte toutes les origines
- Si vous avez des problèmes, vérifiez les logs du serveur

## 📚 Ressources

- [Documentation OpenAPI 3.0](https://swagger.io/specification/)
- [Swagger UI](https://swagger.io/tools/swagger-ui/)
- [swagger-jsdoc](https://github.com/Surnet/swagger-jsdoc)

