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
  RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import dashboardService from '../services/dashboardService';

interface ConnectedDoctorsScreenProps {
  onBack: () => void;
  onContactDoctor: (doctorId: string, doctorName: string) => void;
  onMessageDoctor: (doctorId: string, doctorName: string) => void;
  onShareWithDoctor: (doctorId: string, doctorName: string) => void;
}

interface ConnectedDoctor {
  id: string;
  firstName: string;
  lastName: string;
  profilePicture?: string;
  specialty?: string;
  licenseNumber?: string;
  dateAutorisation: string;
  typeAcces: 'LECTURE' | 'ECRITURE';
}

const ConnectedDoctorsScreen: React.FC<ConnectedDoctorsScreenProps> = ({
  onBack,
  onContactDoctor,
  onMessageDoctor,
  onShareWithDoctor,
}) => {
  const [doctors, setDoctors] = useState<ConnectedDoctor[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Charger les médecins connectés
  const loadConnectedDoctors = async (showLoader = true) => {
    try {
      if (showLoader) setLoading(true);
      
      const response = await dashboardService.getConnectedDoctors();
      setDoctors(response.data);
    } catch (error: any) {
      console.error('Erreur chargement médecins:', error);
      Alert.alert('Erreur', 'Impossible de charger la liste des médecins connectés');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadConnectedDoctors();
  }, []);

  const handleRefresh = () => {
    setRefreshing(true);
    loadConnectedDoctors(false);
  };

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  };

  const showDoctorActions = (doctor: ConnectedDoctor) => {
    const doctorName = `Dr. ${doctor.firstName} ${doctor.lastName}`;
    
    Alert.alert(
      doctorName,
      `Que souhaitez-vous faire avec ${doctorName} ?`,
      [
        {
          text: 'Contacter',
          onPress: () => onContactDoctor(doctor.id, doctorName),
        },
        {
          text: 'Envoyer un message',
          onPress: () => onMessageDoctor(doctor.id, doctorName),
        },
        {
          text: 'Partager un dossier',
          onPress: () => onShareWithDoctor(doctor.id, doctorName),
        },
        {
          text: 'Annuler',
          style: 'cancel',
        },
      ]
    );
  };

  const renderDoctorItem = ({ item }: { item: ConnectedDoctor }) => (
    <TouchableOpacity
      style={styles.doctorCard}
      onPress={() => showDoctorActions(item)}
      activeOpacity={0.7}
    >
      <View style={styles.doctorHeader}>
        <View style={styles.doctorAvatar}>
          {item.profilePicture ? (
            <Text style={styles.avatarText}>IMG</Text>
          ) : (
            <Text style={styles.avatarText}>
              {getInitials(item.firstName, item.lastName)}
            </Text>
          )}
        </View>
        
        <View style={styles.doctorInfo}>
          <Text style={styles.doctorName}>
            Dr. {item.firstName} {item.lastName}
          </Text>
          {item.specialty && (
            <Text style={styles.doctorSpecialty}>{item.specialty}</Text>
          )}
          {item.licenseNumber && (
            <Text style={styles.licenseNumber}>N° {item.licenseNumber}</Text>
          )}
        </View>

        <View style={styles.doctorActions}>
          <View style={[styles.accessBadge, 
            item.typeAcces === 'ECRITURE' ? styles.writeAccess : styles.readAccess
          ]}>
            <Ionicons 
              name={item.typeAcces === 'ECRITURE' ? 'create' : 'eye'} 
              size={12} 
              color="white" 
            />
            <Text style={styles.accessText}>
              {item.typeAcces === 'ECRITURE' ? 'Écriture' : 'Lecture'}
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
        </View>
      </View>

      <View style={styles.doctorFooter}>
        <View style={styles.connectionInfo}>
          <Ionicons name="time" size={14} color="#6b7280" />
          <Text style={styles.connectionDate}>
            Connecté depuis le {new Date(item.dateAutorisation).toLocaleDateString('fr-FR')}
          </Text>
        </View>
        
        <View style={styles.quickActions}>
          <TouchableOpacity
            style={[styles.quickActionButton, styles.messageButton]}
            onPress={() => onMessageDoctor(item.id, `Dr. ${item.firstName} ${item.lastName}`)}
          >
            <Ionicons name="chatbubble" size={16} color="#3b82f6" />
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.quickActionButton, styles.shareButton]}
            onPress={() => onShareWithDoctor(item.id, `Dr. ${item.firstName} ${item.lastName}`)}
          >
            <Ionicons name="share" size={16} color="#10b981" />
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.quickActionButton, styles.callButton]}
            onPress={() => onContactDoctor(item.id, `Dr. ${item.firstName} ${item.lastName}`)}
          >
            <Ionicons name="call" size={16} color="#f59e0b" />
          </TouchableOpacity>
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
            {doctors.length} médecin{doctors.length > 1 ? 's' : ''} connecté{doctors.length > 1 ? 's' : ''}
          </Text>
        </View>
      </View>

      {/* Liste des médecins */}
      {doctors.length === 0 ? (
        <View style={styles.emptyState}>
          <Ionicons name="people-outline" size={64} color="#9ca3af" />
          <Text style={styles.emptyStateTitle}>Aucun médecin connecté</Text>
          <Text style={styles.emptyStateText}>
            Vous n'avez encore partagé aucun dossier avec des médecins.
          </Text>
          <Text style={styles.emptyStateSubtext}>
            Partagez vos dossiers médicaux pour permettre aux médecins de vous suivre.
          </Text>
        </View>
      ) : (
        <FlatList
          data={doctors}
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
    justify