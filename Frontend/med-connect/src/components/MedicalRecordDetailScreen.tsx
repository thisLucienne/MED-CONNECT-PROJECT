import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, FlatList, StatusBar, SafeAreaView, Alert, ActivityIndicator, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import medicalRecordsService, { MedicalRecord, Document } from '../services/medicalRecordsService';

interface MedicalRecordDetailScreenProps {
  dossierId: string;
  onBack: () => void;
  onAddDocument: (dossierId: string) => void;
}

const MedicalRecordDetailScreen: React.FC<MedicalRecordDetailScreenProps> = ({ 
  dossierId,
  onBack, 
  onAddDocument
}) => {
  const [record, setRecord] = useState<MedicalRecord | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadRecordDetails();
  }, []);

  const loadRecordDetails = async () => {
    try {
      setLoading(true);
      const response = await medicalRecordsService.getMedicalRecord(dossierId);
      setRecord(response.data);
    } catch (error: any) {
      Alert.alert('Erreur', error.message);
      onBack();
    } finally {
      setLoading(false);
    }
  };

  const getRecordStyle = (type: string) => {
    switch (type) {
      case 'CONSULTATION':
        return { icon: 'document-text', color: '#3b82f6' };
      case 'URGENCE':
        return { icon: 'warning', color: '#ef4444' };
      case 'SUIVI':
        return { icon: 'heart', color: '#10b981' };
      default:
        return { icon: 'document', color: '#6b7280' };
    }
  };

  const getDocumentIcon = (type: string) => {
    if (type.startsWith('image/')) return 'image';
    if (type === 'application/pdf') return 'document-text';
    return 'document';
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const renderDocument = ({ item }: { item: Document }) => (
    <TouchableOpacity style={styles.documentCard}>
      <View style={styles.documentIcon}>
        <Ionicons name={getDocumentIcon(item.type) as any} size={24} color="#3b82f6" />
      </View>
      
      <View style={styles.documentContent}>
        <Text style={styles.documentName}>{item.nom}</Text>
        <Text style={styles.documentInfo}>
          {item.type} • {formatFileSize(item.taille)}
        </Text>
        <Text style={styles.documentDate}>
          Ajouté le {formatDate(item.dateUpload)}
        </Text>
        {item.uploadePar && (
          <Text style={styles.documentAuthor}>
            Par {item.uploadePar.firstName} {item.uploadePar.lastName}
          </Text>
        )}
      </View>

      <TouchableOpacity style={styles.documentMenu}>
        <Ionicons name="ellipsis-vertical" size={20} color="#9ca3af" />
      </TouchableOpacity>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#3b82f6" />
          <Text style={styles.loadingText}>Chargement du dossier...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!record) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" />
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle" size={64} color="#ef4444" />
          <Text style={styles.errorTitle}>Dossier introuvable</Text>
          <TouchableOpacity style={styles.backButton} onPress={onBack}>
            <Text style={styles.backButtonText}>Retour</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const style = getRecordStyle(record.type);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.headerBackButton}>
          <Ionicons name="arrow-back" size={24} color="#1f2937" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Dossier médical</Text>
        <TouchableOpacity style={styles.headerMenu}>
          <Ionicons name="ellipsis-vertical" size={24} color="#1f2937" />
        </TouchableOpacity>
      </View>

      <FlatList
        data={record.documents || []}
        renderItem={renderDocument}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          <View>
            {/* Informations du dossier */}
            <View style={styles.recordHeader}>
              <View style={[styles.recordIcon, { backgroundColor: style.color + '20' }]}>
                <Ionicons name={style.icon as any} size={32} color={style.color} />
              </View>
              
              <View style={styles.recordInfo}>
                <Text style={styles.recordTitle}>{record.titre}</Text>
                <Text style={styles.recordType}>{record.type}</Text>
                <Text style={styles.recordDate}>
                  Créé le {formatDate(record.dateCreation)}
                </Text>
                <View style={[styles.statusBadge, { backgroundColor: record.statut === 'OUVERT' ? '#10b981' : '#6b7280' }]}>
                  <Text style={styles.statusText}>{record.statut}</Text>
                </View>
              </View>
            </View>

            {/* Description */}
            {record.description && (
              <View style={styles.descriptionCard}>
                <Text style={styles.descriptionTitle}>Description</Text>
                <Text style={styles.descriptionText}>{record.description}</Text>
              </View>
            )}

            {/* Section Documents */}
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>
                Documents ({record.documents?.length || 0})
              </Text>
              <TouchableOpacity 
                style={styles.addButton}
                onPress={() => onAddDocument(record.id)}
              >
                <Ionicons name="add" size={20} color="#3b82f6" />
                <Text style={styles.addButtonText}>Ajouter</Text>
              </TouchableOpacity>
            </View>
          </View>
        }
        ListEmptyComponent={
          <View style={styles.emptyDocuments}>
            <Ionicons name="document-outline" size={48} color="#9ca3af" />
            <Text style={styles.emptyTitle}>Aucun document</Text>
            <Text style={styles.emptyText}>
              Ajoutez des documents médicaux à ce dossier
            </Text>
            <TouchableOpacity 
              style={styles.emptyAddButton}
              onPress={() => onAddDocument(record.id)}
            >
              <Text style={styles.emptyAddButtonText}>Ajouter un document</Text>
            </TouchableOpacity>
          </View>
        }
      />

      {/* FAB pour ajouter un document */}
      <TouchableOpacity 
        style={styles.fab} 
        onPress={() => onAddDocument(record.id)}
      >
        <Ionicons name="add" size={28} color="white" />
      </TouchableOpacity>
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
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  headerBackButton: {
    padding: 8,
    marginRight: 8,
  },
  headerTitle: {
    flex: 1,
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  headerMenu: {
    padding: 8,
  },
  content: {
    padding: 16,
  },
  recordHeader: {
    flexDirection: 'row',
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  recordIcon: {
    width: 64,
    height: 64,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  recordInfo: {
    flex: 1,
  },
  recordTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 4,
  },
  recordType: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 4,
  },
  recordDate: {
    fontSize: 12,
    color: '#9ca3af',
    marginBottom: 8,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  statusText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  descriptionCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  descriptionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 8,
  },
  descriptionText: {
    fontSize: 14,
    color: '#6b7280',
    lineHeight: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#eff6ff',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  addButtonText: {
    color: '#3b82f6',
    fontSize: 14,
    fontWeight: '500',
    marginLeft: 4,
  },
  documentCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  documentIcon: {
    width: 48,
    height: 48,
    backgroundColor: '#eff6ff',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  documentContent: {
    flex: 1,
  },
  documentName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 4,
  },
  documentInfo: {
    fontSize: 12,
    color: '#6b7280',
    marginBottom: 2,
  },
  documentDate: {
    fontSize: 12,
    color: '#9ca3af',
    marginBottom: 2,
  },
  documentAuthor: {
    fontSize: 12,
    color: '#9ca3af',
  },
  documentMenu: {
    padding: 8,
  },
  emptyDocuments: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
    marginBottom: 24,
  },
  emptyAddButton: {
    backgroundColor: '#3b82f6',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  emptyAddButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  fab: {
    position: 'absolute',
    bottom: 24,
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
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1f2937',
    marginTop: 16,
    marginBottom: 24,
  },
  backButton: {
    backgroundColor: '#3b82f6',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  backButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
});

export default MedicalRecordDetailScreen;