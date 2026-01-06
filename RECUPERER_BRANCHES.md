# 🔄 Guide pour Récupérer les Nouvelles Branches Git

## ⚠️ Problème Actuel
Vous avez une erreur de connexion réseau : `Could not resolve host: github.com`

Cela signifie que votre ordinateur ne peut pas accéder à GitHub. Vérifiez :
1. ✅ Votre connexion Internet
2. ✅ Votre pare-feu / antivirus
3. ✅ Si vous utilisez un VPN, proxy ou réseau d'entreprise

## 📋 Commandes Git pour Récupérer les Branches

Une fois la connexion rétablie, utilisez ces commandes :

### 1. Récupérer toutes les branches distantes
```powershell
git fetch origin
```
ou pour tous les remotes :
```powershell
git fetch --all
```

### 2. Voir toutes les branches distantes disponibles
```powershell
git branch -r
```

### 3. Voir toutes les branches (locales + distantes)
```powershell
git branch -a
```

### 4. Créer une branche locale depuis une branche distante
```powershell
# Pour la branche feature/frontendmobile
git checkout -b feature/frontendmobile origin/feature/frontendmobile

# Ou plus simplement (Git détecte automatiquement)
git checkout feature/frontendmobile
```

### 5. Mettre à jour une branche existante
```powershell
# Basculer sur la branche
git checkout feature/frontendmobile

# Récupérer les dernières modifications
git pull origin feature/frontendmobile
```

### 6. Voir les différences entre local et distant
```powershell
git fetch origin
git log HEAD..origin/feature/frontendmobile
```

## 🔍 Vérifier l'état actuel

### Voir les branches locales
```powershell
git branch
```

### Voir la branche actuelle
```powershell
git branch --show-current
```

### Voir le statut
```powershell
git status
```

## 🛠️ Solutions pour le Problème de Connexion

### Solution 1 : Vérifier la connexion Internet
```powershell
# Tester la connexion à Internet
ping google.com -n 2
ping github.com -n 2
```

### Solution 2 : Vérifier la configuration Git
```powershell
# Voir la configuration des remotes
git remote -v

# Voir la configuration proxy
git config --get http.proxy
git config --get https.proxy
```

### Solution 3 : Désactiver le proxy (si configuré)
```powershell
git config --global --unset http.proxy
git config --global --unset https.proxy
```

### Solution 4 : Utiliser SSH au lieu de HTTPS
```powershell
# Changer l'URL remote vers SSH
git remote set-url origin git@github.com:thisLucienne/MED-CONNECT-PROJECT.git

# Puis réessayer
git fetch origin
```

### Solution 5 : Utiliser un VPN ou changer de réseau
Si vous êtes sur un réseau restreint (entreprise, école), essayez :
- Utiliser un VPN
- Changer de réseau (WiFi mobile, autre connexion)
- Contacter l'administrateur réseau

## 📝 Commandes Complètes (une fois connecté)

```powershell
# 1. Récupérer toutes les branches
git fetch --all

# 2. Lister les branches distantes
git branch -r

# 3. Voir les branches disponibles
git branch -a

# 4. Créer/switch vers la branche feature/frontendmobile
git checkout -b feature/frontendmobile origin/feature/frontendmobile

# 5. Mettre à jour la branche
git pull origin feature/frontendmobile
```

## 💡 Astuce

Si vous ne pouvez pas vous connecter maintenant, vous pouvez toujours :
1. Travailler sur les branches locales existantes
2. Créer de nouvelles branches locales
3. Faire vos commits
4. Pousser vers GitHub une fois la connexion rétablie avec `git push`

