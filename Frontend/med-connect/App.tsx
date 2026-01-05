import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import SplashScreen from './src/components/SplashScreen';
import LoginScreen from './src/components/LoginScreen';
import RegisterScreen from './src/components/RegisterScreen';
import DashboardScreen from './src/components/DashboardScreen';
import MessagingList from './src/components/MessagingList';
import ChatConversation from './src/components/ChatConversation';
import ProfileScreen from './src/components/ProfileScreen';
import MedicalRecordsScreen from './src/components/MedicalRecordsScreen';
import UploadDocumentScreen from './src/components/UploadDocumentScreen';
import FindDoctorScreen from './src/components/FindDoctorScreen';
import DoctorProfileScreen from './src/components/DoctorProfileScreen';
import ActivityScreen from './src/components/ActivityScreen';
import LabResultsScreen from './src/components/LabResultsScreen';

type Screen = 
  | 'splash'
  | 'login'
  | 'register'
  | 'dashboard'
  | 'messaging'
  | 'chat'
  | 'profile'
  | 'medicalRecords'
  | 'uploadDocument'
  | 'findDoctor'
  | 'doctorProfile'
  | 'activity'
  | 'labResults';


export default function App() {
  const [currentScreen, setCurrentScreen] = useState<Screen>('splash');
  const [navigationStack, setNavigationStack] = useState<Screen[]>(['splash']);

  const navigateTo = (screen: Screen) => {
    setCurrentScreen(screen);
    setNavigationStack(prev => [...prev, screen]);
  };

  // Retour à l'écran précédent (enlève de l'historique)
  const goBack = () => {
    if (navigationStack.length > 1) {
      const newStack = [...navigationStack];
      newStack.pop(); // Enlever l'écran actuel
      const previousScreen = newStack[newStack.length - 1];
      
      setNavigationStack(newStack);
      setCurrentScreen(previousScreen);
    }
  };

  // Navigation de remplacement (remplace l'écran actuel au lieu d'empiler)
  const navigateReplace = (screen: Screen) => {
    const newStack = [...navigationStack];
    newStack[newStack.length - 1] = screen;
    setNavigationStack(newStack);
    setCurrentScreen(screen);
  };

  const renderScreen = () => {
    switch (currentScreen) {
      case 'splash':
        return <SplashScreen onStart={() => navigateTo('login')} />;

      case 'login':
        return (
          <LoginScreen 
            onLogin={() => navigateTo('dashboard')} 
            onCreateAccount={() => navigateTo('register')}
          />
        );

      case 'register':
        return (
          <RegisterScreen 
            onRegister={() => navigateTo('dashboard')}
            onBackToLogin={() => goBack()}
          />
        );

      case 'dashboard':
        return (
          <DashboardScreen 
            onNavigateToMessages={() => navigateTo('messaging')}
            onNavigateToProfile={() => navigateTo('profile')}
            onNavigateToRecords={() => navigateTo('medicalRecords')}
            onNavigateToFindDoctor={() => navigateTo('findDoctor')}
            onLogout={() => navigateTo('login')}
            onNavigateToDocument={() => navigateTo('uploadDocument')}
            onNavigateToActivity={() => navigateTo('activity')}
            onNavigateToLabResults={() => navigateTo('labResults')}
            onCreateDocument={() => navigateTo('uploadDocument')}
          />
        );

      case 'messaging':
        return (
          <MessagingList 
            onOpenChat={() => navigateTo('chat')}
            onBack={() => goBack()}
            onNavigateToProfiles={() => navigateTo('profile')}
            onNavigateToRecords={() => navigateTo('medicalRecords')}
            onNavigateToActivity={() => navigateTo('activity')}
          />
        );

      case 'chat':
        return (
          <ChatConversation 
            onBack={() => goBack()}
          />
        );

      case 'profile':
        return (
          <ProfileScreen 
            onBack={() => goBack()}
            onLogout={() => navigateTo('login')}
          />
        );

      case 'medicalRecords':
        return (
          <MedicalRecordsScreen 
            onBack={() => goBack()}
            onOpenRecord={(id) => alert(`Ouvrir dossier ${id}`)}
            onCreateDocument={() => navigateTo('uploadDocument')}
            onNavigateHome={() => navigateTo('dashboard')}
            onNavigateToMessages={() => navigateTo('messaging')}
            onNavigateToProfile={() => navigateTo('profile')}
            onNavigateToActivity={() => navigateTo('activity')}
          />
        );

      case 'uploadDocument':
        return (
          <UploadDocumentScreen 
            onBack={() => goBack()}
            onUpload={() => {
              alert('Document enregistré !');
              navigateTo('medicalRecords');
            }}
          />
        );

      case 'findDoctor':
        return (
          <FindDoctorScreen 
            onBack={() => goBack()}
            onNavigateToMessages={() => navigateTo('messaging')}
            onNavigateToProfile={() => navigateTo('profile')}
            onNavigateToRecords={() => navigateTo('medicalRecords')}
            onNavigateToActivity={() => navigateTo('activity')}
            onDoctorPress={(doctorId) => {
              console.log('Voir médecin:', doctorId);
              navigateTo('doctorProfile');
            }}
            onCallDoctor={(phone) => {
              alert(`Appel vers ${phone}`);
            }}
            onMessageDoctor={(doctorId) => {
              console.log('Message à:', doctorId);
              navigateTo('chat');
            }}
          />
        );

      case 'doctorProfile':
        return (
          <DoctorProfileScreen 
            onBack={() => goBack()}
            onMessage={() => navigateTo('chat')}
            onCall={() => alert('Appel en cours...')}
          />
        );

      case 'activity':
        return (
          <ActivityScreen
             onBack={() => goBack()}
      onSelectDoctor={(id) => navigateTo('doctorProfile')}
      onNavigateToMessages={() => navigateTo('messaging')}
      onNavigateToProfile={() => navigateTo('profile')}
      onNavigateToRecords={() => navigateTo('medicalRecords')}
      onNavigateToActivity={() => navigateTo('activity')}
          />
        );

      case 'labResults':
        return (
          <LabResultsScreen
            onBack={() => goBack()}
            onNavigateHome={() => navigateTo('dashboard')}
            onNavigateToRecords={() => navigateTo('medicalRecords')}
            onNavigateToMessages={() => navigateTo('messaging')}
            onNavigateToActivity={() => navigateTo('activity')}
            onNavigateToProfile={() => navigateTo('profile')}
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