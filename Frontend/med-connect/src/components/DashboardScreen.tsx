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
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { authService } from '../services/authService';
import { patientService } from '../services/patientService';
import { doctorService } from '../services/doctorService';

interface DashboardScreenProps {
  onNavigateToMessages: () => void;
  onNavigateToProfile: () => void;
  onNavigateToRecords: () => void;
  onNavigateToFindDoctor: () => void;
  onNavigateToDocument: () => void;
  onLogout: () => void;
}

const DashboardScreen: React.FC<DashboardScreenProps> = ({
  onNavigateToMessages,
  onNavigateToProfile,
  onNavigateToRecords,
  onNavigateToFindDoctor,
  onLogout,
}) => {
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [doctorsCount, setDoctorsCount] = useState(0);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setIsLoading(true);

      // Récupérer les informations fraîches de l'utilisateur depuis l'API
      const userResponse = await authService.getCurrentUser();
      if (userResponse.success && userResponse.data) {
        setUser(userResponse.data);
      } else {
        // Fallback sur les données locales si l'API échoue
        const currentUser = authService.getUser();
        if (currentUser) {
          setUser(currentUser);
        }
      }

      // Récupérer les données du dashboard
      const dashboardResponse = await patientService.getDashboardStats();
      if (dashboardResponse.success) {
        setDashboardData(dashboardResponse.data);
      }

      // Récupérer le nombre de médecins disponibles
      const doctorsResponse = await doctorService.getAvailableDoctors({ limit: 1 });
      if (doctorsResponse.success) {
        setDoctorsCount(doctorsResponse.data.pagination.total);
      }

    } catch (error) {
      console.error('Erreur lors du chargement du dashboard:', error);
      
      // En cas d'erreur, essayer d'utiliser les données locales
      const currentUser = authService.getUser();
      if (currentUser) {
        setUser(currentUser);
      }
      
      Alert.alert(
        'Erreur',
        'Impossible de charger certaines données. Vérifiez votre connexion et appuyez sur le bouton de rafraîchissement.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const getInitials = (firstName?: string, lastName?: string) => {
    if (!firstName || !lastName) return 'U';
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  };

  const formatUserAge = (createdAt?: string) => {
    if (!createdAt) return 'Nouveau • Actif';
    
    try {
      const accountDate = new Date(createdAt);
      // Vérifier si la date est valide
      if (isNaN(accountDate.getTime())) {
        return 'Nouveau • Actif';
      }
      
      const now = new Date();
      const diffTime = Math.abs(now.getTime() - accountDate.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      if (diffDays < 1) {
        return 'Nouveau • Aujourd\'hui';
      } else if (diffDays < 30) {
        return `Nouveau • ${diffDays}j`;
      } else if (diffDays < 365) {
        const months = Math.floor(diffDays / 30);
        return `${months} mois • Actif`;
      } else {
        const years = Math.floor(diffDays / 365);
        return `${years} an${years > 1 ? 's' : ''} • Actif`;
      }
    } catch (error) {
      return 'Nouveau • Actif';
    }
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#3b82f6" />
          <Text style={styles.loadingText}>Chargement de votre dashboard...</Text>
        </View>
      </SafeAreaView>
    );
  }
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />
      
      <ScrollView showsVerticalScrollIndicator={false}>
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
                  {formatUserAge(user?.createdAt)} • ID: {user?.id?.slice(-6).toUpperCase() || 'XXXXXX'}
                </Text>
              </View>
            </View>
            <TouchableOpacity style={styles.settingsButton} onPress={onNavigateToProfile}>
              <Ionicons name="settings-outline" size={24} color="white" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Contenu principal */}
        <View style={styles.mainContent}>
          {/* Informations essentielles */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Informations essentielles</Text>
            
            <View style={styles.infoRow}>
              {/* Profil */}
              <View style={[styles.infoCard, styles.profileCard]}>
                <View style={styles.infoHeader}>
                  <Ionicons name="person" size={18} color="#3b82f6" />
                  <Text style={styles.infoTitle}>Profil</Text>
                  <View style={[styles.badge, styles.badgeBlue]}>
                    <Text style={styles.badgeText}>
                      {dashboardData?.quickStats?.profileComplete || 0}%
                    </Text>
                  </View>
                </View>
                <Text style={styles.infoText}>
                  {user?.email || 'Email non renseigné'}
                </Text>
              </View>

              {/* Médecins disponibles */}
              <View style={[styles.infoCard, styles.doctorCard]}>
                <View style={styles.infoHeader}>
                  <Ionicons name="medical" size={18} color="#10b981" />
                  <Text style={styles.infoTitle}>Médecins</Text>
                  <View style={[styles.badge, styles.badgeGreen]}>
                    <Text style={styles.badgeText}>{doctorsCount}</Text>
                  </View>
                </View>
                <Text style={styles.infoText}>
                  {doctorsCount > 0 ? `${doctorsCount} médecins disponibles` : 'Aucun médecin disponible'}
                </Text>
              </View>
            </View>

            {/* Statut du compte */}
            <View style={[styles.infoCard, styles.statusCard, styles.fullWidth]}>
              <View style={styles.infoHeader}>
                <Ionicons name="shield-checkmark" size={18} color="#10b981" />
                <Text style={styles.infoTitle}>Statut du compte</Text>
                <View style={[styles.badge, styles.badgeGreen]}>
                  <Text style={styles.badgeText}>✓</Text>
                </View>
              </View>
              <Text style={styles.infoText}>
                Compte {user?.status?.toLowerCase() || 'actif'} • 
                2FA {user?.isActive2FA ? 'activée' : 'désactivée'} • 
                Dernière connexion: {dashboardData?.quickStats?.lastConnection ? 
                  new Date(dashboardData.quickStats.lastConnection).toLocaleDateString('fr-FR') : 
                  'Aujourd\'hui'
                }
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
                onPress={onNavigateToRecords}
              >
                <View style={styles.cardIconContainer}>
                  <Ionicons name="document-text" size={32} color="#3b82f6" />
                  <View style={[styles.notificationBadge, styles.badgeBlueNotif]}>
                    <Text style={styles.notificationText}>
                      {dashboardData?.totalRecords || 0}
                    </Text>
                  </View>
                </View>
                <Text style={styles.cardTitle}>Dossiers médicaux</Text>
              </TouchableOpacity>

              {/* Messagerie */}
              <TouchableOpacity 
                style={[styles.quickAccessCard, styles.cardPurple]} 
                onPress={onNavigateToMessages}
              >
                <View style={styles.cardIconContainer}>
                  <Ionicons name="chatbubble-ellipses" size={32} color="#8b5cf6" />
                  <View style={[styles.notificationBadge, styles.badgeRed]}>
                    <Text style={styles.notificationText}>
                      {dashboardData?.unreadMessages || 0}
                    </Text>
                  </View>
                </View>
                <Text style={styles.cardTitle}>Messagerie</Text>
              </TouchableOpacity>

              {/* Mes médecins */}
              <TouchableOpacity 
                style={[styles.quickAccessCard, styles.cardTeal]} 
                onPress={onNavigateToFindDoctor}
              >
                <View style={styles.cardIconContainer}>
                  <Ionicons name="people" size={32} color="#14b8a6" />
                  <View style={[styles.notificationBadge, styles.badgeGray]}>
                    <Text style={styles.notificationText}>{doctorsCount}</Text>
                  </View>
                </View>
                <Text style={styles.cardTitle}>Trouver un médecin</Text>
              </TouchableOpacity>

              {/* Rendez-vous */}
              <TouchableOpacity style={[styles.quickAccessCard, styles.cardIndigo]}>
                <View style={styles.cardIconContainer}>
                  <Ionicons name="calendar" size={32} color="#6366f1" />
                  <View style={[styles.notificationBadge, styles.badgeBlueNotif]}>
                    <Text style={styles.notificationText}>
                      {dashboardData?.pendingAppointments || 0}
                    </Text>
                  </View>
                </View>
                <Text style={styles.cardTitle}>Rendez-vous</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Bouton FAB Vert */}
      <TouchableOpacity style={styles.fab} onPress={loadDashboardData}>
        <Ionicons name="refresh" size={32} color="white" />
      </TouchableOpacity>

      {/* Bottom Navigation - 5 items */}
      <View style={styles.bottomNav}>
        <TouchableOpacity style={styles.navItem}>
          <Ionicons name="home" size={26} color="#3b82f6" />
          <Text style={[styles.navText, styles.navTextActive]}>Accueil</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.navItem} onPress={onNavigateToRecords}>
          <Ionicons name="document-text-outline" size={26} color="#9ca3af" />
          <Text style={styles.navText}>Dossiers</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.navItem} onPress={onNavigateToMessages}>
          <View style={styles.navIconWrapper}>
            <Ionicons name="chatbubble-outline" size={26} color="#9ca3af" />
            {dashboardData?.unreadMessages > 0 && (
              <View style={styles.navBadge}>
                <Text style={styles.navBadgeText}>{dashboardData.unreadMessages}</Text>
              </View>
            )}
          </View>
          <Text style={styles.navText}>Messages</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.navItem}>
          <Ionicons name="notifications-outline" size={26} color="#9ca3af" />
          <Text style={styles.navText}>Activité</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.navItem} onPress={onNavigateToProfile}>
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f3f4f6',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
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
  profileCard: {
    backgroundColor: '#eff6ff',
    borderColor: '#bfdbfe',
  },
  doctorCard: {
    backgroundColor: '#f0fdf4',
    borderColor: '#bbf7d0',
  },
  statusCard: {
    backgroundColor: '#f0fdf4',
    borderColor: '#bbf7d0',
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
});

export default DashboardScreen;