# 🔧 Solution pour l'erreur TurboModule PlatformConstants

## Problème
L'application affiche l'erreur :
```
Invariant Violation: TurboModuleRegistry.getEnforcing(...): 'PlatformConstants' could not be found.
```

## Solutions à essayer (dans l'ordre)

### Solution 1 : Nettoyer le cache et redémarrer

```bash
cd Frontend/med-connect
npx expo start --clear
```

### Solution 2 : Réinstaller les dépendances

```bash
cd Frontend/med-connect
rm -rf node_modules
npm install
npx expo start --clear
```

### Solution 3 : Utiliser Expo Go (recommandé pour le développement)

Si vous utilisez un build natif, essayez plutôt Expo Go :

1. Installez **Expo Go** sur votre téléphone (iOS ou Android)
2. Lancez : `npx expo start`
3. Scannez le QR code avec Expo Go

### Solution 4 : Vérifier la version d'Expo

```bash
npx expo --version
```

Si ce n'est pas la version 54.x, mettez à jour :
```bash
npm install expo@~54.0.25
```

### Solution 5 : Mode Web (pour tester rapidement)

```bash
npx expo start --web
```

Cela lancera l'app dans le navigateur où les TurboModules ne sont pas nécessaires.

## Modifications apportées

J'ai déjà modifié :
1. ✅ `polyfills.js` - Amélioration du mock de PlatformConstants
2. ✅ `App.tsx` - Suppression des hacks inutiles
3. ✅ `app.json` - Ajout de jsEngine: "hermes"

## Si le problème persiste

Essayez de créer un nouveau projet Expo et copier les fichiers :

```bash
npx create-expo-app med-connect-new --template blank-typescript
# Puis copier les fichiers src/ et assets/
```

