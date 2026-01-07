import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, FlatList, StatusBar, ActivityIndicator, Alert, RefreshControl, Modal } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import messageService, { Conversation, Doctor } from '../services/messageService';

interface MessagingListProps {
  onSelectConversation: (conversation: Conversation) => void;
  onBack: () => void;
  onNavigateToProfiles: () => void;
  onNavigateToRecords: () => void;
  onNavigateToActivity: () => void;
}

const MessagingList: React.FC<MessagingListProps> = ({ 
  onSelectConversation, 
  onBack, 
  onNavigateToProfiles, 
  onNavigateToRecords, 
  onNavigateToActivity 
}) => {
  const [activeTab, setActiveTab] = useState('tous');
  const [searchQuery, setSearchQuery] = useState('');
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  
  // États pour le modal de nouvelle conversation
  const [showNewConversationModal, setShowNewConversationModal] = useState(false);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [doctorSearchQuery, setDoctorSearchQuery] = useState('');
  const [loadingDoctors, setLoadingDoctors] = useState(false);

  // Charger les conversations
  const loadConversations = async (showLoader = true) => {
    try {
      if (showLoader) setLoading(true);
      
      console.log('🔄 Chargement des conversations...');
      const response = await messageService.getConversations();
      console.log('✅ Conversations chargées:', response.data.length);
      setConversations(response.data);
    } catch (error: any) {
      console.error('❌ Erreur chargement conversations:', error);
      Alert.alert('Erreur', 'Erreur lors du chargement des conversations: ' + error.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Charger les données au montage du composant
  useEffect(() => {
    loadConversations();
  }, []);

  // Rafraîchir les données
  const handleRefresh = () => {
    setRefreshing(true);
    loadConversations(false);
  };

  // Rechercher des médecins
  const searchDoctors = async (query: string = '') => {
    try {
      setLoadingDoctors(true);
      console.log('🔍 Recherche de médecins:', query);
      
      const response = await messageService.searchDoctors(undefined, query);
      console.log('👨‍⚕️ Médecins trouvés:', response.data.length);
      setDoctors(response.data);
    } catch (error: any) {
      console.error('❌ Erreur recherche médecins:', error);
      Alert.alert('Erreur', 'Erreur lors de la recherche de médecins: ' + error.message);
    } finally {
      setLoadingDoctors(false);
    }
  };

  // Ouvrir le modal de nouvelle conversation
  const handleNewConversation = () => {
    setShowNewConversationModal(true);
    searchDoctors(); // Charger la liste des médecins
  };

  // Fermer le modal
  const closeNewConversationModal = () => {
    setShowNewConversationModal(false);
    setDoctorSearchQuery('');
    setDoctors([]);
  };

  // Commencer une conversation avec un médecin
  const startConversationWithDoctor = async (doctor: Doctor) => {
    try {
      // Créer une conversation factice pour l'interface
      const newConversation: Conversation = {
        id: `conv_new_${doctor.id}`,
        participantId: doctor.id,
        participantName: `${doctor.prenom} ${doctor.nom}`,
        participantType: 'doctor',
        lastMessage: 'Nouvelle conversation',
        lastMessageTime: new Date().toISOString(),
        unreadCount: 0,
        isActive: true
      };

      closeNewConversationModal();
      onSelectConversation(newConversation);
    } catch (error: any) {
      console.error('❌ Erreur création conversation:', error);
      Alert.alert('Erreur', 'Erreur lors de la création de la conversation');
    }
  };

  // Filtrer les conversations selon l'onglet actif et la recherche
  const filteredConversations = conversations.filter(conversation => {
    // Filtre par recherche
    if (searchQuery) {
      const searchLower = searchQuery.toLowerCase();
      const matchesName = conversation.participantName.toLowerCase().includes(searchLower);
      const matchesMessage = conversation.lastMessage.toLowerCase().includes(searchLower);
      if (!matchesName && !matchesMessage) return false;
    }

    // Filtre par onglet
    switch (activeTab) {
      case 'medecins':
        return conversation.participantType === 'doctor';
      case 'archives':
        return !conversation.isActive;
      default:
        return conversation.isActive;
    }
  });

  // Formater le temps
  const formatTime = (timestamp: string) => {
    const now = new Date();
    const messageTime = new Date(timestamp);
    const diffInMinutes = Math.floor((now.getTime() - messageTime.getTime()) / (1000 * 60));

    if (diffInMinutes < 1) return 'maintenant';
    if (diffInMinutes < 60) return `${diffInMinutes}m`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h`;
    return `${Math.floor(diffInMinutes / 1440)}j`;
  };

  const renderConversation = ({ item }: { item: Conversation }) => {
    const initials = item.participantName
      .split(' ')
      .map(name => name.charAt(0))
      .join('')
      .toUpperCase()
      .substring(0, 2);

    return (
      <TouchableOpacity
        style={[styles.messageItem, item.unreadCount > 0 && styles.messageItemUnread]}
        onPress={() => onSelectConversation(item)}
      >
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{initials}</Text>
          {item.participantType === 'doctor' && (
            <View style={styles.verifiedBadge}>
              <Ionicons name="checkmark" size={10} color="white" />
            </View>
          )}
        </View>

        <View style={styles.messageContent}>
          <View style={styles.messageHeader}>
            <View style={styles.messageTitleRow}>
              <Text style={[styles.doctorName, item.unreadCount > 0 && styles.doctorNameUnread]}>
                {item.participantType === 'doctor' ? `Dr. ${item.participantName}` : item.participantName}
              </Text>
              {item.unreadCount > 0 && <View style={styles.unreadDot} />}
            </View>
            <Text style={styles.messageTime}>{formatTime(item.lastMessageTime)}</Text>
          </View>

          <Text style={styles.specialty}>
            {item.participantType === 'doctor' ? 'Médecin' : 'Patient'}
          </Text>

          <View style={styles.messagePreviewRow}>
            <Text
              style={[styles.messagePreview, item.unreadCount > 0 && styles.messagePreviewUnread]}
              numberOfLines={1}
            >
              {item.lastMessage}
            </Text>
            {item.unreadCount > 0 && (
              <View style={styles.unreadBadge}>
                <Text style={styles.unreadBadgeText}>{item.unreadCount}</Text>
              </View>
            )}
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#3b82f6" />
          <Text style={styles.loadingText}>Chargement des conversations...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />

      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <TouchableOpacity onPress={onBack} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#1f2937" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Messages</Text>
          <TouchableOpacity style={styles.moreButton}>
            <Ionicons name="ellipsis-vertical" size={24} color="#1f2937" />
          </TouchableOpacity>
        </View>

        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <Ionicons name="search" size={20} color="#9ca3af" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Rechercher des messages..."
            placeholderTextColor="#9ca3af"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          <TouchableOpacity>
            <Ionicons name="options" size={20} color="#9ca3af" />
          </TouchableOpacity>
        </View>

        {/* Tabs */}
        <View style={styles.tabs}>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'tous' && styles.tabActive]}
            onPress={() => setActiveTab('tous')}
          >
            <Text style={[styles.tabText, activeTab === 'tous' && styles.tabTextActive]}>
              Tous
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tab, activeTab === 'medecins' && styles.tabActive]}
            onPress={() => setActiveTab('medecins')}
          >
            <Text style={[styles.tabText, activeTab === 'medecins' && styles.tabTextActive]}>
              Médecins
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tab, activeTab === 'archives' && styles.tabActive]}
            onPress={() => setActiveTab('archives')}
          >
            <Text style={[styles.tabText, activeTab === 'archives' && styles.tabTextActive]}>
              Archives
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Messages List */}
      <FlatList
        data={filteredConversations}
        renderItem={renderConversation}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.messagesList}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={['#3b82f6']}
            tintColor="#3b82f6"
          />
        }
        ListEmptyComponent={() => (
          <View style={styles.emptyState}>
            <Ionicons name="chatbubble-outline" size={64} color="#9ca3af" />
            <Text style={styles.emptyStateTitle}>Aucune conversation</Text>
            <Text style={styles.emptyStateText}>
              {searchQuery 
                ? `Aucune conversation trouvée pour "${searchQuery}"`
                : 'Vous n\'avez pas encore de conversations.\nCommencez par contacter un médecin.'}
            </Text>
          </View>
        )}
      />

      {/* FAB */}
      <TouchableOpacity style={styles.fab} onPress={handleNewConversation}>
        <Ionicons name="add" size={28} color="white" />
      </TouchableOpacity>

      {/* Modal Nouvelle Conversation */}
      <Modal
        visible={showNewConversationModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={closeNewConversationModal}
      >
        <SafeAreaView style={styles.modalContainer}>
          {/* Header du modal */}
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={closeNewConversationModal} style={styles.modalCloseButton}>
              <Ionicons name="close" size={24} color="#1f2937" />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Nouvelle conversation</Text>
            <View style={styles.modalPlaceholder} />
          </View>

          {/* Barre de recherche */}
          <View style={styles.modalSearchContainer}>
            <Ionicons name="search" size={20} color="#9ca3af" style={styles.searchIcon} />
            <TextInput
              style={styles.modalSearchInput}
              placeholder="Rechercher un médecin..."
              placeholderTextColor="#9ca3af"
              value={doctorSearchQuery}
              onChangeText={(text) => {
                setDoctorSearchQuery(text);
                searchDoctors(text);
              }}
            />
          </View>

          {/* Liste des médecins */}
          {loadingDoctors ? (
            <View style={styles.modalLoadingContainer}>
              <ActivityIndicator size="large" color="#3b82f6" />
              <Text style={styles.modalLoadingText}>Recherche de médecins...</Text>
            </View>
          ) : (
            <FlatList
              data={doctors}
              keyExtractor={(item) => item.id}
              contentContainerStyle={styles.modalDoctorsList}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.modalDoctorItem}
                  onPress={() => startConversationWithDoctor(item)}
                >
                  <View style={styles.modalDoctorAvatar}>
                    <Text style={styles.modalDoctorAvatarText}>
                      {`${item.prenom.charAt(0)}${item.nom.charAt(0)}`.toUpperCase()}
                    </Text>
                    <View style={styles.modalDoctorBadge}>
                      <Ionicons name="checkmark" size={10} color="white" />
                    </View>
                  </View>
                  
                  <View style={styles.modalDoctorInfo}>
                    <Text style={styles.modalDoctorName}>Dr. {item.prenom} {item.nom}</Text>
                    <Text style={styles.modalDoctorSpecialty}>{item.specialite}</Text>
                    {item.verified && (
                      <View style={styles.modalDoctorVerified}>
                        <Ionicons name="shield-checkmark" size={14} color="#10b981" />
                        <Text style={styles.modalDoctorVerifiedText}>Vérifié</Text>
                      </View>
                    )}
                  </View>

                  <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
                </TouchableOpacity>
              )}
              ItemSeparatorComponent={() => <View style={styles.modalSeparator} />}
              ListEmptyComponent={() => (
                <View style={styles.modalEmptyState}>
                  <Ionicons name="people-outline" size={64} color="#9ca3af" />
                  <Text style={styles.modalEmptyStateTitle}>Aucun médecin trouvé</Text>
                  <Text style={styles.modalEmptyStateText}>
                    {doctorSearchQuery 
                      ? `Aucun médecin trouvé pour "${doctorSearchQuery}"`
                      : 'Aucun médecin disponible pour le moment.'}
                  </Text>
                </View>
              )}
            />
          )}
        </SafeAreaView>
      </Modal>

      {/* Bottom Navigation */}
      <View style={styles.bottomNav}>
        <TouchableOpacity style={styles.navItem} onPress={onBack}>
          <Ionicons name="home-outline" size={24} color="#9ca3af" />
          <Text style={styles.navText}>Accueil</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.navItem} onPress={onNavigateToRecords}>
          <Ionicons name="document-text-outline" size={26} color="#9ca3af" />
          <Text style={styles.navText}>Dossiers</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.navItem}>
          <View>
            <Ionicons name="chatbubble" size={24} color="#3b82f6" />
            <View style={styles.navBadge}>
              <Text style={styles.navBadgeText}>3</Text>
            </View>
          </View>
          <Text style={[styles.navText, styles.navTextActive]}>Messages</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.navItem} onPress={onNavigateToActivity}>
          <Ionicons name="people" size={32} color="#14b8a6" />
          <Text style={styles.navText}>Médecins</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.navItem} onPress={onNavigateToProfiles}>
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
    backgroundColor: '#f9fafb',
    borderWidth: 1,
    borderColor: '#d1d5db',
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
  tabs: {
    flexDirection: 'row',
    gap: 8,
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: '#f3f4f6',
    alignItems: 'center',
  },
  tabActive: {
    backgroundColor: '#3b82f6',
  },
  tabText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6b7280',
  },
  tabTextActive: {
    color: 'white',
  },
  messagesList: {
    paddingBottom: 100,
  },
  messageItem: {
    flexDirection: 'row',
    padding: 16,
    backgroundColor: 'white',
  },
  messageItemUnread: {
    backgroundColor: '#eff6ff',
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#3b82f6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    position: 'relative',
  },
  avatarText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  verifiedBadge: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: '#10b981',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'white',
  },
  messageContent: {
    flex: 1,
  },
  messageHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  messageTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  doctorName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
  },
  doctorNameUnread: {
    fontWeight: 'bold',
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#ef4444',
  },
  messageTime: {
    fontSize: 12,
    color: '#9ca3af',
  },
  specialty: {
    fontSize: 12,
    color: '#6b7280',
    marginBottom: 4,
  },
  messagePreviewRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  messagePreview: {
    flex: 1,
    fontSize: 14,
    color: '#6b7280',
  },
  messagePreviewUnread: {
    fontWeight: '500',
  },
  separator: {
    height: 1,
    backgroundColor: '#e5e7eb',
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
  emptyState: {
    alignItems: 'center',
    padding: 40,
    marginTop: 60,
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
  unreadBadge: {
    backgroundColor: '#ef4444',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 6,
  },
  unreadBadgeText: {
    color: 'white',
    fontSize: 11,
    fontWeight: 'bold',
  },
  
  // Styles pour le modal
  modalContainer: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  modalCloseButton: {
    padding: 8,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  modalPlaceholder: {
    width: 40,
  },
  modalSearchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 44,
    margin: 16,
  },
  modalSearchInput: {
    flex: 1,
    fontSize: 16,
    color: '#1f2937',
  },
  modalLoadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalLoadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#6b7280',
  },
  modalDoctorsList: {
    paddingBottom: 20,
  },
  modalDoctorItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: 'white',
  },
  modalDoctorAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#3b82f6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    position: 'relative',
  },
  modalDoctorAvatarText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  modalDoctorBadge: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: '#10b981',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'white',
  },
  modalDoctorInfo: {
    flex: 1,
  },
  modalDoctorName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 4,
  },
  modalDoctorSpecialty: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 4,
  },
  modalDoctorVerified: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  modalDoctorVerifiedText: {
    fontSize: 12,
    color: '#10b981',
    fontWeight: '500',
  },
  modalSeparator: {
    height: 1,
    backgroundColor: '#e5e7eb',
  },
  modalEmptyState: {
    alignItems: 'center',
    padding: 40,
    marginTop: 60,
  },
  modalEmptyStateTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#374151',
    marginTop: 16,
    textAlign: 'center',
  },
  modalEmptyStateText: {
    fontSize: 14,
    color: '#9ca3af',
    marginTop: 8,
    textAlign: 'center',
    lineHeight: 20,
  },
});

export default MessagingList;