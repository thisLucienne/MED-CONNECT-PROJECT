import React from 'react';
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

interface ActivityScreenProps {
  onNavigateHome: () => void;
  onNavigateToRecords: () => void;
  onNavigateToMessages: () => void;
  onNavigateToProfile: () => void;
}

interface ActivityItem {
  id: string;
  type: 'document' | 'access' | 'message' | 'reminder' | 'system';
  title: string;
  description: string;
  timestamp: string;
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
  read: boolean;
}

const ActivityScreen: React.FC<ActivityScreenProps> = ({
  onNavigateHome,
  onNavigateToRecords,
  onNavigateToMessages,
  onNavigateToProfile,
}) => {
  const activities: ActivityItem[] = [
    {
      id: '1',
      type: 'document',
      title: 'Nouveau document ajouté',
      description: 'Vous avez ajouté "Résultats analyses sanguine"',
      timestamp: 'Il y a 2 heures',
      icon: 'document-attach-outline',
      color: '#10b981',
      read: false,
    },
    {
      id: '2',
      type: 'access',
      title: 'Accès accordé',
      description: 'Dr Sophie Martin peut désormais consulter votre dossier',
      timestamp: 'Il y a 5 heures',
      icon: 'shield-checkmark-outline',
      color: '#3b82f6',
      read: false,
    },
    {
      id: '3',
      type: 'message',
      title: 'Nouveau message',
      description: 'Dr Claire Bernard : "Vos résultats sont normaux..."',
      timestamp: 'Il y a 1 jour',
      icon: 'chatbubble-outline',
      color: '#8b5cf6',
      read: true,
    },
    {
      id: '4',
      type: 'reminder',
      title: 'Rappel consultation',
      description: 'Consultation avec Dr Jean Dupont demain à 14h30',
      timestamp: 'Il y a 2 jours',
      icon: 'calendar-outline',
      color: '#f59e0b',
      read: true,
    },
    {
      id: '5',
      type: 'system',
      title: 'Sécurité renforcée',
      description: 'Authentification à deux facteurs activée',
      timestamp: 'Il y a 3 jours',
      icon: 'lock-closed-outline',
      color: '#6b7280',
      read: true,
    },
  ];

  const renderActivity = ({ item }: { item: ActivityItem }) => (
    <TouchableOpacity
      style={[styles.activityItem, !item.read && styles.activityItemUnread]}
      activeOpacity={0.7}
    >
      <View style={[styles.activityIcon, { backgroundColor: item.color + '20' }]}>
        <Ionicons name={item.icon} size={24} color={item.color} />
      </View>

      <View style={styles.activityContent}>
        <Text style={styles.activityTitle}>{item.title}</Text>
        <Text style={styles.activityDescription}>{item.description}</Text>
        <Text style={styles.activityTime}>{item.timestamp}</Text>
      </View>

      {!item.read && <View style={styles.unreadDot} />}
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Activité</Text>
        <TouchableOpacity style={styles.markAllButton}>
          <Text style={styles.markAllText}>Tout marquer lu</Text>
        </TouchableOpacity>
      </View>

      {/* Liste des activités */}
      <FlatList
        data={activities}
        renderItem={renderActivity}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />

      {/* Bottom Navigation */}
      <View style={styles.bottomNav}>
        <TouchableOpacity style={styles.navItem} onPress={onNavigateHome}>
          <Ionicons name="home-outline" size={24} color="#9ca3af" />
          <Text style={styles.navText}>Accueil</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.navItem} onPress={onNavigateToRecords}>
          <Ionicons name="document-text-outline" size={24} color="#9ca3af" />
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

        <TouchableOpacity style={styles.navItem}>
          <Ionicons name="notifications" size={24} color="#3b82f6" />
          <Text style={[styles.navText, styles.navTextActive]}>Activité</Text>
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'white',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  markAllButton: {
    padding: 8,
  },
  markAllText: {
    fontSize: 14,
    color: '#3b82f6',
    fontWeight: '500',
  },
  listContent: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 100,
  },
  activityItem: {
    flexDirection: 'row',
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 2,
  },
  activityItemUnread: {
    backgroundColor: '#eff6ff',
    borderLeftWidth: 4,
    borderLeftColor: '#3b82f6',
  },
  activityIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  activityContent: {
    flex: 1,
  },
  activityTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 4,
  },
  activityDescription: {
    fontSize: 14,
    color: '#4b5563',
    marginBottom: 6,
    lineHeight: 20,
  },
  activityTime: {
    fontSize: 12,
    color: '#9ca3af',
  },
  unreadDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#3b82f6',
    alignSelf: 'center',
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
    right: -8,
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
    position: 'relative',
  },
});

export default ActivityScreen;