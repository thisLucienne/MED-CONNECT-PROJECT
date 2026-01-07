import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  StatusBar,
  SafeAreaView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import medicalRecordsService, { MedicalRecord } from '../services/medicalRecordsService';
import { ConnectedDoctor } from '../services/doctorsService';

interface ShareRecordWithDoctorScreenProps {
  doctor: ConnectedDoctor;
  onBack: () => void;
  onSuccess: () => void;
}

const ShareRecordWithDoctorScreen: React.FC<ShareRecordWithDoctorScreenProps> = ({
  doctor,
  onBack,
  onSuccess,
}) => {
  const [records, setRecords] = useState<MedicalRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [sharing, setSharing] = useState<string | null>(null);

  // Charger les dossiers médicaux
  const loadMedicalRecords = async () => {
    try {
      setLoading(true);
      const response = await medicalRecordsService.getMedicalRecords(1, 50);
      setRecords(response.data.dossiers);
    } catch (error: any) {
      Alert.alert('Erreur', error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMedicalRecords();
  }, []);

  // Partager un dossier avec le médecin
  const shareRecord = async (recordId: string, recordTitle: string) => {
    Alert.alert(
      'Confirmer le partage',
      `Voulez-vous partager le dossier "${recordTitle}" avec Dr. ${doctor.firstName} ${doctor.lastName} ?`,
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Partager',
          onPress: async () => {
            try {
              setSharing(recordId);
              await medicalRecordsService.grantDoctorAccess(recordId, doctor.id, 'LECTURE');
              Alert.alert(
                'Succès',
                `Le dossier "${recordTitle}" a été partagé avec Dr. ${doctor.firstName} ${doctor.lastName}`,
                [{ text: 'OK', onPress: onSuccess }]
              );
            } catch (error: any) {
              Alert.alert('Erreur', error.message);
            } finally {
              setSharing(null);
            }
          },
        },
      ]
    );
  };

  const getRecordTypeIcon = (type: string) => {
    switch (type) {
      case 'CONSULTATION':
        return 'document-text';
      case 'URGENCE':
        return 'warning';
      case 'SUIVI':
        return 'heart';
      default:
        return 'document';
    }
  };

  const getRecordTypeColor = (type: string) => {
    switch (type) {
      case 'CONSULTATION':
        return '#3b82f6';
      case 'URGENCE':
        return '#ef4444';
      case 'SUIVI':
        return '#10b981';
      default:
        return '#6b7280';
    }
  };

  const renderRecordItem = ({ item }: { item: MedicalRecord }) => (
    <TouchableOpacity
      style={styles.recordCard}
      onPress={() => shareRecord(item.id, item.titre)}
      disabled={sharing === item.id}
    >
      <View style={styles.recordHeader}>
        <View style={[styles.recordIcon, { backgroundColor: getRecordTypeColor(item.type) }]}>
          <Ionicons name={getRecordTypeIcon(item.type)} size={20} color="white" />
        </View>
        
        <View style={styles.recordInfo}>
          <Text style={styles.recordTitle}>{item.titre}</Text>
          <Text style={styles.recordType}>{item.type}</Text>
          <Text style={styles.recordDate}>
            {new Date(item.dateCreation).toLocaleDateString('fr-FR')}
          </Text>
        </View>

        {sharing === item.id ? (
          <ActivityIndicator size="small" color="#3b82f6" />
        ) : (
          <View style={styles.shareButton}>
            <Ionicons name="share" size={20} color="#3b82f6" />
          </View>
        )}
      </View>

      {item.description && (
        <Text style={styles.recordDescription} numberOfLines={2}>
          {item.description}
        </Text>
      )}

      <View style={styles.recordFooter}>
        <View style={[styles.statusBadge, { 
          backgroundColor: item.statut === 'OUVERT' ? '#10b981' : '#6b7280' 
        }]}>
          <Text style={styles.statusText}>{item.statut}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#3b82f6" />
          <Text style={styles.loadingText}>Chargement des dossiers...</Text>
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
          <Text style={styles.headerTitle}>Partager un dossier</Text>
          <Text style={styles.headerSubtitle}>
            avec Dr. {doctor.firstName} {doctor.lastName}
          </Text>
        </View>
      </View>

      {/* Info du médecin */}
      <View style={styles.doctorInfo}>
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
          <View style={[styles.accessBadge, { 
            backgroundColor: doctor.typeAcces === 'ECRITURE' ? '#3b82f6' : '#10b981' 
          }]}>
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
      </View>

      {/* Liste des dossiers */}
      <View style={styles.content}>
        <Text style={styles.sectionTitle}>
          Sélectionnez un dossier à partager ({records.length})
        </Text>
        
        {records.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="document-outline" size={64} color="#9ca3af" />
            <Text style={styles.emptyStateTitle}>Aucun dossier disponible</Text>
            <Text style={styles.emptyStateText}>
              Vous n'avez pas encore de dossiers médicaux à partager.
            </Text>
          </View>
        ) : (
          <FlatList
            data={records}
            renderItem={renderRecordItem}
            keyExtractor={(item) => item.id}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.listContainer}
          />
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
  doctorInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    padding: 20,
    marginHorizontal: 20,
    marginVertical: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#e5e7eb',
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
  doctorDetails: {
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
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 16,
  },
  listContainer: {
    paddingBottom: 20,
  },
  recordCard: {
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
  recordHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  recordIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  recordInfo: {
    flex: 1,
  },
  recordTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 2,
  },
  recordType: {
    fontSize: 12,
    color: '#6b7280',
    textTransform: 'uppercase',
    fontWeight: '500',
    marginBottom: 2,
  },
  recordDate: {
    fontSize: 12,
    color: '#9ca3af',
  },
  shareButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#eff6ff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  recordDescription: {
    fontSize: 14,
    color: '#6b7280',
    lineHeight: 20,
    marginBottom: 12,
  },
  recordFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  statusText: {
    color: 'white',
    fontSize: 11,
    fontWeight: '500',
  },
  emptyState: {
    alignItems: 'center',
    padding: 40,
    backgroundColor: 'white',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#e5e7eb',
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

export default ShareRecordWithDoctorScreen;