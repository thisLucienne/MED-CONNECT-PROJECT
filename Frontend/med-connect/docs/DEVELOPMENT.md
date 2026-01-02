# Guide de développement - Med-Connect

## Configuration de l'environnement

### Prérequis
- Node.js 16+
- npm ou yarn
- Expo CLI : `npm install -g @expo/cli`
- Android Studio (pour Android)
- Xcode (pour iOS, macOS uniquement)

### Installation
```bash
cd Frontend/med-connect
npm install
```

### Démarrage
```bash
npm start          # Serveur de développement
npm run android    # Émulateur Android
npm run ios        # Simulateur iOS
npm run web        # Version web
```

## Structure du code

### Conventions de nommage
- **Composants** : PascalCase (`LoginScreen.tsx`)
- **Fichiers** : PascalCase pour les composants
- **Variables** : camelCase
- **Types** : PascalCase avec suffixe approprié

### Organisation des fichiers
```
src/
└── components/
    ├── AuthScreens/          # Écrans d'authentification
    ├── MainScreens/          # Écrans principaux
    ├── MedicalScreens/       # Écrans médicaux
    └── Common/               # Composants réutilisables
```

## Standards de code

### TypeScript
- Typage strict activé
- Interfaces pour toutes les props
- Types explicites pour les fonctions

```typescript
interface ScreenProps {
  onNavigate: (screen: Screen) => void;
  onBack?: () => void;
}

const MyScreen: React.FC<ScreenProps> = ({ onNavigate, onBack }) => {
  // Implementation
};
```

### Composants React
- Composants fonctionnels avec hooks
- Props destructurées
- Gestion d'état locale avec useState

```typescript
const [loading, setLoading] = useState<boolean>(false);
const [data, setData] = useState<DataType | null>(null);
```

### Styles
- StyleSheet de React Native
- Styles définis en bas du fichier
- Nommage descriptif des styles

```typescript
const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
  },
});
```

## Gestion de la navigation

### Ajout d'un nouvel écran

1. **Créer le composant**
```typescript
// src/components/NewScreen.tsx
interface NewScreenProps {
  onBack: () => void;
  // autres props
}

const NewScreen: React.FC<NewScreenProps> = ({ onBack }) => {
  return (
    // JSX du composant
  );
};

export default NewScreen;
```

2. **Ajouter le type d'écran**
```typescript
// App.tsx
type Screen = 
  | 'existing'
  | 'newScreen';  // Ajouter ici
```

3. **Importer et ajouter au switch**
```typescript
import NewScreen from './src/components/NewScreen';

// Dans renderScreen()
case 'newScreen':
  return <NewScreen onBack={() => navigateTo('dashboard')} />;
```

## Gestion des données

### État local
```typescript
const [user, setUser] = useState<User | null>(null);
const [loading, setLoading] = useState(false);
const [error, setError] = useState<string | null>(null);
```

### Appels API (à implémenter)
```typescript
const fetchData = async () => {
  try {
    setLoading(true);
    const response = await fetch('/api/endpoint');
    const data = await response.json();
    setData(data);
  } catch (err) {
    setError('Erreur lors du chargement');
  } finally {
    setLoading(false);
  }
};
```

## Tests (à implémenter)

### Configuration Jest
```json
{
  "scripts": {
    "test": "jest",
    "test:watch": "jest --watch"
  }
}
```

### Tests de composants
```typescript
import { render, fireEvent } from '@testing-library/react-native';
import LoginScreen from '../LoginScreen';

test('should render login form', () => {
  const { getByText } = render(
    <LoginScreen onLogin={jest.fn()} onCreateAccount={jest.fn()} />
  );
  
  expect(getByText('Connexion')).toBeTruthy();
});
```

## Débogage

### Expo DevTools
- Shake l'appareil pour ouvrir le menu développeur
- Utiliser Flipper pour le débogage avancé
- Console.log pour les logs simples

### Erreurs communes
- **Metro bundler** : Redémarrer avec `npm start --reset-cache`
- **Dépendances** : Supprimer node_modules et réinstaller
- **Cache** : Vider le cache Expo

## Déploiement

### Build de développement
```bash
expo build:android
expo build:ios
```

### Publication
```bash
expo publish
```

### App Stores
- Suivre la documentation Expo pour la publication
- Configurer les certificats iOS
- Préparer les assets (icônes, screenshots)

## Bonnes pratiques

### Performance
- Éviter les re-renders inutiles
- Optimiser les images
- Lazy loading pour les listes longues

### Sécurité
- Ne jamais stocker de tokens en plain text
- Valider toutes les entrées utilisateur
- Chiffrer les données sensibles

### Accessibilité
- Ajouter des labels accessibles
- Tester avec les lecteurs d'écran
- Respecter les contrastes de couleurs

## Contribution

### Workflow Git
1. Créer une branche feature
2. Développer et tester
3. Créer une pull request
4. Code review
5. Merge après validation

### Commit messages
```
feat: ajouter écran de recherche de médecins
fix: corriger bug de navigation
docs: mettre à jour la documentation
style: améliorer l'interface du chat
```