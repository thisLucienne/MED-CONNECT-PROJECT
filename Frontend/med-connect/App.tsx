import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AuthProvider } from './src/context/AuthContext';
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
import CreateMedicalRecordScreen from './src/components/CreateMedicalRecordScreen';
import MedicalRecordDetailScreen from './src/components/MedicalRecordDetailScreen';
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
  | 'createMedicalRecord'
  | 'documentUpload'
  | 'medicalRecordDetail'
  | 'labResults';

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<Screen>('splash');
  const [navigationStack, setNavigationStack] = useState<Screen[]>(['splash']);
  const [selectedDossierId, setSelectedDossierId] = useState<string>('');

  const navigateTo = (screen: Screen, dossierId?: string) => {
    if (dossierId) {
      setSelectedDossierId(dossierId);
    }
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

  const renderScreen = () => {
    switch (currentScreen) {
      case 'splash':
        return <SplashScreen onStart={() => navigateTo('login')} />;
      case 'login':
        return <LoginScreen 
          onLogin={() => navigateTo('dashboard')} 
          onRegister={() => navigateTo('register')} 
        />;
      case 'register':
        return <RegisterScreen 
          onRegister={() => navigateTo('dashboard')} 
          onBackToLogin={() => navigateTo('login')} 
        />;
      case 'dashboard':
        return <DashboardScreen 
          onNavigate={navigateTo}
          onLogout={() => navigateTo('login')}
        />;
      case 'messaging':
        return <MessagingList 
          onSelectConversation={(conversation) => navigateTo('chat')}
          onBack={() => navigateTo('dashboard')}
          onNavigateToProfiles={() => navigateTo('profile')}
          onNavigateToRecords={() => navigateTo('medicalRecords')}
          onNavigateToActivity={() => navigateTo('findDoctor')}
        />;
      case 'chat':
        return <ChatConversation onBack={goBack} />;
      case 'profile':
        return <ProfileScreen 
          onBack={() => navigateTo('dashboard')} 
          onLogout={() => navigateTo('login')}
          onNavigateHome={() => navigateTo('dashboard')}
          onNavigateToRecords={() => navigateTo('medicalRecords')}
          onNavigateToMessages={() => navigateTo('messaging')}
          onNavigateToFindDoctor={() => navigateTo('findDoctor')}
        />;
      case 'medicalRecords':
        return <MedicalRecordsScreen 
          onBack={() => navigateTo('dashboard')}
          onUploadDocument={() => navigateTo('createMedicalRecord')}
          onOpenRecord={(dossierId) => navigateTo('medicalRecordDetail', dossierId)}
          onNavigateToMessages={() => navigateTo('messaging')}
          onNavigateToFindDoctor={() => navigateTo('findDoctor')}
          onNavigateToProfile={() => navigateTo('profile')}
        />;
      case 'createMedicalRecord':
        return <CreateMedicalRecordScreen 
          onBack={goBack}
          onSuccess={() => navigateTo('medicalRecords')}
        />;
      case 'documentUpload':
        return <UploadDocumentScreen 
          onBack={goBack}
          onUpload={() => navigateTo('medicalRecordDetail', selectedDossierId)}
        />;
      case 'medicalRecordDetail':
        return <MedicalRecordDetailScreen 
          dossierId={selectedDossierId}
          onBack={goBack}
          onAddDocument={(dossierId) => navigateTo('documentUpload', dossierId)}
        />;
      case 'uploadDocument':
        return <UploadDocumentScreen onBack={goBack} />;
      case 'findDoctor':
        return <FindDoctorScreen 
          onBack={() => navigateTo('dashboard')}
          onNavigateToMessages={() => navigateTo('messaging')}
          onNavigateToProfile={() => navigateTo('profile')}
          onNavigateToRecords={() => navigateTo('medicalRecords')}
          onNavigateToActivity={() => navigateTo('activity')}
          onDoctorPress={(doctor) => navigateTo('doctorProfile')}
          onCallDoctor={(phone) => console.log('Appel:', phone)}
          onMessageDoctor={(doctor) => navigateTo('messaging')}
          onShareWithDoctor={(doctor) => navigateTo('medicalRecords')}
        />;
      case 'doctorProfile':
        return <DoctorProfileScreen onBack={goBack} />;
      case 'activity':
        return <ActivityScreen 
          onBack={() => navigateTo('dashboard')} 
          onSelectDoctor={(id) => navigateTo('doctorProfile')}
          onNavigateToMessages={() => navigateTo('messaging')}
          onNavigateToProfile={() => navigateTo('profile')}
          onNavigateToRecords={() => navigateTo('medicalRecords')}
          onNavigateToActivity={() => navigateTo('findDoctor')}
        />;
      case 'labResults':
        return <LabResultsScreen 
          onBack={() => navigateTo('dashboard')} 
          onNavigateHome={() => navigateTo('dashboard')}
          onNavigateToRecords={() => navigateTo('medicalRecords')}
          onNavigateToMessages={() => navigateTo('messaging')}
          onNavigateToActivity={() => navigateTo('findDoctor')}
          onNavigateToProfile={() => navigateTo('profile')}
        />;
      default:
        return <SplashScreen onStart={() => navigateTo('login')} />;
    }
  };

  return (
    <SafeAreaProvider>
      <AuthProvider>
        <View style={styles.container}>
          {renderScreen()}
        </View>
      </AuthProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});