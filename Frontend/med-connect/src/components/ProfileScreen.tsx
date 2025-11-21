import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  StatusBar,
  SafeAreaView,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

interface ProfileScreenProps {
  onBack: () => void;
  onLogout: () => void;
}

const ProfileScreen: React.FC<ProfileScreenProps> = ({ onBack, onLogout }) => {
  const handleLogout = () => {
    Alert.alert(
      'Déconnexion',
      'Êtes-vous sûr de vouloir vous déconnecter ?',
      [
        { text: 'Annuler', style: 'cancel' },
        { text: 'Déconnexion', onPress: onLogout, style: 'destructive' },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />
      
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header avec gradient */}
        <LinearGradient colors={['#60a5fa', '#3b82f6']} style={styles.header}>
          <TouchableOpacity onPress={onBack} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="white" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.settingsButton}>
            <Ionicons name="settings-outline" size={24} color="white" />
          </TouchableOpacity>
        </LinearGradient>

        {/* Photo de profil */}
        <View style={styles.profileSection}>
          <View style={styles.avatarContainer}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>MD</Text>
            </View>
            <TouchableOpacity style={styles.cameraButton}>
              <Ionicons name="camera" size={16} color="white" />
            </TouchableOpacity>
          </View>

          <View style={styles.profileInfo}>
            <View style={styles.nameRow}>
              <Text style={styles.userName}>Marie Dubois</Text>
              <View style={styles.badge}>
                <Text style={styles.badgeText}>Mfé</Text>
              </View>
            </View>
            <Text style={styles.userId}>34 ans • ID: MD-3647</Text>
            <TouchableOpacity style={styles.editButton}>
              <Ionicons name="pencil" size={16} color="#3b82f6" />
              <Text style={styles.editButtonText}>Modifier le profil</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Statistiques */}
        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <Ionicons name="pulse" size={24} color="#3b82f6" />
            <Text style={styles.statValue}>12</Text>
            <Text style={styles.statLabel}>Visites</Text>
          </View>

          <View style={styles.statCard}>
            <Ionicons name="document-text" size={24} color="#10b981" />
            <Text style={styles.statValue}>8</Text>
            <Text style={styles.statLabel}>Rapports</Text>
          </View>

          <View style={styles.statCard}>
            <Ionicons name="heart" size={24} color="#ef4444" />
            <Text style={styles.statValue}>34 ans</Text>
            <Text style={styles.statLabel}>Âge</Text>
          </View>
        </View>

        {/* Informations personnelles */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Informations personnelles</Text>
          
          <View style={styles.card}>
            <TouchableOpacity style={styles.cardItem}>
              <View style={[styles.iconCircle, { backgroundColor: '#eff6ff' }]}>
                <Ionicons name="mail" size={20} color="#3b82f6" />
              </View>
              <View style={styles.cardItemContent}>
                <Text style={styles.cardItemLabel}>Email</Text>
                <Text style={styles.cardItemValue}>marie.dubois@email.com</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
            </TouchableOpacity>

            <View style={styles.divider} />

            <TouchableOpacity style={styles.cardItem}>
              <View style={[styles.iconCircle, { backgroundColor: '#f0fdf4' }]}>
                <Ionicons name="call" size={20} color="#10b981" />
              </View>
              <View style={styles.cardItemContent}>
                <Text style={styles.cardItemLabel}>Téléphone</Text>
                <Text style={styles.cardItemValue}>+33 1 23 45 67 89</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
            </TouchableOpacity>

            <View style={styles.divider} />

            <TouchableOpacity style={styles.cardItem}>
              <View style={[styles.iconCircle, { backgroundColor: '#f5f3ff' }]}>
                <Ionicons name="calendar" size={20} color="#8b5cf6" />
              </View>
              <View style={styles.cardItemContent}>
                <Text style={styles.cardItemLabel}>Date de naissance</Text>
                <Text style={styles.cardItemValue}>15 janvier 1991</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
            </TouchableOpacity>

            <View style={styles.divider} />

            <TouchableOpacity style={styles.cardItem}>
              <View style={[styles.iconCircle, { backgroundColor: '#fef2f2' }]}>
                <Ionicons name="people" size={20} color="#ef4444" />
              </View>
              <View style={styles.cardItemContent}>
                <Text style={styles.cardItemLabel}>Groupe sanguin</Text>
                <Text style={styles.cardItemValue}>A+</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
            </TouchableOpacity>

            <View style={styles.divider} />

            <TouchableOpacity style={styles.cardItem}>
              <View style={[styles.iconCircle, { backgroundColor: '#fff7ed' }]}>
                <Ionicons name="location" size={20} color="#f97316" />
              </View>
              <View style={styles.cardItemContent}>
                <Text style={styles.cardItemLabel}>Adresse</Text>
                <Text style={styles.cardItemValue}>123 Rue de la Santé, 75014 Paris</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Sécurité et confidentialité */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Sécurité et confidentialité</Text>
          
          <View style={styles.card}>
            <TouchableOpacity style={styles.cardItem}>
              <View style={[styles.iconCircle, { backgroundColor: '#eff6ff' }]}>
                <Ionicons name="lock-closed" size={20} color="#3b82f6" />
              </View>
              <View style={styles.cardItemContent}>
                <Text style={styles.cardItemValue}>Modifier le mot de passe</Text>
                <Text style={styles.cardItemLabel}>Dernière modification il y a 3 mois</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
            </TouchableOpacity>

            <View style={styles.divider} />

            <TouchableOpacity style={styles.cardItem}>
              <View style={[styles.iconCircle, { backgroundColor: '#f0fdf4' }]}>
                <Ionicons name="shield-checkmark" size={20} color="#10b981" />
              </View>
              <View style={styles.cardItemContent}>
                <Text style={styles.cardItemValue}>Authentification à deux facteurs</Text>
                <View style={styles.statusRow}>
                  <View style={styles.activeDot} />
                  <Text style={styles.activeText}>Activée</Text>
                </View>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
            </TouchableOpacity>

            <View style={styles.divider} />

            <TouchableOpacity style={styles.cardItem}>
              <View style={[styles.iconCircle, { backgroundColor: '#f5f3ff' }]}>
                <Ionicons name="notifications" size={20} color="#8b5cf6" />
              </View>
              <View style={styles.cardItemContent}>
                <Text style={styles.cardItemValue}>Notifications</Text>
                <Text style={styles.cardItemLabel}>Gérer les préférences de notification</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
            </TouchableOpacity>

            <View style={styles.divider} />

            <TouchableOpacity style={styles.cardItem}>
              <View style={[styles.iconCircle, { backgroundColor: '#f9fafb' }]}>
                <Ionicons name="document-text" size={20} color="#6b7280" />
              </View>
              <View style={styles.cardItemContent}>
                <Text style={styles.cardItemValue}>Données médicales</Text>
                <Text style={styles.cardItemLabel}>Gérer l'accès à vos données</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Bouton de déconnexion */}
        <View style={styles.section}>
          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
            <Text style={styles.logoutButtonText}>Se déconnecter</Text>
          </TouchableOpacity>
        </View>

        {/* Version */}
        <Text style={styles.version}>Med-Connect v2.1.0</Text>

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
    height: 150,
    paddingTop: 16,
    paddingHorizontal: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  settingsButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileSection: {
    alignItems: 'center',
    marginTop: -64,
    paddingHorizontal: 24,
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: 16,
  },
  avatar: {
    width: 128,
    height: 128,
    borderRadius: 64,
    backgroundColor: '#3b82f6',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 4,
    borderColor: 'white',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 8,
  },
  avatarText: {
    fontSize: 48,
    fontWeight: 'bold',
    color: 'white',
  },
  cameraButton: {
    position: 'absolute',
    bottom: 4,
    right: 4,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#3b82f6',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: 'white',
  },
  profileInfo: {
    alignItems: 'center',
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  badge: {
    backgroundColor: '#dbeafe',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#1e40af',
  },
  userId: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 12,
  },
  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  editButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#3b82f6',
  },
  statsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 24,
    gap: 12,
    marginTop: 24,
    marginBottom: 24,
  },
  statCard: {
    flex: 1,
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1f2937',
    marginTop: 8,
  },
  statLabel: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 4,
  },
  section: {
    paddingHorizontal: 24,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 12,
  },
  card: {
    backgroundColor: 'white',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  cardItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  cardItemContent: {
    flex: 1,
  },
  cardItemLabel: {
    fontSize: 12,
    color: '#6b7280',
    marginBottom: 2,
  },
  cardItemValue: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1f2937',
  },
  divider: {
    height: 1,
    backgroundColor: '#f3f4f6',
    marginLeft: 68,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 2,
  },
  activeDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#10b981',
  },
  activeText: {
    fontSize: 12,
    color: '#10b981',
  },
  logoutButton: {
    backgroundColor: '#fef2f2',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  logoutButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ef4444',
  },
  version: {
    fontSize: 12,
    color: '#9ca3af',
    textAlign: 'center',
  },
});

export default ProfileScreen;