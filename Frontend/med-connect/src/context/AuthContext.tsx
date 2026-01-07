import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import authService, { User } from '../services/authService';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<any>;
  register: (userData: any) => Promise<any>;
  verify2FA: (userId: string, code: string) => Promise<any>;
  logout: () => Promise<void>;
  updateProfile: (userData: Partial<User>) => Promise<any>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Vérifier l'authentification au démarrage
  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      setIsLoading(true);
      
      // D'abord vérifier AsyncStorage pour les données locales
      const AsyncStorage = require('@react-native-async-storage/async-storage').default;
      const isAuth = await AsyncStorage.getItem('isAuthenticated');
      const userData = await AsyncStorage.getItem('currentUser');
      
      if (isAuth === 'true' && userData) {
        // Utilisateur local trouvé
        const user = JSON.parse(userData);
        setUser(user);
        setIsAuthenticated(true);
        return;
      }
      
      // Sinon vérifier avec l'API
      const authenticated = await authService.isAuthenticated();
      
      if (authenticated) {
        const profileResponse = await authService.getProfile();
        setUser(profileResponse.data.user);
        setIsAuthenticated(true);
      }
    } catch (error) {
      console.log('Utilisateur non connecté');
      setIsAuthenticated(false);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    try {
      const response = await authService.login({ email, password });
      
      // Si 2FA requis, retourner la réponse sans mettre à jour l'état
      if (response.data.requiresVerification) {
        return response;
      }
      
      // Connexion directe réussie
      setUser(response.data.user);
      setIsAuthenticated(true);
      return response;
    } catch (error) {
      throw error;
    }
  };

  const register = async (userData: any) => {
    try {
      const response = await authService.registerPatient(userData);
      setUser(response.data.user);
      setIsAuthenticated(true);
      return response;
    } catch (error) {
      throw error;
    }
  };

  const verify2FA = async (userId: string, code: string) => {
    try {
      const response = await authService.verify2FA({ userId, code });
      setUser(response.data.user);
      setIsAuthenticated(true);
      return response;
    } catch (error) {
      throw error;
    }
  };

  const logout = async () => {
    try {
      await authService.logout();
    } catch (error) {
      console.warn('Erreur lors de la déconnexion:', error);
    } finally {
      setUser(null);
      setIsAuthenticated(false);
    }
  };

  const updateProfile = async (userData: Partial<User>) => {
    try {
      const response = await authService.updateProfile(userData);
      setUser(response.data.user);
      return response;
    } catch (error) {
      throw error;
    }
  };

  const value: AuthContextType = {
    user,
    isLoading,
    isAuthenticated,
    login,
    register,
    verify2FA,
    logout,
    updateProfile
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};