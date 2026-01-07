import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  StatusBar,
  SafeAreaView,
  Alert,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import doctorsService, { ConnectedDoctor } from '../services/doctorsService';

interface DoctorsScreenProps {
  onBack: () => void;
  onContactDoctor: (doctor: ConnectedDoctor) => void;
  onMessageDoctor: (doctor: ConnectedDoctor) => void;
  onShareWithDoctor: (doctor: ConnectedDoctor) => void;
}

const DoctorsScreen: React.FC<DoctorsScreenProps> = ({
  onBack,
  onContactDoctor,
  onMessageDoctor,
  onShareWithDoctor,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [connectedDoctors, setConnectedDoctors] = useState<ConnectedDoctor[]>([]);
  const [filteredDoctors, setFilteredDoctors] = useState<ConnectedDoctor[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Charger les médecins connectés
  const loadConnectedDoctors = async (showLoader = true) => {
    try {
      if (showLoader) setLoading(true);
      
      const response = await doctorsService.getConnectedDoctors();
      setConnectedDoctors(response.data);
      setFilteredDoctors(response.data);
    } catch (error: any) {
      console.error('Erreur chargement médecins:', error);
      Alert.alert('Erreur', error.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Charger les données au montage du composant
  useEffect(() => {
    loadConnectedDoctors();
  }, []);

  // Filtrer les médecins selon la recherche
  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredDoctors(connectedDoctors);
    } else {
      const filtered = connectedDoctors.filter(doctor =>
        `${doctor.firstName} ${doctor.lastName}`.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (doctor.specialty && doctor.specialty.toLowerCase().includes(searchQuery.toLowerCase()))
      );
      setFilteredDoctors(filtered);
    }
  }, [searchQuery, connectedDoctors]);

  // Rafraîchir les données
  const handleRefresh = () => {
    setRefreshing(true);
    loadConnectedDoctors(false);
  };

  // Afficher les options pour un médecin
  const showDoctorOptions = (doctor: ConnectedDoctor) => {
    Alert.alert(
      `Dr. ${doctor.firstName} ${doctor.lastName}`,
      'Que souhaitez-vous faire ?',
      [
        {
          text: 'Contacter',
          onPress: () => onContactDoctor(doctor),
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
          text: 'Annuler',
          style: 'cancel',
        },
      ]
    );
  };

  const renderDoctorItem = ({ item }: { item: ConnectedDoctor }) => {
    const getAccessTypeColor = (type: string) => {
      return type === 'ECRITURE' ? '#3b82f6' : '#10b981';
    };

    const getAccessTypeText = (type: string) => {
      return type === 'ECRITURE' ? 'Lecture et écriture' : 'Lecture seule';
    };

    return (
      <TouchableOpacity
        style={styles.doctorCard}
        onPress={() => showDoctorOptions(item)}
      >
        <View style={styles.doctorHeader}>
          <View style={styles.doctorAvatar}>
            <Text style={styles.doctorAvatarText}>
              {item.firstName.charAt(0)}{item.lastName.charAt(0)}
            </Text>
          </View>
          
          <View style={styles.doctorInfo}>
            <Text style={styles.doctorName}>
              Dr. {item.firstName} {item.lastName}
            </Text>
            {item.specialty && (
              <Text style={styles.doctorSpecialty}>{item.specialty}</Text>
            )}
            <View style={styles.accessInfo}>
              <View style={[styles.accessBadge, { backgroundColor: getAccessTypeColor(item.typeAcces) }]}>
                <Ionicons 
                  name={item.typeAcces === 'ECRITURE' ? 'create' : 'eye'} 
                  size={12} 
                  color="white" 
                />
                <Text style={styles.accessBadgeText}>
                  {getAccessTypeText(item.typeAcces)}
                </Text>
              </View>
            </View>
          </View>

          <View style={styles.doctorActions}>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => onMessageDoctor(item)}
            >
              <Ionicons name="chatbubble" size={20} color="#3b82f6" />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => onShareWithDoctor(item)}
            >
              <Ionicons name="share" size={20} color="#10b981" />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.doctorFooter}>
          <View style={styles.connectionInfo}>
            <Ionicons name="time" size={14} color="#9ca3af" />
            <Text style={styles.connectionDate}>
              Connecté depuis le {new Date(item.dateAutorisation).toLocaleDateString('fr-FR')}
            </Text>
          </View>
          
          {item.isOnline && (
            <View style={styles.onlineIndicator}>
              <View style={styles.onlineDot} />
              <Text style={styles.onlineText}>En ligne</Text>
            </View>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#3b82f6" />
          <Text style={styles.loadingText}>Chargement des médecins...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={onBack}>
          <Ionicons name="arrow-back" size={24} color="#374151" />
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>Mes médecins</Text>
          <Text style={styles.headerSubtitle}>
            {connectedDoctors.length} médecin{connectedDoctors.length > 1 ? 's' : ''} connecté{connectedDoctors.length > 1 ? 's' : ''}
          </Text>
        </View>
      </View>

      {/* Barre de recherche */}
      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color="#9ca3af" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Rechercher un médecin..."
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity
            style={styles.clearButton}
            onPress={() => setSearchQuery('')}
          >
            <Ionicons name="close-circle" size={20} color="#9ca3af" />
          </TouchableOpacity>
        )}
      </View>

      {/* Liste des médecins */}
      {filteredDoctors.length === 0 ? (
        <View style={styles.emptyState}>
          <Ionicons name="people-outline" size={64} color="#9ca3af" />
          <Text style={styles.emptyStateTitle}>
            {searchQuery ? 'Aucun médecin trouvé' : 'Aucun médecin connecté'}
          </Text>
          <Text style={styles.emptyStateText}>
            {searchQuery 
              ? 'Essayez avec un autre terme de recherche'
              : 'Vous n\'avez pas encore de médecins connectés.\nPartagez vos dossiers pour commencer.'
            }
          </Text>
        </View>
      ) : (
        <FlatList
          data={filteredDoctors}
          renderItem={renderDoctorItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContainer}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              colors={['#3b82f6']}
              tintColor="#3b82f6"
            />
          }
          showsVerticalScrollIndicator={false}
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
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  backButton: {
    marginRight: 16,
  },
  headerContent: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#111827',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 2,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    marginHorizontal: 20,
    marginVertical: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  searchIcon: {
    marginRight: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#111827',
  },
  clearButton: {
    marginLeft: 12,
  },
  listContainer: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  doctorCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  doctorHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  doctorAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#3b82f6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  doctorAvatarText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
  },
  doctorInfo: {
    flex: 1,
  },
  doctorName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 2,
  },
  doctorSpecialty: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 6,
  },
  accessInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  accessBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    gap: 4,
  },
  accessBadgeText: {
    color: 'white',
    fontSize: 11,
    fontWeight: '500',
  },
  doctorActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#f3f4f6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  doctorFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#f3f4f6',
  },
  connectionInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  connectionDate: {
    fontSize: 12,
    color: '#9ca3af',
  },
  onlineIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  onlineDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#10b981',
  },
  onlineText: {
    fontSize: 12,
    color: '#10b981',
    fontWeight: '500',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
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
});

export default DoctorsScreen;