import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  StatusBar,
  SafeAreaView,
  Alert,
  ActivityIndicator,
  FlatList,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import medicalRecordsService from '../services/medicalRecordsService';

interface ShareMedicalRecordScreenProps {
  dossierId: string;
  dossierTitle: string;
  onBack: () => void;
  onSuccess: () => void;
}

interface Doctor {
  id: string;
  firstName: string;
  lastName: string;
  profilePicture?: string;
  specialty?: string;
}

interface DoctorAccess {
  id: string;
  typeAcces: 'LECTURE' | 'ECRITURE';
  dateAutorisation: string;
  medecin: Doctor;
}

const ShareMedicalRecordScreen: React.FC<ShareMedicalRecordScreenProps> = ({
  dossierId,
  dossierTitle,
  onBack,
  onSuccess,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Doctor[]>([]);
  const [currentAccess, setCurrentAccess] = useState<DoctorAccess[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Charger les accès actuels
  useEffect(() => {
    loadCurrentAccess();
  }, []);

  const loadCurrentAccess = async () => {
    try {
      setIsLoading(true);
      const response = await medicalRecordsService.getDoctorAccess(dossierId);
      setCurrentAccess(response.data);
    } catch (error) {
      console.error('Erreur chargement accès:', error);
      Alert.alert('Erreur', 'Impossible de charger les accès actuels');
    } finally {
      setIsLoading(false);
    }
  };

  // Rechercher des médecins
  const searchDoctors = async (query: string) => {
    if (query.length < 2) {
      setSearchResults([]);
      return;
    }

    try {
      setIsSearching(true);
      const response = await medicalRecordsService.searchDoctors(query);
      setSearchResults(response.data);
    } catch (error) {
      console.error('Erreur recherche médecins:', error);
      Alert.alert('Erreur', 'Impossible de rechercher les médecins');
    } finally {
      setIsSearching(false);
    }
  };

  // Donner accès à un médecin
  const grantAccess = async (doctorId: string, accessType: 'LECTURE' | 'ECRITURE' = 'LECTURE') => {
    try {
      await medicalRecordsService.grantDoctorAccess(dossierId, doctorId, accessType);
      Alert.alert('Succès', 'Accès accordé au médecin');
      setSearchQuery('');
      setSearchResults([]);
      loadCurrentAccess();
    } catch (error: any) {
      Alert.alert('Erreur', error.message || 'Impossible d\'accorder l\'accès');
    }
  };

  // Révoquer l'accès d'un médecin
  const revokeAccess = async (doctorId: string, doctorName: string) => {
    Alert.alert(
      'Confirmer',
      `Voulez-vous vraiment révoquer l'accès de ${doctorName} ?`,
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Révoquer',
          style: 'destructive',
          onPress: async () => {
            try {
              await medicalRecordsService.revokeDoctorAccess(dossierId, doctorId);
              Alert.alert('Succès', 'Accès révoqué');
              loadCurrentAccess();
            } catch (error: any) {
              Alert.alert('Erreur', error.message || 'Impossible de révoquer l\'accès');
            }
          },
        },
      ]
    );
  };

  const renderDoctorSearchResult = ({ item }: { item: Doctor }) => (
    <View style={styles.doctorItem}>
      <View style={styles.doctorInfo}>
        <View style={styles.doctorAvatar}>
          <Text style={styles.doctorAvatarText}>
            {item.firstName.charAt(0)}{item.lastName.charAt(0)}
          </Text>
        </View>
        <View style={styles.doctorDetails}>
          <Text style={styles.doctorName}>
            Dr. {item.firstName} {item.lastName}
          </Text>
          {item.specialty && (
            <Text style={styles.doctorSpecialty}>{item.specialty}</Text>
          )}
        </View>
      </View>
      <View style={styles.accessButtons}>
        <TouchableOpacity
          style={[styles.accessButton, styles.readButton]}
          onPress={() => grantAccess(item.id, 'LECTURE')}
        >
          <Ionicons name="eye" size={16} color="white" />
          <Text style={styles.accessButtonText}>Lecture</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.accessButton, styles.writeButton]}
          onPress={() => grantAccess(item.id, 'ECRITURE')}
        >
          <Ionicons name="create" size={16} color="white" />
          <Text style={styles.accessButtonText}>Écriture</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderCurrentAccess = ({ item }: { item: DoctorAccess }) => (
    <View style={styles.accessItem}>
      <View style={styles.doctorInfo}>
        <View style={styles.doctorAvatar}>
          <Text style={styles.doctorAvatarText}>
            {item.medecin.firstName.charAt(0)}{item.medecin.lastName.charAt(0)}
          </Text>
        </View>
        <View style={styles.doctorDetails}>
          <Text style={styles.doctorName}>
            Dr. {item.medecin.firstName} {item.medecin.lastName}
          </Text>
          <Text style={styles.accessType}>
            Accès: {item.typeAcces === 'LECTURE' ? 'Lecture seule' : 'Lecture et écriture'}
          </Text>
          <Text style={styles.accessDate}>
            Depuis le {new Date(item.dateAutorisation).toLocaleDateString('fr-FR')}
          </Text>
        </View>
      </View>
      <TouchableOpacity
        style={styles.revokeButton}
        onPress={() => revokeAccess(item.medecin.id, `${item.medecin.firstName} ${item.medecin.lastName}`)}
      >
        <Ionicons name="close-circle" size={24} color="#ef4444" />
      </TouchableOpacity>
    </View>
  );

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#3b82f6" />
          <Text style={styles.loadingText}>Chargement...</Text>
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
          <Text style={styles.headerTitle}>Partager le dossier</Text>
          <Text style={styles.headerSubtitle}>{dossierTitle}</Text>
        </View>
      </View>

      <ScrollView style={styles.content}>
        {/* Recherche de médecins */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Ajouter un médecin</Text>
          <View style={styles.searchContainer}>
            <Ionicons name="search" size={20} color="#9ca3af" style={styles.searchIcon} />
            <TextInput
              style={styles.searchInput}
              placeholder="Rechercher un médecin..."
              value={searchQuery}
              onChangeText={(text) => {
                setSearchQuery(text);
                searchDoctors(text);
              }}
            />
            {isSearching && (
              <ActivityIndicator size="small" color="#3b82f6" style={styles.searchLoader} />
            )}
          </View>

          {searchResults.length > 0 && (
            <View style={styles.searchResults}>
              <FlatList
                data={searchResults}
                renderItem={renderDoctorSearchResult}
                keyExtractor={(item) => item.id}
                scrollEnabled={false}
              />
            </View>
          )}
        </View>

        {/* Accès actuels */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            Médecins ayant accès ({currentAccess.length})
          </Text>
          
          {currentAccess.length === 0 ? (
            <View style={styles.emptyState}>
              <Ionicons name="people-outline" size={48} color="#9ca3af" />
              <Text style={styles.emptyStateText}>
                Aucun médecin n'a accès à ce dossier
              </Text>
              <Text style={styles.emptyStateSubtext}>
                Recherchez et ajoutez des médecins ci-dessus
              </Text>
            </View>
          ) : (
            <FlatList
              data={currentAccess}
              renderItem={renderCurrentAccess}
              keyExtractor={(item) => item.id}
              scrollEnabled={false}
            />
          )}
        </View>
      </ScrollView>
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
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 2,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 16,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
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
  searchLoader: {
    marginLeft: 12,
  },
  searchResults: {
    marginTop: 12,
    backgroundColor: 'white',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  doctorItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  doctorInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  doctorAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#3b82f6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  doctorAvatarText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  doctorDetails: {
    flex: 1,
  },
  doctorName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#111827',
  },
  doctorSpecialty: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 2,
  },
  accessButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  accessButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    gap: 4,
  },
  readButton: {
    backgroundColor: '#10b981',
  },
  writeButton: {
    backgroundColor: '#3b82f6',
  },
  accessButtonText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '500',
  },
  accessItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: 'white',
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  accessType: {
    fontSize: 14,
    color: '#3b82f6',
    fontWeight: '500',
    marginTop: 2,
  },
  accessDate: {
    fontSize: 12,
    color: '#9ca3af',
    marginTop: 2,
  },
  revokeButton: {
    padding: 8,
  },
  emptyState: {
    alignItems: 'center',
    padding: 32,
    backgroundColor: 'white',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  emptyStateText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#6b7280',
    marginTop: 16,
    textAlign: 'center',
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: '#9ca3af',
    marginTop: 8,
    textAlign: 'center',
  },
});

export default ShareMedicalRecordScreen;