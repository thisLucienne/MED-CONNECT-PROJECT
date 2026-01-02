# Configuration Backend pour Applications Mobiles Expo

Ce guide explique comment configurer le backend Med Connect pour fonctionner avec une application mobile Expo/React Native.

## 🎯 Vue d'ensemble

Les applications mobiles Expo/React Native n'envoient **pas d'en-tête `Origin`** comme les navigateurs web. Le backend est configuré pour accepter ces requêtes.

## ⚙️ Configuration Backend

### 1. Variables d'environnement

Dans votre fichier `.env` :

```env
# Autoriser les applications mobiles
ALLOW_MOBILE_APPS=true

# URL de l'API (accessible depuis Internet)
API_URL=https://api.votre-domaine.com

# En développement, vous pouvez utiliser votre IP locale
# API_URL=http://192.168.1.100:5000
```

### 2. Configuration Docker

La variable `ALLOW_MOBILE_APPS` est déjà configurée dans `docker-compose.yml` :

```yaml
ALLOW_MOBILE_APPS: ${ALLOW_MOBILE_APPS:-true}
```

Par défaut, les apps mobiles sont autorisées.

## 📱 Configuration dans Expo

### 1. Créer un fichier de configuration API

Créez `config/api.js` dans votre projet Expo :

```javascript
// config/api.js
import Constants from 'expo-constants';

// Détecter l'environnement
const getApiUrl = () => {
  if (__DEV__) {
    // En développement
    // Option 1: Utiliser le tunnel Expo
    // return 'https://votre-tunnel.exp.direct:5000';
    
    // Option 2: Utiliser l'IP locale (plus rapide)
    return 'http://192.168.1.100:5000'; // Remplacez par votre IP locale
    
    // Option 3: Utiliser localhost si l'app tourne sur le même appareil
    // return 'http://localhost:5000';
  } else {
    // En production
    return 'https://api.votre-domaine.com';
  }
};

export const API_URL = getApiUrl();

// Fonction helper pour les requêtes API
export const apiRequest = async (endpoint, options = {}) => {
  const token = await AsyncStorage.getItem('authToken'); // ou votre méthode de stockage
  
  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': token ? `Bearer ${token}` : '',
      ...options.headers,
    },
  });

  if (!response.ok) {
    throw new Error(`API Error: ${response.status}`);
  }

  return response.json();
};
```

### 2. Exemple d'utilisation

```javascript
// services/authService.js
import { apiRequest } from '../config/api';

export const login = async (email, password) => {
  return apiRequest('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
};

export const getProfile = async () => {
  return apiRequest('/api/auth/profile', {
    method: 'GET',
  });
};
```

### 3. Gestion des erreurs réseau

```javascript
// utils/apiErrorHandler.js
export const handleApiError = (error) => {
  if (error.message.includes('Network request failed')) {
    return 'Erreur de connexion. Vérifiez votre connexion Internet.';
  }
  
  if (error.message.includes('401')) {
    return 'Session expirée. Veuillez vous reconnecter.';
  }
  
  return error.message || 'Une erreur est survenue';
};
```

## 🔧 Développement Local

### Option 1 : Utiliser l'IP locale (Recommandé)

1. **Trouver votre IP locale** :
   ```bash
   # Linux/Mac
   ifconfig | grep "inet " | grep -v 127.0.0.1
   
   # Windows
   ipconfig
   ```

2. **Configurer dans Expo** :
   ```javascript
   const API_URL = 'http://192.168.1.100:5000'; // Votre IP
   ```

3. **S'assurer que le backend est accessible** :
   - Le backend doit être démarré : `docker compose up -d`
   - Vérifier que le port 5000 est ouvert sur votre machine
   - Votre téléphone et votre ordinateur doivent être sur le même réseau WiFi

### Option 2 : Utiliser Expo Tunnel

1. **Démarrer Expo avec tunnel** :
   ```bash
   expo start --tunnel
   ```

2. **Créer un tunnel pour le backend** (optionnel) :
   ```bash
   # Utiliser ngrok ou un service similaire
   ngrok http 5000
   ```

3. **Configurer l'URL du tunnel** dans votre app Expo

### Option 3 : Utiliser localhost (Android Emulator uniquement)

Sur Android Emulator, `localhost` ou `10.0.2.2` pointe vers l'hôte :

```javascript
const API_URL = __DEV__ 
  ? 'http://10.0.2.2:5000' // Android Emulator
  : 'https://api.votre-domaine.com';
```

## 🚀 Production

### 1. Configuration Backend

```env
# .env en production
NODE_ENV=production
ALLOW_MOBILE_APPS=true
API_URL=https://api.votre-domaine.com
```

### 2. Configuration Expo

```javascript
// config/api.js
export const API_URL = 'https://api.votre-domaine.com';
```

### 3. Vérifier l'accessibilité

Testez que votre API est accessible depuis Internet :

```bash
curl https://api.votre-domaine.com/health
```

## 🔐 Authentification

### Stockage des tokens

```javascript
// utils/storage.js
import * as SecureStore from 'expo-secure-store';

export const storeToken = async (token) => {
  await SecureStore.setItemAsync('authToken', token);
};

export const getToken = async () => {
  return await SecureStore.getItemAsync('authToken');
};

export const removeToken = async () => {
  await SecureStore.deleteItemAsync('authToken');
};
```

### Intercepteur de requêtes avec refresh token

```javascript
// services/apiClient.js
import { getToken, storeToken } from '../utils/storage';

let refreshTokenPromise = null;

const refreshToken = async () => {
  if (refreshTokenPromise) {
    return refreshTokenPromise;
  }

  refreshTokenPromise = (async () => {
    const refreshToken = await SecureStore.getItemAsync('refreshToken');
    const response = await fetch(`${API_URL}/api/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken }),
    });

    const data = await response.json();
    await storeToken(data.token);
    refreshTokenPromise = null;
    return data.token;
  })();

  return refreshTokenPromise;
};

export const apiClient = async (endpoint, options = {}) => {
  let token = await getToken();

  let response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': token ? `Bearer ${token}` : '',
      ...options.headers,
    },
  });

  // Si token expiré, rafraîchir et réessayer
  if (response.status === 401) {
    token = await refreshToken();
    response = await fetch(`${API_URL}${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
        ...options.headers,
      },
    });
  }

  return response.json();
};
```

## 🧪 Tests

### Tester la connexion

```javascript
// Test de connexion
const testConnection = async () => {
  try {
    const response = await fetch(`${API_URL}/health`);
    const data = await response.json();
    console.log('✅ Backend accessible:', data);
  } catch (error) {
    console.error('❌ Erreur de connexion:', error);
  }
};
```

### Tester l'authentification

```javascript
// Test de login
const testLogin = async () => {
  try {
    const response = await fetch(`${API_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'test@example.com',
        password: 'password123',
      }),
    });
    const data = await response.json();
    console.log('✅ Login réussi:', data);
  } catch (error) {
    console.error('❌ Erreur de login:', error);
  }
};
```

## 🐛 Dépannage

### Erreur "Network request failed"

1. **Vérifier que le backend est démarré** :
   ```bash
   docker compose ps
   ```

2. **Vérifier l'URL de l'API** dans votre app Expo

3. **Vérifier la connexion réseau** :
   - Même WiFi pour développement local
   - Connexion Internet pour production

4. **Vérifier les logs du backend** :
   ```bash
   docker compose logs -f backend
   ```

### Erreur CORS

Les apps mobiles ne devraient pas avoir d'erreur CORS car elles n'envoient pas d'en-tête Origin. Si vous voyez une erreur CORS :

1. Vérifiez que `ALLOW_MOBILE_APPS=true` est défini
2. Vérifiez les logs du backend pour voir les requêtes rejetées

### Token expiré

Implémentez la logique de refresh token (voir section Authentification ci-dessus).

## 📚 Ressources

- [Expo Documentation](https://docs.expo.dev/)
- [React Native Networking](https://reactnative.dev/docs/network)
- [Expo SecureStore](https://docs.expo.dev/versions/latest/sdk/securestore/)

