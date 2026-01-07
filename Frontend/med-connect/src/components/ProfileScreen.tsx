import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, StatusBar, Alert, ActivityIndicator, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import profileService, { UserProfile, UserStats } from '../services/profileService';
import authService from '../services/authService';
import EditProfileScreen from './EditProfileScreen';
import BottomNavigation from './BottomNavigation';

interface ProfileScreenProps {
  onBack: () => void;
  onLogout: () => void;
  onNavigateHome?: () => void;
  onNavigateToRecords?: () => void;
  onNavigateToMessages?: () => void;
  onNavigateToFindDoctor?: () => void;
}

const ProfileScreen: React.FC<ProfileScreenProps> = ({ 
  onBack, 
  onLogout,
  onNavigateHome,
  onNavigateToRecords,
  onNavigateToMessages,
  onNavigateToFindDoctor
}) => {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [stats, setStats] = useState<UserStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showEditProfile, setShowEditProfile] = useState(false);
  const [forceUpdate, setForceUpdate] = useState(0); // Pour forcer les re-renders

  // Charger le profil utilisateur
  const loadProfile = async (showLoader = true) => {
    try {
      if (showLoader) setLoading(true);
      
      console.log('🔄 Chargement du profil...');
      
      // Ajouter un timestamp pour éviter le cache
      const timestamp = Date.now();
      const [profileResponse, statsResponse] = await Promise.allSettled([
        profileService.getProfile(),
        profileService.getUserStats()
      ]);

      if (profileResponse.status === 'fulfilled') {
        console.log('✅ Profil chargé:', profileResponse.value.data);
        // Les données du profil sont dans data.user
        const profileData = profileResponse.value.data.user || profileResponse.value.data;
        
        // Vérification et nettoyage des données
        const cleanedProfile = {
          ...profileData,
          dateNaissance: profileData.dateNaissance || null,
          phone: profileData.phone || null,
          firstName: profileData.firstName || '',
          lastName: profileData.lastName || ''
        };
        
        console.log('📋 Profil nettoyé:', cleanedProfile);
        setProfile(cleanedProfile);
        console.log('📋 Profil mis en état:', cleanedProfile);
      } else {
        console.error('❌ Erreur profil:', profileResponse.reason);
      }

      if (statsResponse.status === 'fulfilled') {
        console.log('✅ Stats chargées:', statsResponse.value.data);
        setStats(statsResponse.value.data);
      } else {
        console.error('❌ Erreur stats:', statsResponse.reason);
        // Stats par défaut si erreur
        setStats({
          totalVisits: 0,
          totalReports: 0,
          totalMessages: 0,
          connectedDoctors: 0
        });
      }
    } catch (error: any) {
      console.error('❌ Erreur chargement profil:', error);
      Alert.alert('Erreur', 'Erreur lors du chargement du profil: ' + error.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Charger les données au montage du composant
  useEffect(() => {
    loadProfile();
  }, []);

  // Recharger les données quand on revient sur cet écran
  useEffect(() => {
    if (!showEditProfile) {
      // Quand on revient de l'écran d'édition, recharger les données
      loadProfile(false);
    }
  }, [showEditProfile]);

  // Rafraîchir les données
  const handleRefresh = () => {
    setRefreshing(true);
    loadProfile(false);
  };

  // Calculer l'âge réel à partir de la date de naissance
  const calculateAge = (dateNaissance?: string) => {
    if (!dateNaissance) return null;
    
    const birthDate = new Date(dateNaissance);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    
    return age;
  };

  // Générer les initiales
  const getInitials = (firstName?: string, lastName?: string) => {
    const first = firstName || '';
    const last = lastName || '';
    const firstInitial = first.length > 0 ? first.charAt(0) : '';
    const lastInitial = last.length > 0 ? last.charAt(0) : '';
    const initials = `${firstInitial}${lastInitial}`.toUpperCase();
    return initials || 'U';
  };

  // Gérer la mise à jour du profil
  const handleProfileUpdated = (updatedProfile: UserProfile) => {
    console.log('🔄 handleProfileUpdated appelé avec:', JSON.stringify(updatedProfile, null, 2));
    console.log('🔄 Profil actuel avant mise à jour:', JSON.stringify(profile, null, 2));
    
    // Mise à jour immédiate de l'état
    setProfile(updatedProfile);
    
    // Forcer un re-render complet
    setForceUpdate(prev => prev + 1);
    
    // Recharger depuis le serveur pour garantir la synchronisation
    setTimeout(() => {
      console.log('🔄 Rechargement forcé des données depuis le serveur...');
      loadProfile(false);
    }, 500);
  };

  const handleLogout = async () => {
    Alert.alert(
      'Déconnexion',
      'Êtes-vous sûr de vouloir vous déconnecter ?',
      [
        { text: 'Annuler', style: 'cancel' },
        { 
          text: 'Déconnexion', 
          onPress: async () => {
            try {
              await authService.logout();
              onLogout();
            } catch (error) {
              console.error('Erreur déconnexion:', error);
              onLogout(); // Déconnecter quand même côté client
            }
          }, 
          style: 'destructive' 
        },
      ]
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="light-content" />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#3b82f6" />
          <Text style={styles.loadingText}>Chargement du profil...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!profile) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="light-content" />
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle-outline" size={64} color="#ef4444" />
          <Text style={styles.errorTitle}>Erreur de chargement</Text>
          <Text style={styles.errorText}>Impossible de charger le profil</Text>
          <TouchableOpacity style={styles.retryButton} onPress={() => loadProfile()}>
            <Text style={styles.retryButtonText}>Réessayer</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  // Log pour débogage - voir si les données changent dans le rendu
  console.log('🎨 Rendu ProfileScreen avec profil:', {
    firstName: profile.firstName,
    lastName: profile.lastName,
    phone: profile.phone,
    dateNaissance: profile.dateNaissance
  });

  // Si on est en mode édition, afficher l'écran de modification
  if (showEditProfile && profile) {
    return (
      <EditProfileScreen
        profile={profile}
        onBack={() => setShowEditProfile(false)}
        onProfileUpdated={handleProfileUpdated}
      />
    );
  }

  return (
    <SafeAreaView style={styles.container} key={`profile-${forceUpdate}`}>
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
        {/* Header avec gradient */}
        <LinearGradient colors={['#60a5fa', '#3b82f6']} style={styles.header}>
          <TouchableOpacity onPress={onBack} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="white" />
          </TouchableOpacity>

          <View style={styles.headerButtons}>
            <TouchableOpacity style={styles.refreshButton} onPress={() => {
              console.log('🔄 Bouton refresh pressé');
              loadProfile(true);
            }}>
              <Ionicons name="refresh" size={24} color="white" />
            </TouchableOpacity>
          </View>
        </LinearGradient>

        {/* Photo de profil */}
        <View style={styles.profileSection}>
          <View style={styles.avatarContainer}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{getInitials(profile.firstName, profile.lastName)}</Text>
            </View>
            <TouchableOpacity style={styles.cameraButton}>
              <Ionicons name="camera" size={16} color="white" />
            </TouchableOpacity>
          </View>

          <View style={styles.profileInfo}>
            <View style={styles.nameRow}>
              <Text style={styles.userName}>{profile.firstName} {profile.lastName}</Text>
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{profile.role}</Text>
              </View>
            </View>
            <Text style={styles.userId}>
              {profile.dateNaissance 
                ? `${calculateAge(profile.dateNaissance)} ans` 
                : 'Âge non renseigné'} • ID: {profile.id ? profile.id.substring(0, 8).toUpperCase() : 'N/A'}
            </Text>
            <TouchableOpacity style={styles.editButton} onPress={() => setShowEditProfile(true)}>
              <Ionicons name="pencil" size={16} color="#3b82f6" />
              <Text style={styles.editButtonText}>Modifier le profil</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Statistiques */}
        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <Ionicons name="pulse" size={24} color="#3b82f6" />
            <Text style={styles.statValue}>{stats?.totalVisits || 0}</Text>
            <Text style={styles.statLabel}>Visites</Text>
          </View>

          <View style={styles.statCard}>
            <Ionicons name="document-text" size={24} color="#10b981" />
            <Text style={styles.statValue}>{stats?.totalReports || 0}</Text>
            <Text style={styles.statLabel}>Rapports</Text>
          </View>

          <View style={styles.statCard}>
            <Ionicons name="chatbubble" size={24} color="#8b5cf6" />
            <Text style={styles.statValue}>{stats?.totalMessages || 0}</Text>
            <Text style={styles.statLabel}>Messages</Text>
          </View>
        </View>

        {/* Informations personnelles */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Informations personnelles</Text>
          
          <View style={styles.card}>
            <TouchableOpacity style={styles.cardItem}>
              <View style={[styles.iconCircle, { backgroundColor: '#eff6ff' }]}>
                <Ionicons name="mail" size={20} color="#3b82f6" />
              </View>
              <View style={styles.cardItemContent}>
                <Text style={styles.cardItemLabel}>Email</Text>
                <Text style={styles.cardItemValue}>{profile.email}</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
            </TouchableOpacity>

            <View style={styles.divider} />

            <TouchableOpacity style={styles.cardItem}>
              <View style={[styles.iconCircle, { backgroundColor: '#f0fdf4' }]}>
                <Ionicons name="call" size={20} color="#10b981" />
              </View>
              <View style={styles.cardItemContent}>
                <Text style={styles.cardItemLabel}>Téléphone</Text>
                <Text style={styles.cardItemValue}>{profile.phone || 'Non renseigné'}</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
            </TouchableOpacity>

            <View style={styles.divider} />

            <TouchableOpacity style={styles.cardItem}>
              <View style={[styles.iconCircle, { backgroundColor: '#f5f3ff' }]}>
                <Ionicons name="calendar" size={20} color="#8b5cf6" />
              </View>
              <View style={styles.cardItemContent}>
                <Text style={styles.cardItemLabel}>Membre depuis</Text>
                <Text style={styles.cardItemValue}>
                  {profile.createdAt 
                    ? new Date(profile.createdAt).toLocaleDateString('fr-FR', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })
                    : 'Non disponible'}
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
            </TouchableOpacity>

            <View style={styles.divider} />

            <TouchableOpacity style={styles.cardItem}>
              <View style={[styles.iconCircle, { backgroundColor: '#fef2f2' }]}>
                <Ionicons name="people" size={20} color="#ef4444" />
              </View>
              <View style={styles.cardItemContent}>
                <Text style={styles.cardItemLabel}>Statut du compte</Text>
                <View style={styles.statusRow}>
                  <View style={[styles.activeDot, { 
                    backgroundColor: profile.status === 'ACTIVE' ? '#10b981' : '#ef4444' 
                  }]} />
                  <Text style={[styles.activeText, { 
                    color: profile.status === 'ACTIVE' ? '#10b981' : '#ef4444' 
                  }]}>
                    {profile.status === 'ACTIVE' ? 'Actif' : profile.status}
                  </Text>
                </View>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
            </TouchableOpacity>

            <View style={styles.divider} />

            <TouchableOpacity style={styles.cardItem}>
              <View style={[styles.iconCircle, { backgroundColor: '#fef3c7' }]}>
                <Ionicons name="calendar-outline" size={20} color="#f59e0b" />
              </View>
              <View style={styles.cardItemContent}>
                <Text style={styles.cardItemLabel}>Date de naissance</Text>
                <Text style={styles.cardItemValue}>
                  {profile.dateNaissance 
                    ? new Date(profile.dateNaissance).toLocaleDateString('fr-FR', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })
                    : 'Non renseignée'}
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
            </TouchableOpacity>

            <View style={styles.divider} />

            <TouchableOpacity style={styles.cardItem}>
              <View style={[styles.iconCircle, { backgroundColor: '#fff7ed' }]}>
                <Ionicons name="location" size={20} color="#f97316" />
              </View>
              <View style={styles.cardItemContent}>
                <Text style={styles.cardItemLabel}>Dernière connexion</Text>
                <Text style={styles.cardItemValue}>
                  {profile.lastConnection 
                    ? new Date(profile.lastConnection).toLocaleDateString('fr-FR', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })
                    : 'Première connexion'}
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Sécurité et confidentialité */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Sécurité et confidentialité</Text>
          
          <View style={styles.card}>
            <TouchableOpacity style={styles.cardItem}>
              <View style={[styles.iconCircle, { backgroundColor: '#eff6ff' }]}>
                <Ionicons name="lock-closed" size={20} color="#3b82f6" />
              </View>
              <View style={styles.cardItemContent}>
                <Text style={styles.cardItemValue}>Modifier le mot de passe</Text>
                <Text style={styles.cardItemLabel}>Dernière modification il y a 3 mois</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
            </TouchableOpacity>

            <View style={styles.divider} />

            <TouchableOpacity style={styles.cardItem}>
              <View style={[styles.iconCircle, { backgroundColor: '#f0fdf4' }]}>
                <Ionicons name="shield-checkmark" size={20} color="#10b981" />
              </View>
              <View style={styles.cardItemContent}>
                <Text style={styles.cardItemValue}>Authentification à deux facteurs</Text>
                <View style={styles.statusRow}>
                  <View style={[styles.activeDot, { 
                    backgroundColor: profile.isVerified ? '#10b981' : '#ef4444' 
                  }]} />
                  <Text style={[styles.activeText, { 
                    color: profile.isVerified ? '#10b981' : '#ef4444' 
                  }]}>
                    {profile.isVerified ? 'Compte vérifié' : 'Non vérifié'}
                  </Text>
                </View>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
            </TouchableOpacity>

            <View style={styles.divider} />

            <TouchableOpacity style={styles.cardItem}>
              <View style={[styles.iconCircle, { backgroundColor: '#f5f3ff' }]}>
                <Ionicons name="notifications" size={20} color="#8b5cf6" />
              </View>
              <View style={styles.cardItemContent}>
                <Text style={styles.cardItemValue}>Notifications</Text>
                <Text style={styles.cardItemLabel}>Gérer les préférences de notification</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
            </TouchableOpacity>

            <View style={styles.divider} />

            <TouchableOpacity style={styles.cardItem}>
              <View style={[styles.iconCircle, { backgroundColor: '#f9fafb' }]}>
                <Ionicons name="document-text" size={20} color="#6b7280" />
              </View>
              <View style={styles.cardItemContent}>
                <Text style={styles.cardItemValue}>Données médicales</Text>
                <Text style={styles.cardItemLabel}>Gérer l'accès à vos données</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Bouton de déconnexion */}
        <View style={styles.section}>
          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
            <Text style={styles.logoutButtonText}>Se déconnecter</Text>
          </TouchableOpacity>
        </View>

        {/* Bouton de test pour forcer le rechargement */}
        <View style={styles.testSection}>
          <TouchableOpacity 
            style={styles.testButton} 
            onPress={() => {
              console.log('🧪 Test: Rechargement forcé du profil');
              setProfile(null);
              setForceUpdate(prev => prev + 1);
              loadProfile(true);
            }}
          >
            <Text style={styles.testButtonText}>🔄 Recharger le profil</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.testButton} 
            onPress={() => {
              console.log('🧪 Test: Données actuelles du profil:', JSON.stringify(profile, null, 2));
              Alert.alert(
                'Données du profil',
                `Prénom: ${profile?.firstName}\nNom: ${profile?.lastName}\nTéléphone: ${profile?.phone}\nDate naissance: ${profile?.dateNaissance}`,
                [{ text: 'OK' }]
              );
            }}
          >
            <Text style={styles.testButtonText}>📋 Voir les données</Text>
          </TouchableOpacity>
        </View>

        {/* Version */}
        <Text style={styles.version}>Med-Connect v2.1.0</Text>

        <View style={{ height: 40 }} />
      </ScrollView>

      {/* Bottom Navigation */}
      {onNavigateHome && onNavigateToRecords && onNavigateToMessages && onNavigateToFindDoctor && (
        <BottomNavigation
          activeScreen="profile"
          onNavigateHome={onNavigateHome}
          onNavigateToRecords={onNavigateToRecords}
          onNavigateToMessages={onNavigateToMessages}
          onNavigateToFindDoctor={onNavigateToFindDoctor}
          onNavigateToProfile={() => {}} // Déjà sur la page profil
          unreadMessages={stats?.totalMessages || 0}
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  header: {
    height: 150,
    paddingTop: 16,
    paddingHorizontal: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerButtons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  refreshButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  profileSection: {
    alignItems: 'center',
    marginTop: -64,
    paddingHorizontal: 24,
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: 16,
  },
  avatar: {
    width: 128,
    height: 128,
    borderRadius: 64,
    backgroundColor: '#3b82f6',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 4,
    borderColor: 'white',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 8,
  },
  avatarText: {
    fontSize: 48,
    fontWeight: 'bold',
    color: 'white',
  },
  cameraButton: {
    position: 'absolute',
    bottom: 4,
    right: 4,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#3b82f6',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: 'white',
  },
  profileInfo: {
    alignItems: 'center',
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  badge: {
    backgroundColor: '#dbeafe',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#1e40af',
  },
  userId: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 12,
  },
  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  editButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#3b82f6',
  },
  statsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 24,
    gap: 12,
    marginTop: 24,
    marginBottom: 24,
  },
  statCard: {
    flex: 1,
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1f2937',
    marginTop: 8,
  },
  statLabel: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 4,
  },
  section: {
    paddingHorizontal: 24,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 12,
  },
  card: {
    backgroundColor: 'white',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  cardItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  cardItemContent: {
    flex: 1,
  },
  cardItemLabel: {
    fontSize: 12,
    color: '#6b7280',
    marginBottom: 2,
  },
  cardItemValue: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1f2937',
  },
  divider: {
    height: 1,
    backgroundColor: '#f3f4f6',
    marginLeft: 68,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 2,
  },
  activeDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#10b981',
  },
  activeText: {
    fontSize: 12,
    color: '#10b981',
  },
  logoutButton: {
    backgroundColor: '#fef2f2',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  logoutButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ef4444',
  },
  version: {
    fontSize: 12,
    color: '#9ca3af',
    textAlign: 'center',
  },
  testSection: {
    paddingHorizontal: 24,
    marginBottom: 20,
    gap: 10,
  },
  testButton: {
    backgroundColor: '#f59e0b',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  testButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
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
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  errorTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#374151',
    marginTop: 16,
    textAlign: 'center',
  },
  errorText: {
    fontSize: 14,
    color: '#9ca3af',
    marginTop: 8,
    textAlign: 'center',
  },
  retryButton: {
    backgroundColor: '#3b82f6',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 16,
  },
  retryButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
});

export default ProfileScreen;