import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  StatusBar,
  SafeAreaView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface DashboardScreenProps {
  onNavigateToMessages: () => void;
  onNavigateToProfile: () => void;
  onLogout: () => void;
}

const DashboardScreen: React.FC<DashboardScreenProps> = ({
  onNavigateToMessages,
  onNavigateToProfile,
  onLogout,
}) => {
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />
      
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerContent}>
            <TouchableOpacity onPress={onNavigateToProfile} style={styles.avatar}>
              <Text style={styles.avatarText}>MD</Text>
            </TouchableOpacity>
            <View style={styles.headerInfo}>
              <Text style={styles.userName}>Marie Dubois</Text>
              <Text style={styles.userId}>34 ans • ID: MD-3647</Text>
            </View>
            <TouchableOpacity style={styles.settingsButton}>
              <Ionicons name="settings-outline" size={24} color="white" />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.content}>
          {/* Informations essentielles */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Informations essentielles</Text>
            
            <View style={styles.infoGrid}>
              <View style={[styles.infoCard, styles.allergyCard]}>
                <View style={styles.infoCardHeader}>
                  <Ionicons name="warning" size={16} color="#f97316" />
                  <Text style={styles.infoCardTitle}>Allergies</Text>
                  <View style={styles.badge}>
                    <Text style={styles.badgeText}>2</Text>
                  </View>
                </View>
                <Text style={styles.infoCardText}>Pénicilline, Arachides</Text>
              </View>

              <View style={[styles.infoCard, styles.medicationCard]}>
                <View style={styles.infoCardHeader}>
                  <Ionicons name="medical" size={16} color="#10b981" />
                  <Text style={styles.infoCardTitle}>Médicaments</Text>
                  <View style={[styles.badge, styles.badgeGreen]}>
                    <Text style={styles.badgeText}>3</Text>
                  </View>
                </View>
                <Text style={styles.infoCardText}>Aspirine 100mg, Euthryrox 75μg</Text>
              </View>
            </View>

            <View style={[styles.infoCard, styles.conditionCard]}>
              <View style={styles.infoCardHeader}>
                <Ionicons name="heart" size={16} color="#3b82f6" />
                <Text style={styles.infoCardTitle}>Conditions</Text>
                <View style={[styles.badge, styles.badgeBlue]}>
                  <Text style={styles.badgeText}>?</Text>
                </View>
              </View>
              <Text style={styles.infoCardText}>Hypothyroïdie, Migraine chronique</Text>
            </View>
          </View>

          {/* Accès rapide */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Accès rapide</Text>
            
            <View style={styles.quickAccessGrid}>
              <TouchableOpacity style={[styles.quickAccessCard, styles.quickAccessBlue]}>
                <View style={styles.iconBadge}>
                  <Ionicons name="document-text" size={24} color="#3b82f6" />
                  <View style={styles.notificationBadge}>
                    <Text style={styles.notificationText}>14</Text>
                  </View>
                </View>
                <Text style={styles.quickAccessText}>Dossiers médicaux</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={[styles.quickAccessCard, styles.quickAccessPurple]}
                onPress={onNavigateToMessages}
              >
                <View style={styles.iconBadge}>
                  <Ionicons name="chatbubble" size={24} color="#8b5cf6" />
                  <View style={[styles.notificationBadge, styles.notificationBadgeRed]}>
                    <Text style={styles.notificationText}>3</Text>
                  </View>
                </View>
                <Text style={styles.quickAccessText}>Messagerie</Text>
              </TouchableOpacity>

              <TouchableOpacity style={[styles.quickAccessCard, styles.quickAccessGreen]}>
                <View style={styles.iconBadge}>
                  <Ionicons name="people" size={24} color="#10b981" />
                  <View style={[styles.notificationBadge, styles.notificationBadgeGray]}>
                    <Text style={styles.notificationText}>5</Text>
                  </View>
                </View>
                <Text style={styles.quickAccessText}>Mes médecins</Text>
              </TouchableOpacity>

              <TouchableOpacity style={[styles.quickAccessCard, styles.quickAccessIndigo]}>
                <View style={styles.iconBadge}>
                  <Ionicons name="flask" size={24} color="#6366f1" />
                  <View style={[styles.notificationBadge, styles.notificationBadgeBlue]}>
                    <Text style={styles.notificationText}>?</Text>
                  </View>
                </View>
                <Text style={styles.quickAccessText}>Résultats labo</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Espace pour le FAB et bottom nav */}
        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Floating Action Button */}
      <TouchableOpacity style={styles.fab}>
        <Ionicons name="add" size={28} color="white" />
      </TouchableOpacity>

      {/* Bottom Navigation */}
      <View style={styles.bottomNav}>
        <TouchableOpacity style={styles.navItem}>
          <Ionicons name="home" size={24} color="#3b82f6" />
          <Text style={[styles.navText, styles.navTextActive]}>Accueil</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.navItem} onPress={onNavigateToMessages}>
          <View>
            <Ionicons name="chatbubble-outline" size={24} color="#9ca3af" />
            <View style={styles.navBadge}>
              <Text style={styles.navBadgeText}>3</Text>
            </View>
          </View>
          <Text style={styles.navText}>Messages</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.navItem}>
          <Ionicons name="notifications-outline" size={24} color="#9ca3af" />
          <Text style={styles.navText}>Activité</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.navItem} onPress={onNavigateToProfile}>
          <Ionicons name="menu-outline" size={24} color="#9ca3af" />
          <Text style={styles.navText}>Plus</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  header: {
    backgroundColor: '#3b82f6',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 30,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 48,
    height: 48,
    backgroundColor: 'white',
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  avatarText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#3b82f6',
  },
  headerInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 18,
    fontWeight: '600',
    color: 'white',
  },
  userId: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.9)',
  },
  settingsButton: {
    padding: 8,
  },
  content: {
    padding: 16,
    marginTop: -16,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 16,
  },
  infoGrid: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },
  infoCard: {
    flex: 1,
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
  },
  allergyCard: {
    backgroundColor: '#fff7ed',
    borderColor: '#fed7aa',
  },
  medicationCard: {
    backgroundColor: '#f0fdf4',
    borderColor: '#bbf7d0',
  },
  conditionCard: {
    backgroundColor: '#eff6ff',
    borderColor: '#bfdbfe',
  },
  infoCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  infoCardTitle: {
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 6,
    flex: 1,
    color: '#374151',
  },
  badge: {
    backgroundColor: '#f97316',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  badgeGreen: {
    backgroundColor: '#10b981',
  },
  badgeBlue: {
    backgroundColor: '#3b82f6',
  },
  badgeText: {
    color: 'white',
    fontSize: 10,
    fontWeight: 'bold',
  },
  infoCardText: {
    fontSize: 11,
    color: '#6b7280',
  },
  quickAccessGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  quickAccessCard: {
    width: '48%',
    padding: 16,
    borderRadius: 16,
    alignItems: 'center',
  },
  quickAccessBlue: {
    backgroundColor: '#eff6ff',
  },
  quickAccessPurple: {
    backgroundColor: '#f5f3ff',
  },
  quickAccessGreen: {
    backgroundColor: '#f0fdf4',
  },
  quickAccessIndigo: {
    backgroundColor: '#eef2ff',
  },
  iconBadge: {
    position: 'relative',
    marginBottom: 12,
  },
  notificationBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: '#3b82f6',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  notificationBadgeRed: {
    backgroundColor: '#ef4444',
  },
  notificationBadgeGray: {
    backgroundColor: '#6b7280',
  },
  notificationBadgeBlue: {
    backgroundColor: '#3b82f6',
  },
  notificationText: {
    color: 'white',
    fontSize: 10,
    fontWeight: 'bold',
  },
  quickAccessText: {
    fontSize: 13,
    fontWeight: '500',
    color: '#374151',
    textAlign: 'center',
  },
  fab: {
    position: 'absolute',
    bottom: 90,
    right: 24,
    width: 56,
    height: 56,
    backgroundColor: '#10b981',
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
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

export default DashboardScreen;