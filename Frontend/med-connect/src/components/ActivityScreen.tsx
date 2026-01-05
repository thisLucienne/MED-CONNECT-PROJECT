import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, FlatList, StatusBar, SafeAreaView,} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface FindDoctorScreenProps {
  onBack: () => void;
  onSelectDoctor: (id: string) => void;
  onNavigateToMessages: () => void;
  onNavigateToProfile: () => void;
  onNavigateToRecords: () => void;
  onNavigateToActivity: () => void;
}

interface Doctor {
  id: string;
  name: string;
  specialty: string;
  rating: number;
  reviewCount: number;
  distance: string;
  address: string;
  available: boolean;
  initials: string;
  color: string;
}

const FindDoctorScreen: React.FC<FindDoctorScreenProps> = ({ 
  onBack, 
  onSelectDoctor,
  onNavigateToMessages,
  onNavigateToProfile,
  onNavigateToRecords,
  onNavigateToActivity,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('tous');

  const doctors: Doctor[] = [
    {
      id: '1',
      name: 'Dr. Sophia Martin',
      specialty: 'Cardiologue',
      rating: 4.8,
      reviewCount: 127,
      distance: '0.8 km',
      address: 'Paris 15e',
      available: true,
      initials: 'SM',
      color: '#3b82f6',
    },
    {
      id: '2',
      name: 'Dr. Jean Dupont',
      specialty: 'Généraliste',
      rating: 4.6,
      reviewCount: 89,
      distance: '1.5 km',
      address: 'Paris 16e',
      available: false,
      initials: 'JD',
      color: '#10b981',
    },
    {
      id: '3',
      name: 'Dr. Claire Bernard',
      specialty: 'Dermatologue',
      rating: 4.9,
      reviewCount: 203,
      distance: '2.3 km',
      address: 'Paris 8e',
      available: true,
      initials: 'CB',
      color: '#8b5cf6',
    },
  ];

  const filters = [
    { id: 'tous', label: 'Tous' },
    { id: 'generaliste', label: 'Généraliste' },
    { id: 'specialiste', label: 'Spécialiste' },
    { id: 'disponible', label: 'Disponible' },
  ];

  const renderDoctor = ({ item }: { item: Doctor }) => (
    <TouchableOpacity 
      style={styles.doctorCard}
      onPress={() => onSelectDoctor(item.id)}
    >
      <View style={[styles.doctorAvatar, { backgroundColor: item.color }]}>
        <Text style={styles.doctorInitials}>{item.initials}</Text>
        {item.available && (
          <View style={styles.onlineBadge}>
            <View style={styles.onlineDot} />
          </View>
        )}
      </View>

      <View style={styles.doctorInfo}>
        <View style={styles.doctorHeader}>
          <Text style={styles.doctorName}>{item.name}</Text>
          {item.available && (
            <View style={styles.availableBadge}>
              <Text style={styles.availableBadgeText}>Disponible</Text>
            </View>
          )}
        </View>

        <Text style={styles.doctorSpecialty}>{item.specialty}</Text>

        <View style={styles.doctorStats}>
          <View style={styles.ratingContainer}>
            <Ionicons name="star" size={14} color="#f59e0b" />
            <Text style={styles.ratingText}>{item.rating}</Text>
            <Text style={styles.reviewCount}>({item.reviewCount} avis)</Text>
          </View>
          <View style={styles.locationContainer}>
            <Ionicons name="location" size={14} color="#6b7280" />
            <Text style={styles.locationText}>{item.distance} • {item.address}</Text>
          </View>
        </View>

        <TouchableOpacity 
          style={styles.contactButton}
          onPress={() => onSelectDoctor(item.id)}
        >
          <Text style={styles.contactButtonText}>Voir profil</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Trouver un médecin</Text>
        <TouchableOpacity style={styles.filterButton}>
          <Ionicons name="options" size={24} color="white" />
        </TouchableOpacity>
      </View>

      {/* Search Bar */}
      <View style={styles.searchSection}>
        <View style={styles.searchContainer}>
          <Ionicons name="search" size={20} color="#9ca3af" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Nom, spécialité, ville..."
            placeholderTextColor="#9ca3af"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          <TouchableOpacity style={styles.locationButton}>
            <Ionicons name="location" size={20} color="#3b82f6" />
          </TouchableOpacity>
        </View>

        {/* Quick Filters */}
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
              </TouchableOpacity>
            )}
          />
        </View>
      </View>

      {/* Doctors List */}
      <FlatList
        data={doctors}
        renderItem={renderDoctor}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />

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
    backgroundColor: '#f9fafb',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: '#3b82f6',
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    flex: 1,
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
    marginLeft: 8,
  },
  filterButton: {
    padding: 8,
  },
  searchSection: {
    backgroundColor: '#3b82f6',
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 48,
    marginBottom: 12,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#1f2937',
  },
  locationButton: {
    padding: 4,
  },
  filtersContainer: {
    marginBottom: 4,
  },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    marginRight: 8,
  },
  filterChipActive: {
    backgroundColor: 'white',
  },
  filterChipText: {
    fontSize: 14,
    fontWeight: '500',
    color: 'white',
  },
  filterChipTextActive: {
    color: '#3b82f6',
  },
  listContent: {
    padding: 16,
    paddingBottom: 100,
  },
  doctorCard: {
    flexDirection: 'row',
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  doctorAvatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
    position: 'relative',
  },
  doctorInitials: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
  },
  onlineBadge: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
  },
  onlineDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#10b981',
  },
  doctorInfo: {
    flex: 1,
  },
  doctorHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  doctorName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    flex: 1,
  },
  availableBadge: {
    backgroundColor: '#d1fae5',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
  },
  availableBadgeText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#065f46',
  },
  doctorSpecialty: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 8,
  },
  doctorStats: {
    marginBottom: 12,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  ratingText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1f2937',
    marginLeft: 4,
  },
  reviewCount: {
    fontSize: 12,
    color: '#6b7280',
    marginLeft: 4,
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  locationText: {
    fontSize: 12,
    color: '#6b7280',
    marginLeft: 4,
  },
  contactButton: {
    backgroundColor: '#3b82f6',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  contactButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: 'white',
  },
  // Bottom Navigation Styles
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

export default FindDoctorScreen;