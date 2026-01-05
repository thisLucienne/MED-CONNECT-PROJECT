import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface LabResultsScreenProps {
  onBack: () => void;
  onNavigateHome: () => void;
  onNavigateToRecords: () => void;
  onNavigateToMessages: () => void;
  onNavigateToActivity: () => void;
  onNavigateToProfile: () => void;
}

interface LabResult {
  id: string;
  date: string;
  title: string;
  labName: string;
  items: {
    name: string;
    value: string;
    unit: string;
    reference: string;
    status: 'normal' | 'high' | 'low';
  }[];
}

const LabResultsScreen: React.FC<LabResultsScreenProps> = ({
  onBack,
  onNavigateHome,
  onNavigateToRecords,
  onNavigateToMessages,
  onNavigateToActivity,
  onNavigateToProfile,
}) => {
  const [activeFilter, setActiveFilter] = useState('all');

  const labResults: LabResult[] = [
    {
      id: '1',
      date: '28 décembre 2025',
      title: 'Bilan sanguin complet',
      labName: 'Laboratoire BioMed Yaoundé',
      items: [
        { name: 'Hémoglobine', value: '13.2', unit: 'g/dL', reference: '12-16', status: 'normal' },
        { name: 'Glucose à jeun', value: '110', unit: 'mg/dL', reference: '70-100', status: 'high' },
        { name: 'Cholestérol total', value: '185', unit: 'mg/dL', reference: '<200', status: 'normal' },
        { name: 'Créatinine', value: '1.3', unit: 'mg/dL', reference: '0.6-1.2', status: 'high' },
      ],
    },
    {
      id: '2',
      date: '15 novembre 2025',
      title: 'Bilan thyroïdien',
      labName: 'Laboratoire Central Douala',
      items: [
        { name: 'TSH', value: '4.2', unit: 'mUI/L', reference: '0.4-4.0', status: 'high' },
        { name: 'T4 libre', value: '1.1', unit: 'ng/dL', reference: '0.8-1.8', status: 'normal' },
        { name: 'T3 libre', value: '3.0', unit: 'pg/mL', reference: '2.3-4.2', status: 'normal' },
      ],
    },
  ];

  const filters = [
    { id: 'all', label: 'Tous' },
    { id: 'recent', label: 'Récents' },
    { id: 'abnormal', label: 'Anormaux' },
  ];

  const renderLabItem = ({ name, value, unit, reference, status }: any) => {
    const statusColor = status === 'normal' ? '#10b981' : status === 'high' ? '#f59e0b' : '#ef4444';
    const statusText = status === 'normal' ? 'Normal' : status === 'high' ? 'Élevé' : 'Bas';

    return (
      <View style={styles.labItem}>
        <View style={styles.labItemHeader}>
          <Text style={styles.labItemName}>{name}</Text>
          <View style={[styles.statusBadge, { backgroundColor: statusColor + '20' }]}>
            <Text style={[styles.statusText, { color: statusColor }]}>{statusText}</Text>
          </View>
        </View>
        <Text style={styles.labValue}>
          {value} {unit}
        </Text>
        <Text style={styles.labReference}>Référence : {reference}</Text>
      </View>
    );
  };

  const renderResult = ({ item }: { item: LabResult }) => (
    <View style={styles.resultCard}>
      <View style={styles.resultHeader}>
        <View>
          <Text style={styles.resultDate}>{item.date}</Text>
          <Text style={styles.resultTitle}>{item.title}</Text>
          <Text style={styles.labName}>{item.labName}</Text>
        </View>
        <TouchableOpacity>
          <Ionicons name="download-outline" size={24} color="#3b82f6" />
        </TouchableOpacity>
      </View>

      <View style={styles.itemsContainer}>
        {item.items.map((labItem, index) => (
          <View key={index}>{renderLabItem(labItem)}</View>
        ))}
      </View>

      <TouchableOpacity style={styles.viewMoreButton}>
        <Text style={styles.viewMoreText}>Voir le rapport complet (PDF)</Text>
        <Ionicons name="arrow-forward" size={16} color="#3b82f6" />
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#1f2937" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Résultats de laboratoire</Text>
        <View style={{ width: 40 }} />
      </View>

      {/* Filters */}
      <View style={styles.filtersContainer}>
        {filters.map((filter) => (
          <TouchableOpacity
            key={filter.id}
            style={[
              styles.filterChip,
              activeFilter === filter.id && styles.filterChipActive,
            ]}
            onPress={() => setActiveFilter(filter.id)}
          >
            <Text
              style={[
                styles.filterText,
                activeFilter === filter.id && styles.filterTextActive,
              ]}
            >
              {filter.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Liste des résultats */}
      <FlatList
        data={labResults}
        renderItem={renderResult}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />

      {/* Bottom Navigation */}
      <View style={styles.bottomNav}>
        <TouchableOpacity style={styles.navItem} onPress={onNavigateHome}>
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
            <View style={styles.navBadge}>
              <Text style={styles.navBadgeText}>3</Text>
            </View>
          </View>
          <Text style={styles.navText}>Messages</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.navItem} onPress={onNavigateToActivity}>
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
    backgroundColor: '#f9fafb',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1f2937',
    flex: 1,
    textAlign: 'center',
    marginRight: -40,
  },
  filtersContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
  },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#f3f4f6',
  },
  filterChipActive: {
    backgroundColor: '#3b82f6',
  },
  filterText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6b7280',
  },
  filterTextActive: {
    color: 'white',
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 100,
  },
  resultCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
  },
  resultHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  resultDate: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 4,
  },
  resultTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1f2937',
    marginBottom: 4,
  },
  labName: {
    fontSize: 13,
    color: '#9ca3af',
  },
  itemsContainer: {
    marginBottom: 16,
  },
  labItem: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  labItemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  labItemName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#374151',
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  labValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 4,
  },
  labReference: {
    fontSize: 13,
    color: '#9ca3af',
  },
  viewMoreButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    backgroundColor: '#f0f9ff',
    borderRadius: 12,
  },
  viewMoreText: {
    color: '#3b82f6',
    fontWeight: '600',
    marginRight: 8,
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

export default LabResultsScreen;