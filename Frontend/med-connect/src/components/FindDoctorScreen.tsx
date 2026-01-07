import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  StatusBar,
  Image,
  ActivityIndicator,
  Alert,
  RefreshControl,
  TextInput,
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import doctorsService, { ConnectedDoctor, Doctor } from '../services/doctorsService';

interface MyDoctorsScreenProps {
  onBack: () => void;
  onNavigateToMessages: () => void;
  onNavigateToProfile: () => void;
  onNavigateToRecords: () => void;
  onNavigateToActivity: () => void;
  onDoctorPress: (doctor: ConnectedDoctor) => void;
  onCallDoctor: (phone: string) => void;
  onMessageDoctor: (doctor: ConnectedDoctor) => void;
  onShareWithDoctor: (doctor: ConnectedDoctor) => void;
}

const MyDoctorsScreen: React.FC<MyDoctorsScreenProps> = ({
  onBack,
  onNavigateToMessages,
  onNavigateToProfile,
  onNavigateToRecords,
  onNavigateToActivity,
  onDoctorPress,
  onCallDoctor,
  onMessageDoctor,
  onShareWithDoctor,
}) => {
  const [connectedDoctors, setConnectedDoctors] = useState<ConnectedDoctor[]>([]);
  const [availableDoctors, setAvailableDoctors] = useState<Doctor[]>([]);
  const [specialties, setSpecialties] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSpecialty, setSelectedSpecialty] = useState<string>('all');
  const [showAddDoctorModal, setShowAddDoctorModal] = useState(false);
  const [searchResults, setSearchResults] = useState<Doctor[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'connected' | 'available'>('connected');
  const [stats, setStats] = useState({
    totalAppointments: 0,
    upcomingAppointments: 0,
    completedAppointments: 0,
  });

  // Charger les médecins connectés
  const loadConnectedDoctors = async (showLoader = true) => {
    try {
      if (showLoader) setLoading(true);
      
      console.log('🔄 Chargement des médecins connectés...');
      const response = await doctorsService.getConnectedDoctors();
      console.log('✅ Médecins connectés chargés:', response.data.length);
      setConnectedDoctors(response.data);
      
      // Calculer les statistiques (pour l'instant, on simule)
      setStats({
        totalAppointments: response.data.length * 2, // Simulation
        upcomingAppointments: 1,
        completedAppointments: response.data.length * 2 - 1,
      });
    } catch (error: any) {
      console.error('❌ Erreur chargement médecins connectés:', error);
      Alert.alert('Erreur', 'Erreur lors du chargement des médecins connectés: ' + error.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Charger les médecins disponibles
  const loadAvailableDoctors = async () => {
    try {
      const response = await doctorsService.getAllDoctors(1, 50, selectedSpecialty);
      setAvailableDoctors(response.data);
    } catch (error: any) {
      console.error('Erreur chargement médecins disponibles:', error);
      Alert.alert('Erreur', error.message);
    }
  };

  // Charger les spécialités
  const loadSpecialties = async () => {
    try {
      console.log('🔄 Chargement des spécialités...');
      const response = await doctorsService.getSpecialties();
      console.log('✅ Spécialités chargées:', response.data);
      setSpecialties(['all', ...response.data]);
    } catch (error: any) {
      console.error('❌ Erreur chargement spécialités:', error);
      Alert.alert('Erreur', 'Erreur lors du chargement des spécialités: ' + error.message);
    }
  };

  // Rechercher des médecins
  const searchDoctors = async (query: string) => {
    if (query.length < 2) {
      setSearchResults([]);
      return;
    }

    try {
      setSearchLoading(true);
      const response = await doctorsService.searchDoctors(query);
      setSearchResults(response.data);
    } catch (error: any) {
      console.error('Erreur recherche médecins:', error);
      Alert.alert('Erreur', error.message);
    } finally {
      setSearchLoading(false);
    }
  };

  // Ajouter un médecin à la liste (envoyer demande de connexion)
  const addDoctorToList = async (doctor: Doctor) => {
    try {
      Alert.alert(
        'Ajouter un médecin',
        `Voulez-vous envoyer une demande de connexion au Dr. ${doctor.firstName} ${doctor.lastName} ?`,
        [
          { text: 'Annuler', style: 'cancel' },
          {
            text: 'Envoyer',
            onPress: async () => {
              try {
                await doctorsService.sendConnectionRequest(doctor.id);
                Alert.alert('Succès', 'Demande de connexion envoyée avec succès');
                setShowAddDoctorModal(false);
                setSearchQuery('');
                setSearchResults([]);
              } catch (error: any) {
                Alert.alert('Erreur', error.message);
              }
            }
          }
        ]
      );
    } catch (error: any) {
      Alert.alert('Erreur', error.message);
    }
  };

  // Charger les données au montage du composant
  useEffect(() => {
    loadConnectedDoctors();
    loadSpecialties();
  }, []);

  // Charger les médecins disponibles quand la spécialité change
  useEffect(() => {
    if (activeTab === 'available') {
      loadAvailableDoctors();
    }
  }, [selectedSpecialty, activeTab]);

  // Recherche en temps réel
  useEffect(() => {
    if (showAddDoctorModal && searchQuery.length >= 2) {
      const timeoutId = setTimeout(() => {
        searchDoctors(searchQuery);
      }, 500);
      return () => clearTimeout(timeoutId);
    } else {
      setSearchResults([]);
    }
  }, [searchQuery, showAddDoctorModal]);

  // Rafraîchir les données
  const handleRefresh = () => {
    setRefreshing(true);
    if (activeTab === 'connected') {
      loadConnectedDoctors(false);
    } else {
      loadAvailableDoctors();
      setRefreshing(false);
    }
  };

  // Afficher les options pour un médecin
  const showDoctorOptions = (doctor: ConnectedDoctor) => {
    Alert.alert(
      `Dr. ${doctor.firstName} ${doctor.lastName}`,
      'Que souhaitez-vous faire ?',
      [
        {
          text: 'Appeler',
          onPress: () => onCallDoctor(doctor.email), // Utiliser email à défaut de téléphone
        },
        {
          text: 'Envoyer un message',
          onPress: () => onMessageDoctor(doctor),
        },
        {
          text: 'Partager un dossier',
          onPress: () => onShareWithDoctor(doctor),
        },
        {
          text: 'Voir le profil',
          onPress: () => onDoctorPress(doctor),
        },
        {
          text: 'Annuler',
          style: 'cancel',
        },
      ]
    );
  };

  const renderStars = (rating: number = 4.5) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;

    for (let i = 0; i < fullStars; i++) {
      stars.push(
        <Ionicons key={`star-${i}`} name="star" size={14} color="#fbbf24" />
      );
    }

    if (hasHalfStar) {
      stars.push(
        <Ionicons key="star-half" name="star-half" size={14} color="#fbbf24" />
      );
    }

    const emptyStars = 5 - Math.ceil(rating);
    for (let i = 0; i < emptyStars; i++) {
      stars.push(
        <Ionicons key={`empty-${i}`} name="star-outline" size={14} color="#d1d5db" />
      );
    }

    return stars;
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="light-content" />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#3b82f6" />
          <Text style={styles.loadingText}>Chargement des médecins...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={onBack}>
          <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        <View style={styles.headerTitleContainer}>
          <Text style={styles.headerTitle}>Médecins</Text>
          <Text style={styles.headerSubtitle}>
            {activeTab === 'connected' 
              ? `${connectedDoctors.length} connectés` 
              : `${availableDoctors.length} disponibles`}
          </Text>
        </View>
        <TouchableOpacity 
          style={styles.searchButton}
          onPress={() => setShowAddDoctorModal(true)}
        >
          <Ionicons name="person-add" size={24} color="white" />
        </TouchableOpacity>
      </View>

      <ScrollView 
        style={styles.content} 
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
        {/* Stats Cards */}
        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <Ionicons name="calendar" size={24} color="#3b82f6" />
            <Text style={styles.statNumber}>{stats.totalAppointments}</Text>
            <Text style={styles.statLabel}>Rendez-vous</Text>
          </View>
          <View style={styles.statCard}>
            <Ionicons name="time" size={24} color="#10b981" />
            <Text style={styles.statNumber}>{stats.upcomingAppointments}</Text>
            <Text style={styles.statLabel}>À venir</Text>
          </View>
          <View style={styles.statCard}>
            <Ionicons name="checkmark-circle" size={24} color="#8b5cf6" />
            <Text style={styles.statNumber}>{stats.completedAppointments}</Text>
            <Text style={styles.statLabel}>Complétés</Text>
          </View>
        </View>

        {/* Onglets */}
        <View style={styles.tabsContainer}>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'connected' && styles.activeTab]}
            onPress={() => setActiveTab('connected')}
          >
            <Ionicons 
              name="people" 
              size={20} 
              color={activeTab === 'connected' ? '#3b82f6' : '#9ca3af'} 
            />
            <Text style={[styles.tabText, activeTab === 'connected' && styles.activeTabText]}>
              Mes médecins
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.tab, activeTab === 'available' && styles.activeTab]}
            onPress={() => {
              setActiveTab('available');
              loadAvailableDoctors();
            }}
          >
            <Ionicons 
              name="search" 
              size={20} 
              color={activeTab === 'available' ? '#3b82f6' : '#9ca3af'} 
            />
            <Text style={[styles.tabText, activeTab === 'available' && styles.activeTabText]}>
              Disponibles
            </Text>
          </TouchableOpacity>
        </View>

        {/* Filtre par spécialité pour l'onglet disponibles */}
        {activeTab === 'available' && (
          <View style={styles.filterContainer}>
            <Text style={styles.filterLabel}>Spécialité :</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.specialtyScroll}>
              {specialties.map((specialty) => (
                <TouchableOpacity
                  key={specialty}
                  style={[
                    styles.specialtyChip,
                    selectedSpecialty === specialty && styles.selectedSpecialtyChip
                  ]}
                  onPress={() => setSelectedSpecialty(specialty)}
                >
                  <Text style={[
                    styles.specialtyChipText,
                    selectedSpecialty === specialty && styles.selectedSpecialtyChipText
                  ]}>
                    {specialty === 'all' ? 'Toutes' : specialty}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}

        {/* Liste des médecins */}
        <View style={styles.doctorsSection}>
          <Text style={styles.sectionTitle}>
            {activeTab === 'connected' ? 'Mes praticiens' : 'Médecins disponibles'}
          </Text>
          
          {(activeTab === 'connected' ? connectedDoctors : availableDoctors).length === 0 ? (
            <View style={styles.emptyState}>
              <Ionicons name="people-outline" size={64} color="#9ca3af" />
              <Text style={styles.emptyStateTitle}>
                {activeTab === 'connected' 
                  ? 'Aucun médecin connecté' 
                  : 'Aucun médecin disponible'}
              </Text>
              <Text style={styles.emptyStateText}>
                {activeTab === 'connected'
                  ? 'Vous n\'avez pas encore de médecins connectés.\nRecherchez et ajoutez des médecins.'
                  : 'Aucun médecin trouvé pour cette spécialité.\nEssayez un autre filtre.'}
              </Text>
            </View>
          ) : (
            (activeTab === 'connected' ? connectedDoctors : availableDoctors).map((doctor) => (
              <TouchableOpacity
                key={doctor.id}
                style={styles.doctorCard}
                onPress={() => activeTab === 'connected' 
                  ? showDoctorOptions(doctor as ConnectedDoctor) 
                  : addDoctorToList(doctor)}
                activeOpacity={0.7}
              >
                {/* Avatar et infos principales */}
                <View style={styles.doctorMainInfo}>
                  <View style={styles.doctorAvatar}>
                    <Text style={styles.doctorAvatarText}>
                      {doctor.firstName.charAt(0)}{doctor.lastName.charAt(0)}
                    </Text>
                  </View>

                  <View style={styles.doctorDetails}>
                    <Text style={styles.doctorName}>
                      Dr. {doctor.firstName} {doctor.lastName}
                    </Text>
                    <Text style={styles.doctorSpecialty}>
                      {doctor.specialty || 'Médecin généraliste'}
                    </Text>
                    
                    {/* Note */}
                    <View style={styles.ratingContainer}>
                      <View style={styles.stars}>{renderStars(4.5)}</View>
                      <Text style={styles.ratingText}>4.5 (120)</Text>
                    </View>
                  </View>
                </View>

                {/* Type d'accès pour les médecins connectés */}
                {activeTab === 'connected' && 'typeAcces' in doctor && (
                  <View style={styles.accessContainer}>
                    <View style={[
                      styles.accessBadge, 
                      { backgroundColor: doctor.typeAcces === 'ECRITURE' ? '#3b82f6' : '#10b981' }
                    ]}>
                      <Ionicons 
                        name={doctor.typeAcces === 'ECRITURE' ? 'create' : 'eye'} 
                        size={12} 
                        color="white" 
                      />
                      <Text style={styles.accessBadgeText}>
                        {doctor.typeAcces === 'ECRITURE' ? 'Lecture et écriture' : 'Lecture seule'}
                      </Text>
                    </View>
                  </View>
                )}

                {/* Date de connexion pour les médecins connectés */}
                {activeTab === 'connected' && 'dateAutorisation' in doctor && (
                  <View style={styles.availabilityContainer}>
                    <Ionicons name="link" size={14} color="#10b981" />
                    <Text style={styles.availabilityText}>
                      Connecté depuis le {new Date(doctor.dateAutorisation).toLocaleDateString('fr-FR')}
                    </Text>
                  </View>
                )}

                {/* Boutons d'action */}
                <View style={styles.actionButtons}>
                  {activeTab === 'connected' ? (
                    <>
                      <TouchableOpacity
                        style={[styles.actionButton, styles.callButton]}
                        onPress={() => onCallDoctor(doctor.email)}
                      >
                        <Ionicons name="call" size={18} color="#3b82f6" />
                        <Text style={styles.callButtonText}>Contact</Text>
                      </TouchableOpacity>

                      <TouchableOpacity
                        style={[styles.actionButton, styles.messageButton]}
                        onPress={() => onMessageDoctor(doctor as ConnectedDoctor)}
                      >
                        <Ionicons name="chatbubble" size={18} color="white" />
                        <Text style={styles.messageButtonText}>Message</Text>
                      </TouchableOpacity>

                      <TouchableOpacity
                        style={[styles.actionButton, styles.shareButton]}
                        onPress={() => onShareWithDoctor(doctor as ConnectedDoctor)}
                      >
                        <Ionicons name="share" size={18} color="white" />
                        <Text style={styles.shareButtonText}>Partager</Text>
                      </TouchableOpacity>
                    </>
                  ) : (
                    <TouchableOpacity
                      style={[styles.actionButton, styles.addButton]}
                      onPress={() => addDoctorToList(doctor)}
                    >
                      <Ionicons name="person-add" size={18} color="white" />
                      <Text style={styles.addButtonText}>Ajouter</Text>
                    </TouchableOpacity>
                  )}
                </View>
              </TouchableOpacity>
            ))
          )}
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Modal d'ajout de médecin */}
      <Modal
        visible={showAddDoctorModal}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity
              style={styles.modalCloseButton}
              onPress={() => {
                setShowAddDoctorModal(false);
                setSearchQuery('');
                setSearchResults([]);
              }}
            >
              <Ionicons name="close" size={24} color="#374151" />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Rechercher un médecin</Text>
            <View style={{ width: 24 }} />
          </View>

          <View style={styles.modalContent}>
            {/* Barre de recherche */}
            <View style={styles.searchContainer}>
              <Ionicons name="search" size={20} color="#9ca3af" style={styles.searchIcon} />
              <TextInput
                style={styles.searchInput}
                placeholder="Nom, prénom ou spécialité..."
                value={searchQuery}
                onChangeText={setSearchQuery}
                autoFocus
              />
              {searchLoading && (
                <ActivityIndicator size="small" color="#3b82f6" style={styles.searchLoader} />
              )}
            </View>

            {/* Résultats de recherche */}
            <ScrollView style={styles.searchResults}>
              {searchQuery.length < 2 ? (
                <View style={styles.searchHint}>
                  <Ionicons name="information-circle-outline" size={48} color="#9ca3af" />
                  <Text style={styles.searchHintTitle}>Rechercher un médecin</Text>
                  <Text style={styles.searchHintText}>
                    Tapez au moins 2 caractères pour commencer la recherche
                  </Text>
                </View>
              ) : searchResults.length === 0 && !searchLoading ? (
                <View style={styles.searchHint}>
                  <Ionicons name="search-outline" size={48} color="#9ca3af" />
                  <Text style={styles.searchHintTitle}>Aucun résultat</Text>
                  <Text style={styles.searchHintText}>
                    Aucun médecin trouvé pour "{searchQuery}"
                  </Text>
                </View>
              ) : (
                searchResults.map((doctor) => (
                  <TouchableOpacity
                    key={doctor.id}
                    style={styles.searchResultItem}
                    onPress={() => addDoctorToList(doctor)}
                  >
                    <View style={styles.searchResultAvatar}>
                      <Text style={styles.searchResultAvatarText}>
                        {doctor.firstName.charAt(0)}{doctor.lastName.charAt(0)}
                      </Text>
                    </View>
                    <View style={styles.searchResultInfo}>
                      <Text style={styles.searchResultName}>
                        Dr. {doctor.firstName} {doctor.lastName}
                      </Text>
                      <Text style={styles.searchResultSpecialty}>
                        {doctor.specialty || 'Médecin généraliste'}
                      </Text>
                      {doctor.licenseNumber && (
                        <Text style={styles.searchResultLicense}>
                          N° {doctor.licenseNumber}
                        </Text>
                      )}
                    </View>
                    <TouchableOpacity
                      style={styles.addDoctorButton}
                      onPress={() => addDoctorToList(doctor)}
                    >
                      <Ionicons name="person-add" size={20} color="#3b82f6" />
                    </TouchableOpacity>
                  </TouchableOpacity>
                ))
              )}
            </ScrollView>
          </View>
        </SafeAreaView>
      </Modal>

      {/* Bouton FAB - Ajouter un médecin */}
      <TouchableOpacity 
        style={styles.fab}
        onPress={() => setShowAddDoctorModal(true)}
      >
        <Ionicons name="person-add" size={28} color="white" />
      </TouchableOpacity>

      {/* Bottom Navigation */}
      <View style={styles.bottomNav}>
        <TouchableOpacity style={styles.navItem} onPress={onBack}>
          <Ionicons name="home-outline" size={26} color="#9ca3af" />
          <Text style={styles.navText}>Accueil</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.navItem} onPress={onNavigateToRecords}>
          <Ionicons name="document-text-outline" size={26} color="#9ca3af" />
          <Text style={styles.navText}>Dossiers</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.navItem} onPress={onNavigateToMessages}>
          <View style={styles.navIconWrapper}>
            <Ionicons name="chatbubble-outline" size={26} color="#9ca3af" />
            <View style={styles.navBadge}>
              <Text style={styles.navBadgeText}>3</Text>
            </View>
          </View>
          <Text style={styles.navText}>Messages</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.navItem} onPress={onNavigateToActivity}>
          <Ionicons name="people" size={26} color="#14b8a6" />
          <Text style={[styles.navText, styles.navTextActive]}>Médecins</Text>
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
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#6b7280',
  },
  header: {
    backgroundColor: '#3b82f6',
    paddingTop: 16,
    paddingBottom: 20,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backButton: {
    width: 40,
    height: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitleContainer: {
    flex: 1,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
  },
  headerSubtitle: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.9)',
    marginTop: 2,
  },
  searchButton: {
    width: 40,
    height: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
  },
  statsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 16,
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 14,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  statNumber: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#111827',
    marginTop: 6,
  },
  statLabel: {
    fontSize: 11,
    color: '#6b7280',
    marginTop: 2,
  },
  doctorsSection: {
    paddingHorizontal: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 12,
  },
  emptyState: {
    alignItems: 'center',
    padding: 40,
    backgroundColor: 'white',
    borderRadius: 16,
    marginBottom: 12,
  },
  emptyStateTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#374151',
    marginTop: 16,
    textAlign: 'center',
  },
  emptyStateText: {
    fontSize: 14,
    color: '#9ca3af',
    marginTop: 8,
    textAlign: 'center',
    lineHeight: 20,
  },
  doctorCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  doctorMainInfo: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  doctorAvatar: {
    width: 60,
    height: 60,
    backgroundColor: '#dbeafe',
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  doctorAvatarText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#3b82f6',
  },
  doctorDetails: {
    flex: 1,
    justifyContent: 'center',
  },
  doctorName: {
    fontSize: 17,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 3,
  },
  doctorSpecialty: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 6,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  stars: {
    flexDirection: 'row',
    marginRight: 6,
  },
  ratingText: {
    fontSize: 13,
    color: '#6b7280',
  },
  accessContainer: {
    marginBottom: 8,
  },
  accessBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    alignSelf: 'flex-start',
    gap: 4,
  },
  accessBadgeText: {
    color: 'white',
    fontSize: 11,
    fontWeight: '500',
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  locationText: {
    fontSize: 13,
    color: '#6b7280',
    marginLeft: 4,
  },
  availabilityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0fdf4',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    marginBottom: 12,
  },
  availabilityText: {
    fontSize: 13,
    color: '#10b981',
    marginLeft: 6,
    fontWeight: '500',
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 10,
    gap: 6,
  },
  callButton: {
    backgroundColor: '#eff6ff',
    borderWidth: 1,
    borderColor: '#bfdbfe',
  },
  callButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#3b82f6',
  },
  messageButton: {
    backgroundColor: '#3b82f6',
  },
  messageButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: 'white',
  },
  shareButton: {
    backgroundColor: '#10b981',
  },
  shareButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: 'white',
  },
  addButton: {
    backgroundColor: '#10b981',
    flex: 1,
  },
  addButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: 'white',
  },
  tabsContainer: {
    flexDirection: 'row',
    backgroundColor: 'white',
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 12,
    padding: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    gap: 8,
  },
  activeTab: {
    backgroundColor: '#eff6ff',
  },
  tabText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#9ca3af',
  },
  activeTabText: {
    color: '#3b82f6',
    fontWeight: '600',
  },
  filterContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  filterLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  specialtyScroll: {
    flexDirection: 'row',
  },
  specialtyChip: {
    backgroundColor: '#f3f4f6',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  selectedSpecialtyChip: {
    backgroundColor: '#3b82f6',
    borderColor: '#3b82f6',
  },
  specialtyChipText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#6b7280',
  },
  selectedSpecialtyChipText: {
    color: 'white',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  modalCloseButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#f3f4f6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
  },
  modalContent: {
    flex: 1,
    padding: 16,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  searchIcon: {
    marginRight: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#111827',
  },
  searchLoader: {
    marginLeft: 12,
  },
  searchResults: {
    flex: 1,
  },
  searchHint: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  searchHintTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#374151',
    marginTop: 16,
    marginBottom: 8,
  },
  searchHintText: {
    fontSize: 14,
    color: '#9ca3af',
    textAlign: 'center',
    lineHeight: 20,
  },
  searchResultItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  searchResultAvatar: {
    width: 48,
    height: 48,
    backgroundColor: '#dbeafe',
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  searchResultAvatarText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#3b82f6',
  },
  searchResultInfo: {
    flex: 1,
  },
  searchResultName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 2,
  },
  searchResultSpecialty: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 2,
  },
  searchResultLicense: {
    fontSize: 12,
    color: '#9ca3af',
  },
  addDoctorButton: {
    width: 40,
    height: 40,
    backgroundColor: '#eff6ff',
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#bfdbfe',
  },
  profileButton: {
    backgroundColor: '#f3f4f6',
    flex: 0,
    paddingHorizontal: 14,
  },
  fab: {
    position: 'absolute',
    bottom: 100,
    right: 20,
    width: 60,
    height: 60,
    backgroundColor: '#3b82f6',
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
    color: '#14b8a6',
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

export default MyDoctorsScreen;