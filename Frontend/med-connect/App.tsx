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
  | 'doctorProfile';

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<Screen>('splash');

  const navigateTo = (screen: Screen) => {
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
            onBackToLogin={() => navigateTo('login')}
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
            onLogout={() => navigateTo('login')}
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