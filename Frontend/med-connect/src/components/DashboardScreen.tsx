import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  StatusBar,
  SafeAreaView,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import dashboardService, { DashboardStats, UserHealthInfo } from '../services/dashboardService';

interface DashboardScreenProps {
  onNavigate: (screen: string) => void;
  onLogout: () => void;
}

const DashboardScreen: React.FC<DashboardScreenProps> = ({
  onNavigate,
  onLogout,
}) => {
  const { user, logout } = useAuth();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [healthInfo, setHealthInfo] = useState<UserHealthInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Charger les données du dashboard
  const loadDashboardData = async (showLoader = true) => {
    try {
      if (showLoader) setLoading(true);
      
      // Charger les statistiques et les informations de santé en parallèle
      const [statsResponse, healthResponse] = await Promise.allSettled([
        dashboardService.getDashboardStats(),
        dashboardService.getUserHealthInfo()
      ]);

      if (statsResponse.status === 'fulfilled') {
        setStats(statsResponse.value.data);
      }

      if (healthResponse.status === 'fulfilled') {
        setHealthInfo(healthResponse.value.data);
      }
    } catch (error) {
      console.warn('Erreur lors du chargement du dashboard:', error);
      // On continue avec les données par défaut en cas d'erreur
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Charger les données au montage du composant
  useEffect(() => {
    loadDashboardData();
  }, []);

  // Rafraîchir les données
  const handleRefresh = () => {
    setRefreshing(true);
    loadDashboardData(false);
  };

  // Données par défaut en cas d'erreur de chargement
  const defaultStats: DashboardStats = {
    dossiers: { total: 0, nouveaux: 0 },
    messages: { total: 0, nonLus: 0 },
    medecins: { total: 0, connectes: 0 },
    resultatsLabo: { total: 0, recents: 0 }
  };

  const defaultHealthInfo: UserHealthInfo = {
    allergies: ['Aucune allergie connue'],
    medicaments: ['Aucun médicament actuel'],
    conditions: ['Aucune condition particulière']
  };

  const currentStats = stats || defaultStats;
  const currentHealthInfo = healthInfo || defaultHealthInfo;

  const handleLogout = async () => {
    await logout();
    onLogout();
  };

  const getInitials = (firstName?: string, lastName?: string) => {
    if (!firstName || !lastName) return 'U';
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="light-content" />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#3b82f6" />
          <Text style={styles.loadingText}>Chargement du tableau de bord...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />
      
      <ScrollView 
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={['#3b82f6']}
            tintColor="#3b82f6"
          />
        }
      >
        {/* Header Bleu */}
        <View style={styles.header}>
          <View style={styles.headerContent}>
            <View style={styles.userInfo}>
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>
                  {getInitials(user?.firstName, user?.lastName)}
                </Text>
              </View>
              <View style={styles.userDetails}>
                <Text style={styles.userName}>
                  {user ? `${user.firstName} ${user.lastName}` : 'Utilisateur'}
                </Text>
                <Text style={styles.userId}>
                  {user?.role === 'PATIENT' ? 'Patient' : user?.role} • ID: {user?.id?.slice(-6) || 'N/A'}
                </Text>
              </View>
            </View>
            
            <View style={styles.headerActions}>
              <TouchableOpacity style={styles.settingsButton} onPress={() => onNavigate('profile')}>
                <Ionicons name="settings-outline" size={24} color="white" />
              </TouchableOpacity>
              <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
                <Ionicons name="log-out-outline" size={24} color="white" />
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Contenu principal */}
        <View style={styles.mainContent}>
          {/* Informations essentielles */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Informations essentielles</Text>
            
            <View style={styles.infoRow}>
              {/* Allergies */}
              <View style={[styles.infoCard, styles.allergyCard]}>
                <View style={styles.infoHeader}>
                  <Ionicons name="warning" size={18} color="#f97316" />
                  <Text style={styles.infoTitle}>Allergies</Text>
                  <View style={[styles.badge, styles.badgeOrange]}>
                    <Text style={styles.badgeText}>{currentHealthInfo.allergies.length}</Text>
                  </View>
                </View>
                <Text style={styles.infoText}>
                  {currentHealthInfo.allergies.slice(0, 2).join(', ')}
                  {currentHealthInfo.allergies.length > 2 && '...'}
                </Text>
              </View>

              {/* Médicaments */}
              <View style={[styles.infoCard, styles.medicationCard]}>
                <View style={styles.infoHeader}>
                  <Ionicons name="medkit" size={18} color="#10b981" />
                  <Text style={styles.infoTitle}>Médicaments</Text>
                  <View style={[styles.badge, styles.badgeGreen]}>
                    <Text style={styles.badgeText}>{currentHealthInfo.medicaments.length}</Text>
                  </View>
                </View>
                <Text style={styles.infoText}>
                  {currentHealthInfo.medicaments.slice(0, 2).join(', ')}
                  {currentHealthInfo.medicaments.length > 2 && '...'}
                </Text>
              </View>
            </View>

            {/* Conditions */}
            <View style={[styles.infoCard, styles.conditionCard, styles.fullWidth]}>
              <View style={styles.infoHeader}>
                <Ionicons name="heart" size={18} color="#3b82f6" />
                <Text style={styles.infoTitle}>Conditions</Text>
                <View style={[styles.badge, styles.badgeBlue]}>
                  <Text style={styles.badgeText}>{currentHealthInfo.conditions.length}</Text>
                </View>
              </View>
              <Text style={styles.infoText}>
                {currentHealthInfo.conditions.slice(0, 3).join(', ')}
                {currentHealthInfo.conditions.length > 3 && '...'}
              </Text>
            </View>
          </View>

          {/* Accès rapide */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Accès rapide</Text>
            
            <View style={styles.quickAccessGrid}>
              {/* Dossiers médicaux */}
              <TouchableOpacity 
                style={[styles.quickAccessCard, styles.cardBlue]} 
                onPress={() => onNavigate('medicalRecords')}
              >
                <View style={styles.cardIconContainer}>
                  <Ionicons name="document-text" size={32} color="#3b82f6" />
                  <View style={[styles.notificationBadge, styles.badgeBlueNotif]}>
                    <Text style={styles.notificationText}>{currentStats.dossiers.total}</Text>
                  </View>
                </View>
                <Text style={styles.cardTitle}>Dossiers médicaux</Text>
              </TouchableOpacity>

              {/* Messagerie */}
              <TouchableOpacity 
                style={[styles.quickAccessCard, styles.cardPurple]} 
                onPress={() => onNavigate('messaging')}
              >
                <View style={styles.cardIconContainer}>
                  <Ionicons name="chatbubble-ellipses" size={32} color="#8b5cf6" />
                  {currentStats.messages.nonLus > 0 && (
                    <View style={[styles.notificationBadge, styles.badgeRed]}>
                      <Text style={styles.notificationText}>{currentStats.messages.nonLus}</Text>
                    </View>
                  )}
                </View>
                <Text style={styles.cardTitle}>Messagerie</Text>
              </TouchableOpacity>

              {/* Mes médecins */}
              <TouchableOpacity 
                style={[styles.quickAccessCard, styles.cardTeal]} 
                onPress={() => onNavigate('findDoctor')}
              >
                <View style={styles.cardIconContainer}>
                  <Ionicons name="people" size={32} color="#14b8a6" />
                  <View style={[styles.notificationBadge, styles.badgeGray]}>
                    <Text style={styles.notificationText}>{currentStats.medecins.connectes}</Text>
                  </View>
                </View>
                <Text style={styles.cardTitle}>Mes médecins</Text>
              </TouchableOpacity>

              {/* Résultats labo */}
              <TouchableOpacity style={[styles.quickAccessCard, styles.cardIndigo]} onPress={() => onNavigate('labResults')}>
                <View style={styles.cardIconContainer}>
                  <Ionicons name="flask" size={32} color="#6366f1" />
                  {currentStats.resultatsLabo.recents > 0 && (
                    <View style={[styles.notificationBadge, styles.badgeBlueNotif]}>
                      <Text style={styles.notificationText}>{currentStats.resultatsLabo.recents}</Text>
                    </View>
                  )}
                </View>
                <Text style={styles.cardTitle}>Résultats labo</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Bouton FAB Vert */}
      <TouchableOpacity style={styles.fab} onPress={() => onNavigate('uploadDocument')}>
        <Ionicons name="add" size={32} color="white" />
      </TouchableOpacity>

      {/* Bottom Navigation - 5 items */}
      <View style={styles.bottomNav}>
        <TouchableOpacity style={styles.navItem}>
          <Ionicons name="home" size={26} color="#3b82f6" />
          <Text style={[styles.navText, styles.navTextActive]}>Accueil</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.navItem} onPress={() => onNavigate('medicalRecords')}>
          <Ionicons name="document-text-outline" size={26} color="#9ca3af" />
          <Text style={styles.navText}>Dossiers</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.navItem} onPress={() => onNavigate('messaging')}>
          <View style={styles.navIconWrapper}>
            <Ionicons name="chatbubble-outline" size={26} color="#9ca3af" />
            {currentStats.messages.nonLus > 0 && (
              <View style={styles.navBadge}>
                <Text style={styles.navBadgeText}>{currentStats.messages.nonLus}</Text>
              </View>
            )}
          </View>
          <Text style={styles.navText}>Messages</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.navItem} onPress={() => onNavigate('findDoctor')}>
          <Ionicons name="people" size={32} color="#14b8a6" />
          <Text style={styles.navText}>Médecins</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.navItem} onPress={() => onNavigate('profile')}>
          <Ionicons name="person-outline" size={26} color="#9ca3af" />
          <Text style={styles.navText}>Profil</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f3f4f6',
  },
  header: {
    backgroundColor: '#3b82f6',
    paddingTop: 16,
    paddingBottom: 24,
    paddingHorizontal: 20,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  avatar: {
    width: 56,
    height: 56,
    backgroundColor: 'white',
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  avatarText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#3b82f6',
  },
  userDetails: {
    flex: 1,
  },
  userName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 2,
  },
  userId: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.9)',
  },
  settingsButton: {
    padding: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 8,
  },
  headerActions: {
    flexDirection: 'row',
    gap: 8,
  },
  logoutButton: {
    padding: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 8,
  },
  mainContent: {
    padding: 16,
  },
  section: {
    marginBottom: 28,
  },
  sectionTitle: {
    fontSize: 19,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 16,
  },
  infoRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },
  infoCard: {
    flex: 1,
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
  },
  fullWidth: {
    width: '100%',
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
  infoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  infoTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#374151',
    marginLeft: 8,
    flex: 1,
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
    minWidth: 24,
    alignItems: 'center',
  },
  badgeOrange: {
    backgroundColor: '#f97316',
  },
  badgeGreen: {
    backgroundColor: '#10b981',
  },
  badgeBlue: {
    backgroundColor: '#3b82f6',
  },
  badgeText: {
    color: 'white',
    fontSize: 11,
    fontWeight: 'bold',
  },
  infoText: {
    fontSize: 12,
    color: '#6b7280',
    lineHeight: 18,
  },
  quickAccessGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  quickAccessCard: {
    width: '48%',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 130,
  },
  cardBlue: {
    backgroundColor: '#eff6ff',
  },
  cardPurple: {
    backgroundColor: '#f5f3ff',
  },
  cardTeal: {
    backgroundColor: '#f0fdfa',
  },
  cardIndigo: {
    backgroundColor: '#eef2ff',
  },
  cardIconContainer: {
    position: 'relative',
    marginBottom: 12,
  },
  notificationBadge: {
    position: 'absolute',
    top: -6,
    right: -6,
    minWidth: 22,
    height: 22,
    borderRadius: 11,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 6,
  },
  badgeBlueNotif: {
    backgroundColor: '#3b82f6',
  },
  badgeRed: {
    backgroundColor: '#ef4444',
  },
  badgeGray: {
    backgroundColor: '#6b7280',
  },
  notificationText: {
    color: 'white',
    fontSize: 11,
    fontWeight: 'bold',
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    textAlign: 'center',
  },
  fab: {
    position: 'absolute',
    bottom: 100,
    right: 20,
    width: 60,
    height: 60,
    backgroundColor: '#10b981',
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 8,
  },
  bottomNav: {
    flexDirection: 'row',
    backgroundColor: 'white',
    paddingVertical: 10,
    paddingHorizontal: 8,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 10,
  },
  navItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  navIconWrapper: {
    position: 'relative',
  },
  navText: {
    fontSize: 11,
    color: '#9ca3af',
    marginTop: 4,
    fontWeight: '500',
  },
  navTextActive: {
    color: '#3b82f6',
    fontWeight: '600',
  },
  navBadge: {
    position: 'absolute',
    top: -6,
    right: -8,
    backgroundColor: '#ef4444',
    borderRadius: 10,
    minWidth: 18,
    height: 18,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  navBadgeText: {
    color: 'white',
    fontSize: 10,
    fontWeight: 'bold',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#6b7280',
  },
});

export default DashboardScreen;