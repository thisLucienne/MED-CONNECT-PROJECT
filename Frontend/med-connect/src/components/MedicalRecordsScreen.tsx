import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, FlatList, StatusBar, SafeAreaView, Alert, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import medicalRecordsService, { MedicalRecord } from '../services/medicalRecordsService';
import { useAuth } from '../context/AuthContext';

interface MedicalRecordsScreenProps {
  onBack: () => void;
  onUploadDocument: () => void;
  onOpenRecord: (dossierId: string) => void;
  onNavigateToMessages?: () => void;
  onNavigateToFindDoctor?: () => void;
  onNavigateToProfile?: () => void;
}

interface MedicalRecord {
  id: string;
  titre: string;
  type: 'CONSULTATION' | 'URGENCE' | 'SUIVI';
  statut: 'OUVERT' | 'FERME' | 'EN_COURS';
  dateCreation: string;
  dateMiseAJour: string;
  description?: string;
}

// Fonction pour mapper les types aux icônes et couleurs
const getRecordStyle = (type: string) => {
  switch (type) {
    case 'CONSULTATION':
      return { icon: 'document-text', color: '#3b82f6' };
    case 'URGENCE':
      return { icon: 'warning', color: '#ef4444' };
    case 'SUIVI':
      return { icon: 'heart', color: '#10b981' };
    default:
      return { icon: 'document', color: '#6b7280' };
  }
};

// Fonction pour formater les dates
const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });
};

const MedicalRecordsScreen: React.FC<MedicalRecordsScreenProps> = ({ 
  onBack, 
  onUploadDocument,
  onOpenRecord,
  onNavigateToMessages,
  onNavigateToFindDoctor,
  onNavigateToProfile
}) => {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('all');
  const [records, setRecords] = useState<MedicalRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [totalRecords, setTotalRecords] = useState(0);

  // Charger les dossiers médicaux
  const loadMedicalRecords = async (showLoader = true) => {
    try {
      if (showLoader) setLoading(true);
      
      const response = await medicalRecordsService.getMedicalRecords(1, 50);
      setRecords(response.data.dossiers);
      setTotalRecords(response.data.total);
    } catch (error: any) {
      // Si c'est une erreur d'authentification, afficher un message spécifique
      if (error.message.includes('Token') || error.message.includes('authentification')) {
        Alert.alert(
          'Authentification requise', 
          'Veuillez vous reconnecter pour accéder à vos dossiers médicaux.',
          [
            { text: 'OK', onPress: () => onBack() }
          ]
        );
      } else {
        Alert.alert('Erreur', error.message);
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Charger les données au montage du composant
  useEffect(() => {
    loadMedicalRecords();
  }, []);

  // Rafraîchir les données
  const handleRefresh = () => {
    setRefreshing(true);
    loadMedicalRecords(false);
  };

  // Filtrer les dossiers selon le type sélectionné
  const filteredRecords = records.filter(record => {
    const matchesSearch = record.titre.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = activeFilter === 'all' || record.type === activeFilter.toUpperCase();
    return matchesSearch && matchesFilter;
  });

  // Compter les dossiers par type
  const getFilterCounts = () => {
    const counts = {
      all: records.length,
      consultation: records.filter(r => r.type === 'CONSULTATION').length,
      urgence: records.filter(r => r.type === 'URGENCE').length,
      suivi: records.filter(r => r.type === 'SUIVI').length,
    };
    return counts;
  };

  const filterCounts = getFilterCounts();

  const filters = [
    { id: 'all', label: 'Tous', count: filterCounts.all },
    { id: 'consultation', label: 'Consultation', count: filterCounts.consultation },
    { id: 'urgence', label: 'Urgence', count: filterCounts.urgence },
    { id: 'suivi', label: 'Suivi', count: filterCounts.suivi },
  ];

  const renderRecord = ({ item }: { item: MedicalRecord }) => {
    const style = getRecordStyle(item.type);
    
    return (
      <TouchableOpacity 
        style={styles.recordCard}
        onPress={() => onOpenRecord(item.id)}
      >
        <View style={[styles.recordIcon, { backgroundColor: style.color + '20' }]}>
          <Ionicons name={style.icon as any} size={24} color={style.color} />
        </View>
        
        <View style={styles.recordContent}>
          <Text style={styles.recordTitle}>{item.titre}</Text>
          <Text style={styles.recordDoctor}>Type: {item.type}</Text>
          <Text style={styles.recordDate}>{formatDate(item.dateCreation)}</Text>
          <View style={[styles.statusBadge, { backgroundColor: item.statut === 'OUVERT' ? '#10b981' : '#6b7280' }]}>
            <Text style={styles.statusText}>{item.statut}</Text>
          </View>
        </View>

        <TouchableOpacity style={styles.recordMenu}>
          <Ionicons name="ellipsis-vertical" size={20} color="#9ca3af" />
        </TouchableOpacity>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />

      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <TouchableOpacity onPress={onBack} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#1f2937" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Dossiers médicaux</Text>
          <TouchableOpacity style={styles.moreButton}>
            <Ionicons name="ellipsis-vertical" size={24} color="#1f2937" />
          </TouchableOpacity>
        </View>

        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <Ionicons name="search" size={20} color="#9ca3af" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Rechercher"
            placeholderTextColor="#9ca3af"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>

        {/* Filters */}
        <View style={styles.filtersContainer}>
          <FlatList
            horizontal
            data={filters}
            keyExtractor={(item) => item.id}
            showsHorizontalScrollIndicator={false}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={[
                  styles.filterChip,
                  activeFilter === item.id && styles.filterChipActive,
                ]}
                onPress={() => setActiveFilter(item.id)}
              >
                <Text
                  style={[
                    styles.filterChipText,
                    activeFilter === item.id && styles.filterChipTextActive,
                  ]}
                >
                  {item.label}
                </Text>
                {item.count > 0 && (
                  <View
                    style={[
                      styles.filterBadge,
                      activeFilter === item.id && styles.filterBadgeActive,
                    ]}
                  >
                    <Text
                      style={[
                        styles.filterBadgeText,
                        activeFilter === item.id && styles.filterBadgeTextActive,
                      ]}
                    >
                      {item.count}
                    </Text>
                  </View>
                )}
              </TouchableOpacity>
            )}
          />
        </View>
      </View>

      {/* Records List */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#3b82f6" />
          <Text style={styles.loadingText}>Chargement des dossiers...</Text>
        </View>
      ) : filteredRecords.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="document-outline" size={64} color="#9ca3af" />
          <Text style={styles.emptyTitle}>Aucun dossier médical</Text>
          <Text style={styles.emptyText}>
            {records.length === 0 
              ? "Vous n'avez pas encore de dossier médical. Créez-en un pour commencer."
              : "Aucun dossier ne correspond à votre recherche."
            }
          </Text>
        </View>
      ) : (
        <>
          <Text style={styles.sectionTitle}>
            {filteredRecords.length} dossier{filteredRecords.length > 1 ? 's' : ''} trouvé{filteredRecords.length > 1 ? 's' : ''}
          </Text>
          
          <FlatList
            data={filteredRecords}
            renderItem={renderRecord}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
            refreshing={refreshing}
            onRefresh={handleRefresh}
          />
        </>
      )}

      {/* FAB */}
      <TouchableOpacity style={styles.fab} onPress={onUploadDocument}>
        <Ionicons name="add" size={28} color="white" />
      </TouchableOpacity>

      {/* Bottom Navigation */}
      <View style={styles.bottomNav}>
        <TouchableOpacity style={styles.navItem} onPress={onBack}>
          <Ionicons name="home" size={24} color="#9ca3af" />
          <Text style={styles.navText}>Accueil</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.navItem}>
          <View>
            <Ionicons name="document-text" size={24} color="#3b82f6" />
            <View style={styles.navBadge}>
              <Text style={styles.navBadgeText}>{totalRecords}</Text>
            </View>
          </View>
          <Text style={[styles.navText, styles.navTextActive]}>Dossiers</Text>
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

        <TouchableOpacity style={styles.navItem} onPress={onNavigateToFindDoctor}>
          <Ionicons name="people" size={32} color="#14b8a6" />
          <Text style={styles.navText}>Médecins</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.navItem} onPress={onNavigateToProfile}>
          <Ionicons name="person-outline" size={24} color="#9ca3af" />
          <Text style={styles.navText}>Profil</Text>
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
    backgroundColor: 'white',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  backButton: {
    padding: 8,
    marginRight: 8,
  },
  headerTitle: {
    flex: 1,
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  moreButton: {
    padding: 8,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f3f4f6',
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 44,
    marginBottom: 16,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#1f2937',
  },
  filtersContainer: {
    marginBottom: 8,
  },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#f3f4f6',
    marginRight: 8,
  },
  filterChipActive: {
    backgroundColor: '#3b82f6',
  },
  filterChipText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6b7280',
  },
  filterChipTextActive: {
    color: 'white',
  },
  filterBadge: {
    marginLeft: 8,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    backgroundColor: '#e5e7eb',
  },
  filterBadgeActive: {
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
  },
  filterBadgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6b7280',
  },
  filterBadgeTextActive: {
    color: 'white',
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6b7280',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 12,
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 100,
  },
  recordCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  recordIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  recordContent: {
    flex: 1,
  },
  recordTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 4,
  },
  recordDoctor: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 2,
  },
  recordDate: {
    fontSize: 12,
    color: '#9ca3af',
    marginBottom: 4,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  statusText: {
    color: 'white',
    fontSize: 10,
    fontWeight: '600',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 50,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#6b7280',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 50,
    paddingHorizontal: 32,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1f2937',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
    lineHeight: 20,
  },
  recordMenu: {
    padding: 8,
  },
  fab: {
    position: 'absolute',
    bottom: 90,
    right: 24,
    width: 56,
    height: 56,
    backgroundColor: '#3b82f6',
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
  navIconWrapper: {

  }
});

export default MedicalRecordsScreen;