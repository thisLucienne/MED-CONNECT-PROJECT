import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, FlatList, StatusBar, SafeAreaView,} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface MessagingListProps {
  onOpenChat: () => void;
  onBack: () => void;
}

interface Message {
  id: string;
  doctor: string;
  specialty: string;
  preview: string;
  time: string;
  unread: boolean;
  hasAttachment: boolean;
  verified: boolean;
  initials: string;
}

const MessagingList: React.FC<MessagingListProps> = ({ onOpenChat, onBack }) => {
  const [activeTab, setActiveTab] = useState('tous');
  const [searchQuery, setSearchQuery] = useState('');

  const messages: Message[] = [
    {
      id: '1',
      doctor: 'Dr. Sophia Martin',
      specialty: 'Cardiologue',
      preview: 'Merci pour les détails, tout est normal',
      time: '10m',
      unread: true,
      hasAttachment: true,
      verified: true,
      initials: 'SM',
    },
    {
      id: '2',
      doctor: 'Dr. Jean Dupont',
      specialty: 'Généraliste',
      preview: 'Rendez-vous pris pour mercredi de la semaine prochaine',
      time: '2h',
      unread: false,
      hasAttachment: false,
      verified: true,
      initials: 'JD',
    },
    {
      id: '3',
      doctor: 'Dr. Claire Bernard',
      specialty: 'Dermatologue',
      preview: 'Bonjour, nous informons que les résultats sont arrivés',
      time: '1j',
      unread: true,
      hasAttachment: false,
      verified: true,
      initials: 'CB',
    },
    {
      id: '4',
      doctor: 'Dr. Marie Leblanc',
      specialty: 'Pédiatre',
      preview: 'La vaccination sera disponible la semaine prochaine',
      time: '3 jours',
      unread: false,
      hasAttachment: true,
      verified: true,
      initials: 'ML',
    },
  ];

  const renderMessage = ({ item }: { item: Message }) => (
    <TouchableOpacity
      style={[styles.messageItem, item.unread && styles.messageItemUnread]}
      onPress={onOpenChat}
    >
      <View style={styles.avatar}>
        <Text style={styles.avatarText}>{item.initials}</Text>
        {item.verified && (
          <View style={styles.verifiedBadge}>
            <Ionicons name="checkmark" size={10} color="white" />
          </View>
        )}
      </View>

      <View style={styles.messageContent}>
        <View style={styles.messageHeader}>
          <View style={styles.messageTitleRow}>
            <Text style={[styles.doctorName, item.unread && styles.doctorNameUnread]}>
              {item.doctor}
            </Text>
            {item.unread && <View style={styles.unreadDot} />}
          </View>
          <Text style={styles.messageTime}>{item.time}</Text>
        </View>

        <Text style={styles.specialty}>{item.specialty}</Text>

        <View style={styles.messagePreviewRow}>
          <Text
            style={[styles.messagePreview, item.unread && styles.messagePreviewUnread]}
            numberOfLines={1}
          >
            {item.preview}
          </Text>
          {item.hasAttachment && (
            <Ionicons name="document-attach" size={16} color="#9ca3af" />
          )}
        </View>
      </View>
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
        data={messages}
        renderItem={renderMessage}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.messagesList}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
      />

      {/* FAB */}
      <TouchableOpacity style={styles.fab}>
        <Ionicons name="add" size={28} color="white" />
      </TouchableOpacity>

      {/* Bottom Navigation */}
      <View style={styles.bottomNav}>
        <TouchableOpacity style={styles.navItem} onPress={onBack}>
          <Ionicons name="home-outline" size={24} color="#9ca3af" />
          <Text style={styles.navText}>Accueil</Text>
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

        <TouchableOpacity style={styles.navItem}>
          <Ionicons name="notifications-outline" size={24} color="#9ca3af" />
          <Text style={styles.navText}>Activité</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.navItem}>
          <Ionicons name="menu-outline" size={24} color="#9ca3af" />
          <Text style={styles.navText}>Plus</Text>
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
});

export default MessagingList;