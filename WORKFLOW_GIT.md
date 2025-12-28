# Workflow Git - MED-CONNECT-PROJECT

## Structure des branches

### Branche principale : `develop`
- **Rôle** : Branche de développement principale contenant tout le code intégré
- **Contenu** : Backend + Frontend Web + Frontend Mobile
- **Utilisation** : Base pour tous les nouveaux développements

### Branches de fonctionnalités
- `feature/nom-fonctionnalite` : Pour développer de nouvelles fonctionnalités
- `fix/nom-bug` : Pour corriger des bugs
- `hotfix/nom-correction` : Pour des corrections urgentes

### Branche de production : `main`
- **Rôle** : Code stable prêt pour la production
- **Mise à jour** : Uniquement via merge depuis `develop` après tests

## Workflow recommandé

### 1. Démarrer un nouveau développement
```bash
# Se positionner sur develop
git checkout develop
git pull origin develop

# Créer une nouvelle branche de fonctionnalité
git checkout -b feature/ma-nouvelle-fonctionnalite
```

### 2. Développer et commiter
```bash
# Faire vos modifications
git add .
git commit -m "feat: description de la fonctionnalité"

# Pousser régulièrement
git push -u origin feature/ma-nouvelle-fonctionnalite
```

### 3. Intégrer les changements
```bash
# Revenir sur develop
git checkout develop
git pull origin develop

# Merger votre branche
git merge feature/ma-nouvelle-fonctionnalite --no-ff
git push origin develop

# Supprimer la branche de fonctionnalité (optionnel)
git branch -d feature/ma-nouvelle-fonctionnalite
git push origin --delete feature/ma-nouvelle-fonctionnalité
```

### 4. Déployer en production
```bash
# Merger develop vers main quand prêt
git checkout main
git pull origin main
git merge develop --no-ff
git push origin main
```

## Règles importantes

### ✅ À faire
- Toujours partir de `develop` pour créer une nouvelle branche
- Utiliser des noms de branches descriptifs
- Commiter régulièrement avec des messages clairs
- Tester avant de merger
- Utiliser `--no-ff` pour garder l'historique des merges

### ❌ À éviter
- Ne jamais développer directement sur `develop` ou `main`
- Ne pas oublier de pull avant de créer une nouvelle branche
- Ne pas merger sans avoir testé
- Ne pas supprimer les branches avant d'être sûr que tout fonctionne

## Résolution de conflits

Si vous avez des conflits lors d'un merge :

1. **Identifier les fichiers en conflit**
   ```bash
   git status
   ```

2. **Résoudre manuellement** les conflits dans chaque fichier

3. **Marquer comme résolu**
   ```bash
   git add fichier-resolu.js
   ```

4. **Finaliser le merge**
   ```bash
   git commit -m "resolve: merge conflicts"
   ```

## Structure actuelle du projet

```
MED-CONNECT-PROJECT/
├── backend/backend/          # API Node.js + Express
├── Frontend/
│   ├── med-connect/         # App mobile React Native/Expo
│   └── med-connect-web/     # App web Angular
└── docs/                    # Documentation
```

## Commandes utiles

```bash
# Voir toutes les branches
git branch -a

# Voir l'état actuel
git status

# Voir l'historique
git log --oneline --graph

# Changer de branche
git checkout nom-branche

# Créer et changer de branche
git checkout -b nouvelle-branche

# Mettre à jour depuis le remote
git pull origin nom-branche
```

## En cas de problème

Si vous perdez du code ou vous retrouvez sur la mauvaise branche :

1. **Vérifier sur quelle branche vous êtes**
   ```bash
   git branch
   ```

2. **Chercher votre code dans les autres branches**
   ```bash
   git branch -a
   git checkout nom-branche-suspecte
   ```

3. **Utiliser git log pour retrouver vos commits**
   ```bash
   git log --oneline --all --grep="mot-clé"
   ```

Cette stratégie vous évitera de perdre du code et facilitera la collaboration !