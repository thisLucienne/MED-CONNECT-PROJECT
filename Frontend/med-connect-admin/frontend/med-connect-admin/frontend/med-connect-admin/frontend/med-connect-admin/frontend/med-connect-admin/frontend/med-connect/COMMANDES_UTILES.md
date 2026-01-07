# 🔧 Commandes Utiles pour l'Application Mobile

## 🚀 Lancer l'Application

### Option 1 : Mode Développement Standard
```powershell
cd Frontend\med-connect
npx expo start
```

### Option 2 : Avec nettoyage du cache
```powershell
cd Frontend\med-connect
npx expo start --clear
```

### Option 3 : Mode Web (recommandé pour éviter les erreurs TurboModule)
```powershell
cd Frontend\med-connect
npx expo start --web
```

### Option 4 : Android
```powershell
cd Frontend\med-connect
npx expo start --android
```

### Option 5 : iOS
```powershell
cd Frontend\med-connect
npx expo start --ios
```

## 🔄 Réinstaller les Dépendances

Si vous avez des problèmes :
```powershell
cd Frontend\med-connect
Remove-Item -Recurse -Force node_modules
npm install
npx expo start --clear
```

## 🌐 Problème Git (Connexion GitHub)

Si vous avez l'erreur `Could not resolve host: github.com` :

### Solution 1 : Vérifier la connexion Internet
```powershell
ping github.com
```

### Solution 2 : Utiliser HTTPS au lieu de SSH (ou vice versa)
```powershell
git remote -v
# Si nécessaire, changer l'URL :
git remote set-url origin https://github.com/thisLucienne/MED-CONNECT-PROJECT.git
```

### Solution 3 : Configurer un proxy (si vous en utilisez un)
```powershell
git config --global http.proxy http://proxy.example.com:8080
git config --global https.proxy https://proxy.example.com:8080
```

### Solution 4 : Désactiver temporairement le proxy
```powershell
git config --global --unset http.proxy
git config --global --unset https.proxy
```

## ✅ Vérifications

Vérifier la version d'Expo :
```powershell
npx expo --version
```

Vérifier les dépendances installées :
```powershell
cd Frontend\med-connect
npm list --depth=0
```

