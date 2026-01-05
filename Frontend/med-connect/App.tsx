import React, { useState, useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import SplashScreen from './src/components/SplashScreen';
import LoginScreen from './src/components/LoginScreen';
import TwoFAScreen from './src/components/TwoFAScreen';
import RegisterScreen from './src/components/RegisterScreen';
import DashboardScreen from './src/components/DashboardScreen';
import MessagingList from './src/components/MessagingList';
import ChatConversation from './src/components/ChatConversation';
import ProfileScreen from './src/components/ProfileScreen';
import MedicalRecordsScreen from './src/components/MedicalRecordsScreen';
import UploadDocumentScreen from './src/components/UploadDocumentScreen';
import FindDoctorScreen from './src/components/FindDoctorScreen';
import DoctorProfileScreen from './src/components/DoctorProfileScreen';
import { authService } from './src/services/authService';

type Screen = 
  | 'splash'
  | 'login'
  | 'twofa'
  | 'register'
  | 'dashboard'
  | 'messaging'
  | 'chat'
  | 'profile'
  | 'medicalRecords'
  | 'uploadDocument'
  | 'findDoctor'
  | 'doctorProfile';

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<Screen>('splash');
  const [isInitialized, setIsInitialized] = useState(false);
  const [twoFAData, setTwoFAData] = useState<{ userId: string; email: string } | null>(null);

  useEffect(() => {
    initializeApp();
  }, []);

  const initializeApp = async () => {
    try {
      // Vérifier si l'utilisateur est déjà connecté
      const isAuthenticated = authService.getIsAuthenticated();
      const user = authService.getUser();

      if (isAuthenticated && user) {
        // Vérifier la validité du token
        const isTokenValid = await authService.validateToken();
        if (isTokenValid) {
          setCurrentScreen('dashboard');
        } else {
          // Token invalide, déconnecter l'utilisateur
          await authService.logout();
          setCurrentScreen('login');
        }
      } else {
        setCurrentScreen('login');
      }
    } catch (error) {
      console.error('Erreur lors de l\'initialisation:', error);
      setCurrentScreen('login');
    } finally {
      setIsInitialized(true);
    }
  };

  const navigateTo = (screen: Screen) => {
    setCurrentScreen(screen);
  };

  const handleTwoFARequired = (userId: string, email: string) => {
    setTwoFAData({ userId, email });
    setCurrentScreen('twofa');
  };

  const handleTwoFASuccess = () => {
    setTwoFAData(null);
    setCurrentScreen('dashboard');
  };

  const handleLogout = async () => {
    try {
      await authService.logout();
      setCurrentScreen('login');
    } catch (error) {
      console.error('Erreur lors de la déconnexion:', error);
      setCurrentScreen('login');
    }
  };

  const renderScreen = () => {
    if (!isInitialized) {
      return <SplashScreen onStart={() => {}} />;
    }

    switch (currentScreen) {
      case 'splash':
        return <SplashScreen onStart={() => navigateTo('login')} />;

      case 'login':
        return (
          <LoginScreen 
            onLogin={() => navigateTo('dashboard')} 
            onCreateAccount={() => navigateTo('register')}
            onTwoFARequired={handleTwoFARequired}
          />
        );

      case 'twofa':
        return twoFAData ? (
          <TwoFAScreen
            userId={twoFAData.userId}
            email={twoFAData.email}
            onVerificationSuccess={handleTwoFASuccess}
            onGoBack={() => navigateTo('login')}
          />
        ) : (
          <LoginScreen 
            onLogin={() => navigateTo('dashboard')} 
            onCreateAccount={() => navigateTo('register')}
            onTwoFARequired={handleTwoFARequired}
          />
        );

      case 'register':
        return (
          <RegisterScreen 
            onRegister={() => navigateTo('dashboard')}
            onBackToLogin={() => navigateTo('login')}
            onTwoFARequired={handleTwoFARequired}
          />
        );

      case 'dashboard':
        return (
          <DashboardScreen 
            onNavigateToMessages={() => navigateTo('messaging')}
            onNavigateToProfile={() => navigateTo('profile')}
            onNavigateToRecords={() => navigateTo('medicalRecords')}
            onNavigateToFindDoctor={() => navigateTo('findDoctor')}
            onLogout={handleLogout}
            onNavigateToDocument={() => navigateTo('uploadDocument')}
          />
        );

      case 'messaging':
        return (
          <MessagingList 
            onOpenChat={() => navigateTo('chat')}
            onBack={() => navigateTo('dashboard')}
          />
        );

      case 'chat':
        return (
          <ChatConversation 
            onBack={() => navigateTo('messaging')}
          />
        );

      case 'profile':
        return (
          <ProfileScreen 
            onBack={() => navigateTo('dashboard')}
            onLogout={handleLogout}
          />
        );

      case 'medicalRecords':
        return (
          <MedicalRecordsScreen 
            onBack={() => navigateTo('dashboard')}
            onOpenRecord={(id) => alert(`Ouvrir dossier ${id}`)}
            onCreateDocument={() => navigateTo('uploadDocument')}
            onNavigateHome={() => navigateTo('dashboard')}
            onNavigateToMessages={() => navigateTo('messaging')}
            onNavigateToProfile={() => navigateTo('profile')}
          />
        );

      case 'uploadDocument':
        return (
          <UploadDocumentScreen 
            onBack={() => navigateTo('medicalRecords')}
            onUpload={() => {
              alert('Document enregistré !');
              navigateTo('medicalRecords');
            }}
          />
        );

      case 'findDoctor':
        return (
          <FindDoctorScreen 
            onBack={() => navigateTo('dashboard')}
            onSelectDoctor={(id) => navigateTo('doctorProfile')}
          />
        );

      case 'doctorProfile':
        return (
          <DoctorProfileScreen 
            onBack={() => navigateTo('findDoctor')}
            onMessage={() => navigateTo('chat')}
            onCall={() => alert('Appel en cours...')}
          />
        );

      default:
        return <SplashScreen onStart={() => navigateTo('login')} />;
    }
  };

  return <View style={styles.container}>{renderScreen()}</View>;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});