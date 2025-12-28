import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import SplashScreen from './src/components/SplashScreen';
import LoginScreen from './src/components/LoginScreen';
import DashboardScreen from './src/components/DashboardScreen';
import MessagingList from './src/components/MessagingList';
import ChatConversation from './src/components/ChatConversation';
import ProfileScreen from './src/components/ProfileScreen';
import RegisterScreen from './src/components/RegisterScreen';

type Screen = 
  | 'splash'
  | 'login'
  | 'register'
  | 'dashboard'
  | 'messaging'
  | 'chat'
  | 'profile';

interface NavigationState {
  currentScreen: Screen;
  previousScreen: Screen | null;
}

export default function App() {
  const [navigation, setNavigation] = useState<NavigationState>({
    currentScreen: 'splash',
    previousScreen: null,
  });

  const navigateTo = (screen: Screen) => {
    setNavigation({
      currentScreen: screen,
      previousScreen: navigation.currentScreen,
    });
  };

  const goBack = () => {
    if (navigation.previousScreen) {
      setNavigation({
        currentScreen: navigation.previousScreen,
        previousScreen: null,
      });
    }
  };

  const renderScreen = () => {
    switch (navigation.currentScreen) {
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
            onLogout={() => navigateTo('login')}
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