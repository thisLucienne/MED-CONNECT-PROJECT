import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, FlatList, StatusBar, SafeAreaView,} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface MedicalRecordsScreenProps {
  onBack: () => void;
  onOpenRecord: (id: string) => void;
  onCreateDocument: () => void;
  onNavigateHome: () => void;
  onNavigateToMessages: () => void;
  onNavigateToProfile: () => void;
}

interface MedicalRecord {
  id: string;
  title: string;
  doctor: string;
  date: string;
  type: 'consultation' | 'ordonnance' | 'analyse' | 'imagerie' | 'vaccination';
  color: string;
  icon: string;
}

const MedicalRecordsScreen: React.FC<MedicalRecordsScreenProps> = ({ 
  onBack, 
  onOpenRecord,
  onCreateDocument,
  onNavigateHome,
  onNavigateToMessages,
  onNavigateToProfile
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('all');

  const records: MedicalRecord[] = [
    {
      id: '1',
      title: 'Résultats analyses sanguine',
      doctor: 'Dr Sophie Martin',
      date: '28 mars 2024',
      type: 'analyse',
      color: '#10b981',
      icon: 'flask',
    },
    {
      id: '2',
      title: 'IRM thoracique',
      doctor: 'Dr Jean Dupont',
      date: '15 mars 2024',
      type: 'imagerie',
      color: '#ec4899',
      icon: 'scan',
    },
    {
      id: '3',
      title: 'Ordonnance lévothyrox',
      doctor: 'Dr Claire Bernard',
      date: '8 mars 2024',
      type: 'ordonnance',
      color: '#8b5cf6',
      icon: 'medical',
    },
    {
      id: '4',
      title: 'Vaccin Grippe 19 Rappel',
      doctor: 'Dr Marie Leblanc',
      date: '1 mars 2024',
      type: 'vaccination',
      color: '#f59e0b',
      icon: 'bandage',
    },
    {
      id: '5',
      title: 'Bilan thyroïdien complet',
      doctor: 'Dr Sophie Martin',
      date: '22 février 2024',
      type: 'consultation',
      color: '#3b82f6',
      icon: 'document-text',
    },
  ];

  const filters = [
    { id: 'all', label: 'Tous', count: 127 },
    { id: 'consultation', label: 'Consultation', count: 45 },
    { id: 'ordonnance', label: 'Ordonnance', count: 32 },
    { id: 'imagerie', label: 'Imagerie', count: 18 },
  ];

  const renderRecord = ({ item }: { item: MedicalRecord }) => (
    <TouchableOpacity 
      style={styles.recordCard}
      onPress={() => onOpenRecord(item.id)}
    >
      <View style={[styles.recordIcon, { backgroundColor: item.color + '20' }]}>
        <Ionicons name={item.icon as any} size={24} color={item.color} />
      </View>
      
      <View style={styles.recordContent}>
        <Text style={styles.recordTitle}>{item.title}</Text>
        <Text style={styles.recordDoctor}>{item.doctor}</Text>
        <Text style={styles.recordDate}>{item.date}</Text>
      </View>

      <TouchableOpacity style={styles.recordMenu}>
        <Ionicons name="ellipsis-vertical" size={20} color="#9ca3af" />
      </TouchableOpacity>
    </TouchableOpacity>
  );

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
      <Text style={styles.sectionTitle}>Hier, 2025</Text>
      
      <FlatList
        data={records}
        renderItem={renderRecord}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />

      {/* FAB */}
      <TouchableOpacity style={styles.fab} onPress={onCreateDocument}>
        <Ionicons name="add" size={28} color="white" />
      </TouchableOpacity>

      {/* Bottom Navigation */}
      <View style={styles.bottomNav}>
        <TouchableOpacity style={styles.navItem} onPress={onNavigateHome}>
          <Ionicons name="home" size={24} color="#9ca3af" />
          <Text style={styles.navText}>Accueil</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.navItem}>
          <View>
            <Ionicons name="document-text" size={24} color="#3b82f6" />
            <View style={styles.navBadge}>
              <Text style={styles.navBadgeText}>5</Text>
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

        <TouchableOpacity style={styles.navItem}>
          <Ionicons name="calendar-outline" size={24} color="#9ca3af" />
          <Text style={styles.navText}>Agenda</Text>
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