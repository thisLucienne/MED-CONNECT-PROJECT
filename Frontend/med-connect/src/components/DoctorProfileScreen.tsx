import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, StatusBar, SafeAreaView,} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface DoctorProfileScreenProps {
  onBack: () => void;
  onMessage: () => void;
  onCall: () => void;
}

const DoctorProfileScreen: React.FC<DoctorProfileScreenProps> = ({ 
  onBack,
  onMessage,
  onCall 
}) => {
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />

      {/* Header with background */}
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.moreButton}>
          <Ionicons name="ellipsis-vertical" size={24} color="white" />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Doctor Info */}
        <View style={styles.doctorSection}>
          <View style={styles.avatarContainer}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>SM</Text>
            </View>
            <View style={styles.verifiedBadge}>
              <Ionicons name="checkmark" size={16} color="white" />
            </View>
          </View>

          <Text style={styles.doctorName}>Dr. Sophia Martin</Text>
          <Text style={styles.doctorSpecialty}>Cardiologue Conventionnée</Text>

          <View style={styles.ratingContainer}>
            <Ionicons name="star" size={16} color="#f59e0b" />
            <Text style={styles.ratingText}>4.8</Text>
            <Ionicons name="star" size={16} color="#f59e0b" />
            <Ionicons name="star" size={16} color="#f59e0b" />
            <Ionicons name="star" size={16} color="#f59e0b" />
            <Ionicons name="star" size={16} color="#f59e0b" />
            <Text style={styles.reviewCount}>(127 avis patients)</Text>
          </View>

          <Text style={styles.availability}>Rendez-vous 24 heures</Text>

          {/* Action Buttons */}
          <View style={styles.actionButtons}>
            <TouchableOpacity style={styles.primaryButton} onPress={onMessage}>
              <Ionicons name="chatbubble" size={20} color="white" />
              <Text style={styles.primaryButtonText}>Envoyer un message</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.secondaryButton} onPress={onCall}>
              <Ionicons name="call" size={20} color="#3b82f6" />
              <Text style={styles.secondaryButtonText}>Contacter</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Informations */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Informations</Text>
          
          <View style={styles.infoCard}>
            <View style={styles.infoItem}>
              <View style={[styles.infoIcon, { backgroundColor: '#eff6ff' }]}>
                <Ionicons name="briefcase" size={20} color="#3b82f6" />
              </View>
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Cabinet médical</Text>
                <Text style={styles.infoValue}>6, Avenue de la République</Text>
              </View>
            </View>

            <View style={styles.divider} />

            <View style={styles.infoItem}>
              <View style={[styles.infoIcon, { backgroundColor: '#fef3c7' }]}>
                <Ionicons name="call" size={20} color="#f59e0b" />
              </View>
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Coordonnées</Text>
                <Text style={styles.infoValue}>Tel: 01 02 03 04 05</Text>
                <TouchableOpacity>
                  <Text style={styles.linkText}>Appeler</Text>
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.divider} />

            <View style={styles.infoItem}>
              <View style={[styles.infoIcon, { backgroundColor: '#f0fdf4' }]}>
                <Ionicons name="card" size={20} color="#10b981" />
              </View>
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Groupe sanguin</Text>
                <Text style={styles.infoValue}>A+</Text>
              </View>
            </View>

            <View style={styles.divider} />

            <View style={styles.infoItem}>
              <View style={[styles.infoIcon, { backgroundColor: '#fef2f2' }]}>
                <Ionicons name="location" size={20} color="#ef4444" />
              </View>
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Adresse</Text>
                <Text style={styles.infoValue}>123 Rue de la Santé, 75014 Paris</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Horaires */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Horaires d'ouverture</Text>
          
          <View style={styles.infoCard}>
            <View style={styles.scheduleItem}>
              <Text style={styles.scheduleDay}>Lundi - Vendredi</Text>
              <Text style={styles.scheduleTime}>09:00 - 18:00</Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.scheduleItem}>
              <Text style={styles.scheduleDay}>Samedi</Text>
              <Text style={styles.scheduleTime}>09:00 - 13:00</Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.scheduleItem}>
              <Text style={styles.scheduleDay}>Dimanche</Text>
              <Text style={[styles.scheduleTime, { color: '#ef4444' }]}>Fermé</Text>
            </View>
          </View>
        </View>

        {/* Spécialités */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Spécialités</Text>
          
          <View style={styles.tagsContainer}>
            <View style={styles.tag}>
              <Text style={styles.tagText}>Cardiologie</Text>
            </View>
            <View style={styles.tag}>
              <Text style={styles.tagText}>Échocardiographie</Text>
            </View>
            <View style={styles.tag}>
              <Text style={styles.tagText}>Électrocardiogramme</Text>
            </View>
            <View style={styles.tag}>
              <Text style={styles.tagText}>Hypertension</Text>
            </View>
          </View>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
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
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: '#3b82f6',
  },
  backButton: {
    padding: 8,
  },
  moreButton: {
    padding: 8,
  },
  doctorSection: {
    backgroundColor: '#3b82f6',
    paddingHorizontal: 24,
    paddingBottom: 32,
    alignItems: 'center',
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: 16,
  },
  avatar: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 4,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  avatarText: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#3b82f6',
  },
  verifiedBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#10b981',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#3b82f6',
  },
  doctorName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 4,
  },
  doctorSpecialty: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.9)',
    marginBottom: 12,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  ratingText: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
    marginHorizontal: 8,
  },
  reviewCount: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    marginLeft: 8,
  },
  availability: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.9)',
    marginBottom: 24,
  },
  actionButtons: {
    width: '100%',
    gap: 12,
  },
  primaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#1e40af',
    paddingVertical: 14,
    borderRadius: 12,
    gap: 8,
  },
  primaryButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
  },
  secondaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'white',
    paddingVertical: 14,
    borderRadius: 12,
    gap: 8,
  },
  secondaryButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#3b82f6',
  },
  section: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 12,
  },
  infoCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  infoIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  infoContent: {
    flex: 1,
  },
  infoLabel: {
    fontSize: 12,
    color: '#6b7280',
    marginBottom: 4,
  },
  infoValue: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1f2937',
  },
  linkText: {
    fontSize: 14,
    color: '#3b82f6',
    fontWeight: '500',
    marginTop: 4,
  },
  divider: {
    height: 1,
    backgroundColor: '#f3f4f6',
    marginVertical: 12,
  },
  scheduleItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  scheduleDay: {
    fontSize: 14,
    color: '#6b7280',
  },
  scheduleTime: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1f2937',
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  tag: {
    backgroundColor: '#eff6ff',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#bfdbfe',
  },
  tagText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#1e40af',
  },
});

export default DoctorProfileScreen;