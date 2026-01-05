import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  StatusBar,
  SafeAreaView,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface Doctor {
  id: string;
  name: string;
  specialty: string;
  location: string;
  rating: number;
  reviewCount: number;
  nextAvailable: string;
  avatar: string;
  phone: string;
}

interface MyDoctorsScreenProps {
  onBack: () => void;
  onNavigateToMessages: () => void;
  onNavigateToProfile: () => void;
  onNavigateToRecords: () => void;
  onNavigateToActivity: () => void;
  onDoctorPress: (doctorId: string) => void;
  onCallDoctor: (phone: string) => void;
  onMessageDoctor: (doctorId: string) => void;
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
}) => {
  // Données de démonstration
  const doctors: Doctor[] = [
    {
      id: '1',
      name: 'Dr. Sophie Martin',
      specialty: 'Médecin généraliste',
      location: 'Paris 15ème',
      rating: 4.8,
      reviewCount: 127,
      nextAvailable: 'Demain à 14h30',
      avatar: 'SM',
      phone: '+33 1 23 45 67 89',
    },
    {
      id: '2',
      name: 'Dr. Jean Dupont',
      specialty: 'Cardiologue',
      location: 'Paris 8ème',
      rating: 4.9,
      reviewCount: 203,
      nextAvailable: 'Lundi à 09h00',
      avatar: 'JD',
      phone: '+33 1 23 45 67 90',
    },
    {
      id: '3',
      name: 'Dr. Marie Laurent',
      specialty: 'Dermatologue',
      location: 'Paris 12ème',
      rating: 4.7,
      reviewCount: 89,
      nextAvailable: 'Mercredi à 16h00',
      avatar: 'ML',
      phone: '+33 1 23 45 67 91',
    },
    {
      id: '4',
      name: 'Dr. Thomas Bernard',
      specialty: 'Ophtalmologue',
      location: 'Paris 6ème',
      rating: 4.6,
      reviewCount: 156,
      nextAvailable: 'Vendredi à 11h15',
      avatar: 'TB',
      phone: '+33 1 23 45 67 92',
    },
    {
      id: '5',
      name: 'Dr. Claire Rousseau',
      specialty: 'Endocrinologue',
      location: 'Paris 10ème',
      rating: 4.9,
      reviewCount: 178,
      nextAvailable: 'Aujourd\'hui à 17h30',
      avatar: 'CR',
      phone: '+33 1 23 45 67 93',
    },
  ];

  const renderStars = (rating: number) => {
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

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={onBack}>
          <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        <View style={styles.headerTitleContainer}>
          <Text style={styles.headerTitle}>Mes médecins</Text>
          <Text style={styles.headerSubtitle}>{doctors.length} médecins</Text>
        </View>
        <TouchableOpacity style={styles.searchButton}>
          <Ionicons name="search" size={24} color="white" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Stats Cards */}
        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <Ionicons name="calendar" size={24} color="#3b82f6" />
            <Text style={styles.statNumber}>12</Text>
            <Text style={styles.statLabel}>Rendez-vous</Text>
          </View>
          <View style={styles.statCard}>
            <Ionicons name="time" size={24} color="#10b981" />
            <Text style={styles.statNumber}>1</Text>
            <Text style={styles.statLabel}>À venir</Text>
          </View>
          <View style={styles.statCard}>
            <Ionicons name="checkmark-circle" size={24} color="#8b5cf6" />
            <Text style={styles.statNumber}>11</Text>
            <Text style={styles.statLabel}>Complétés</Text>
          </View>
        </View>

        {/* Liste des médecins */}
        <View style={styles.doctorsSection}>
          <Text style={styles.sectionTitle}>Mes praticiens</Text>
          
          {doctors.map((doctor) => (
            <TouchableOpacity
              key={doctor.id}
              style={styles.doctorCard}
              onPress={() => onDoctorPress(doctor.id)}
              activeOpacity={0.7}
            >
              {/* Avatar et infos principales */}
              <View style={styles.doctorMainInfo}>
                <View style={styles.doctorAvatar}>
                  <Text style={styles.doctorAvatarText}>{doctor.avatar}</Text>
                </View>

                <View style={styles.doctorDetails}>
                  <Text style={styles.doctorName}>{doctor.name}</Text>
                  <Text style={styles.doctorSpecialty}>{doctor.specialty}</Text>
                  
                  {/* Note */}
                  <View style={styles.ratingContainer}>
                    <View style={styles.stars}>{renderStars(doctor.rating)}</View>
                    <Text style={styles.ratingText}>
                      {doctor.rating} ({doctor.reviewCount})
                    </Text>
                  </View>
                </View>
              </View>

              {/* Localisation */}
              <View style={styles.locationContainer}>
                <Ionicons name="location" size={14} color="#6b7280" />
                <Text style={styles.locationText}>{doctor.location}</Text>
              </View>

              {/* Prochaine disponibilité */}
              <View style={styles.availabilityContainer}>
                <Ionicons name="time" size={14} color="#10b981" />
                <Text style={styles.availabilityText}>
                  Prochain créneau : {doctor.nextAvailable}
                </Text>
              </View>

              {/* Boutons d'action */}
              <View style={styles.actionButtons}>
                <TouchableOpacity
                  style={[styles.actionButton, styles.callButton]}
                  onPress={() => onCallDoctor(doctor.phone)}
                >
                  <Ionicons name="call" size={18} color="#3b82f6" />
                  <Text style={styles.callButtonText}>Appeler</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.actionButton, styles.messageButton]}
                  onPress={() => onMessageDoctor(doctor.id)}
                >
                  <Ionicons name="chatbubble" size={18} color="white" />
                  <Text style={styles.messageButtonText}>Message</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.actionButton, styles.profileButton]}
                  onPress={() => onDoctorPress(doctor.id)}
                >
                  <Ionicons name="person" size={18} color="#6b7280" />
                </TouchableOpacity>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Bouton FAB - Ajouter un médecin */}
      <TouchableOpacity style={styles.fab}>
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