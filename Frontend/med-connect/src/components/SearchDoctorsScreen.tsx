import React, { useState } from 'react';
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
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import doctorsService, { Doctor } from '../services/doctorsService';

interface SearchDoctorsScreenProps {
  onBack: () => void;
  onDoctorSelected: (doctor: Doctor) => void;
}

const SearchDoctorsScreen: React.FC<SearchDoctorsScreenProps> = ({
  onBack,
  onDoctorSelected,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Doctor[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  // Rechercher des médecins
  const searchDoctors = async (query: string) => {
    if (query.length < 2) {
      setSearchResults([]);
      setHasSearched(false);
      return;
    }

    try {
      setIsSearching(true);
      setHasSearched(true);
      const response = await doctorsService.searchDoctors(query);
      setSearchResults(response.data);
    } catch (error: any) {
      console.error('Erreur recherche médecins:', error);
      Alert.alert('Erreur', error.message);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  // Sélectionner un médecin
  const selectDoctor = (doctor: Doctor) => {
    Alert.alert(
      'Ajouter ce médecin',
      `Voulez-vous ajouter Dr. ${doctor.firstName} ${doctor.lastName} à votre liste de médecins ?`,
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Ajouter',
          onPress: () => onDoctorSelected(doctor),
        },
      ]
    );
  };

  const renderDoctorItem = ({ item }: { item: Doctor }) => (
    <TouchableOpacity
      style={styles.doctorCard}
      onPress={() => selectDoctor(item)}
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
          <Text style={styles.doctorSpecialty}>
            {item.specialty || 'Médecin généraliste'}
          </Text>
          {item.licenseNumber && (
            <Text style={styles.doctorLicense}>
              N° ordre: {item.licenseNumber}
            </Text>
          )}
        </View>

        <View style={styles.addButton}>
          <Ionicons name="add-circle" size={24} color="#10b981" />
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={onBack}>
          <Ionicons name="arrow-back" size={24} color="#374151" />
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>Rechercher un médecin</Text>
          <Text style={styles.headerSubtitle}>
            Trouvez et ajoutez des médecins à votre réseau
          </Text>
        </View>
      </View>

      {/* Barre de recherche */}
      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color="#9ca3af" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Nom, prénom ou spécialité..."
          value={searchQuery}
          onChangeText={(text) => {
            setSearchQuery(text);
            searchDoctors(text);
          }}
          autoFocus
        />
        {isSearching && (
          <ActivityIndicator size="small" color="#3b82f6" style={styles.searchLoader} />
        )}
        {searchQuery.length > 0 && (
          <TouchableOpacity
            style={styles.clearButton}
            onPress={() => {
              setSearchQuery('');
              setSearchResults([]);
              setHasSearched(false);
            }}
          >
            <Ionicons name="close-circle" size={20} color="#9ca3af" />
          </TouchableOpacity>
        )}
      </View>

      {/* Résultats de recherche */}
      <View style={styles.content}>
        {!hasSearched && (
          <View style={styles.initialState}>
            <Ionicons name="search-outline" size={64} color="#9ca3af" />
            <Text style={styles.initialStateTitle}>Rechercher des médecins</Text>
            <Text style={styles.initialStateText}>
              Tapez au moins 2 caractères pour commencer la recherche
            </Text>
          </View>
        )}

        {hasSearched && !isSearching && searchResults.length === 0 && (
          <View style={styles.emptyState}>
            <Ionicons name="people-outline" size={64} color="#9ca3af" />
            <Text style={styles.emptyStateTitle}>Aucun médecin trouvé</Text>
            <Text style={styles.emptyStateText}>
              Essayez avec un autre terme de recherche
            </Text>
          </View>
        )}

        {searchResults.length > 0 && (
          <>
            <Text style={styles.resultsTitle}>
              {searchResults.length} médecin{searchResults.length > 1 ? 's' : ''} trouvé{searchResults.length > 1 ? 's' : ''}
            </Text>
            <FlatList
              data={searchResults}
              renderItem={renderDoctorItem}
              keyExtractor={(item) => item.id}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.listContainer}
            />
          </>
        )}
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
  searchLoader: {
    marginLeft: 12,
  },
  clearButton: {
    marginLeft: 12,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  initialState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  initialStateTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#374151',
    marginTop: 16,
    textAlign: 'center',
  },
  initialStateText: {
    fontSize: 14,
    color: '#9ca3af',
    marginTop: 8,
    textAlign: 'center',
    lineHeight: 20,
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
  resultsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 16,
  },
  listContainer: {
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
  },
  doctorAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#3b82f6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
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
    marginBottom: 2,
  },
  doctorLicense: {
    fontSize: 12,
    color: '#9ca3af',
  },
  addButton: {
    padding: 8,
  },
});

export default SearchDoctorsScreen;