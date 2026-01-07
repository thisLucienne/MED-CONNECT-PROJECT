import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface BottomNavigationProps {
  activeScreen: 'dashboard' | 'medicalRecords' | 'messaging' | 'findDoctor' | 'profile';
  onNavigateHome: () => void;
  onNavigateToRecords: () => void;
  onNavigateToMessages: () => void;
  onNavigateToFindDoctor: () => void;
  onNavigateToProfile: () => void;
  unreadMessages?: number;
}

const BottomNavigation: React.FC<BottomNavigationProps> = ({
  activeScreen,
  onNavigateHome,
  onNavigateToRecords,
  onNavigateToMessages,
  onNavigateToFindDoctor,
  onNavigateToProfile,
  unreadMessages = 0
}) => {
  return (
    <View style={styles.bottomNav}>
      <TouchableOpacity style={styles.navItem} onPress={onNavigateHome}>
        <Ionicons 
          name={activeScreen === 'dashboard' ? 'home' : 'home-outline'} 
          size={24} 
          color={activeScreen === 'dashboard' ? '#3b82f6' : '#9ca3af'} 
        />
        <Text style={[
          styles.navText, 
          activeScreen === 'dashboard' && styles.navTextActive
        ]}>
          Accueil
        </Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.navItem} onPress={onNavigateToRecords}>
        <Ionicons 
          name={activeScreen === 'medicalRecords' ? 'document-text' : 'document-text-outline'} 
          size={24} 
          color={activeScreen === 'medicalRecords' ? '#3b82f6' : '#9ca3af'} 
        />
        <Text style={[
          styles.navText, 
          activeScreen === 'medicalRecords' && styles.navTextActive
        ]}>
          Dossiers
        </Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.navItem} onPress={onNavigateToMessages}>
        <View style={styles.navIconWrapper}>
          <Ionicons 
            name={activeScreen === 'messaging' ? 'chatbubble' : 'chatbubble-outline'} 
            size={24} 
            color={activeScreen === 'messaging' ? '#3b82f6' : '#9ca3af'} 
          />
          {unreadMessages > 0 && (
            <View style={styles.navBadge}>
              <Text style={styles.navBadgeText}>{unreadMessages}</Text>
            </View>
          )}
        </View>
        <Text style={[
          styles.navText, 
          activeScreen === 'messaging' && styles.navTextActive
        ]}>
          Messages
        </Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.navItem} onPress={onNavigateToFindDoctor}>
        <Ionicons 
          name="people" 
          size={32} 
          color={activeScreen === 'findDoctor' ? '#14b8a6' : '#9ca3af'} 
        />
        <Text style={[
          styles.navText, 
          activeScreen === 'findDoctor' && styles.navTextActive
        ]}>
          Médecins
        </Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.navItem} onPress={onNavigateToProfile}>
        <Ionicons 
          name={activeScreen === 'profile' ? 'person' : 'person-outline'} 
          size={24} 
          color={activeScreen === 'profile' ? '#3b82f6' : '#9ca3af'} 
        />
        <Text style={[
          styles.navText, 
          activeScreen === 'profile' && styles.navTextActive
        ]}>
          Profil
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  bottomNav: {
    flexDirection: 'row',
    backgroundColor: 'white',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 8,
  },
  navItem: {
    flex: 1,
    alignItems: 'center',
  },
  navIconWrapper: {
    position: 'relative',
  },
  navText: {
    fontSize: 11,
    color: '#9ca3af',
    marginTop: 4,
  },
  navTextActive: {
    color: '#3b82f6',
    fontWeight: '600',
  },
  navBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: '#ef4444',
    borderRadius: 8,
    minWidth: 16,
    height: 16,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  navBadgeText: {
    color: 'white',
    fontSize: 9,
    fontWeight: 'bold',
  },
});

export default BottomNavigation;