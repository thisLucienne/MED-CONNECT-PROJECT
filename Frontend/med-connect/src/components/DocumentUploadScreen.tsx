import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, StatusBar, SafeAreaView, Alert, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as DocumentPicker from 'expo-document-picker';
import * as ImagePicker from 'expo-image-picker';
import medicalRecordsService from '../services/medicalRecordsService';

interface DocumentUploadScreenProps {
  dossierId: string;
  onBack: () => void;
  onSuccess: () => void;
}

interface SelectedFile {
  uri: string;
  name: string;
  type: string;
  size: number;
}

const DocumentUploadScreen: React.FC<DocumentUploadScreenProps> = ({ 
  dossierId,
  onBack, 
  onSuccess 
}) => {
  const [documentType, setDocumentType] = useState('');
  const [documentName, setDocumentName] = useState('');
  const [notes, setNotes] = useState('');
  const [selectedFile, setSelectedFile] = useState<SelectedFile | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const documentTypes = [
    { id: 'CONSULTATION', label: 'Consultation', icon: 'document-text', color: '#3b82f6' },
    { id: 'ORDONNANCE', label: 'Ordonnance', icon: 'medical', color: '#8b5cf6' },
    { id: 'ANALYSE', label: 'Analyse', icon: 'flask', color: '#10b981' },
    { id: 'IMAGERIE', label: 'Imagerie', icon: 'scan', color: '#ec4899' },
    { id: 'VACCINATION', label: 'Vaccination', icon: 'bandage', color: '#f59e0b' },
    { id: 'AUTRE', label: 'Autre', icon: 'document', color: '#6b7280' },
  ];

  const handleSelectFromCamera = async () => {
    try {
      const permissionResult = await ImagePicker.requestCameraPermissionsAsync();
      
      if (!permissionResult.granted) {
        Alert.alert('Permission requise', 'L\'accès à l\'appareil photo est nécessaire pour prendre une photo.');
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        const asset = result.assets[0];
        setSelectedFile({
          uri: asset.uri,
          name: `photo_${Date.now()}.jpg`,
          type: 'image/jpeg',
          size: asset.fileSize || 0
        });
      }
    } catch (error) {
      Alert.alert('Erreur', 'Impossible d\'accéder à l\'appareil photo');
    }
  };

  const handleSelectFromGallery = async () => {
    try {
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      if (!permissionResult.granted) {
        Alert.alert('Permission requise', 'L\'accès à la galerie est nécessaire pour sélectionner une image.');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        const asset = result.assets[0];
        setSelectedFile({
          uri: asset.uri,
          name: asset.fileName || `image_${Date.now()}.jpg`,
          type: asset.type || 'image/jpeg',
          size: asset.fileSize || 0
        });
      }
    } catch (error) {
      Alert.alert('Erreur', 'Impossible d\'accéder à la galerie');
    }
  };

  const handleSelectDocument = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ['application/pdf', 'image/*'],
        copyToCacheDirectory: true,
      });

      if (!result.canceled && result.assets[0]) {
        const asset = result.assets[0];
        setSelectedFile({
          uri: asset.uri,
          name: asset.name,
          type: asset.mimeType || 'application/octet-stream',
          size: asset.size || 0
        });
      }
    } catch (error) {
      Alert.alert('Erreur', 'Impossible de sélectionner le document');
    }
  };

  const handleSelectFile = () => {
    Alert.alert(
      'Ajouter un document',
      'Choisissez la source',
      [
        { text: 'Appareil photo', onPress: handleSelectFromCamera },
        { text: 'Galerie', onPress: handleSelectFromGallery },
        { text: 'Fichiers', onPress: handleSelectDocument },
        { text: 'Annuler', style: 'cancel' },
      ]
    );
  };

  const handleSave = async () => {
    if (!documentType) {
      Alert.alert('Erreur', 'Veuillez sélectionner un type de document');
      return;
    }
    
    if (!documentName.trim()) {
      Alert.alert('Erreur', 'Veuillez saisir un nom pour le document');
      return;
    }

    if (!selectedFile) {
      Alert.alert('Erreur', 'Veuillez sélectionner un fichier');
      return;
    }

    setIsLoading(true);
    try {
      // Créer FormData pour l'upload
      const formData = new FormData();
      formData.append('nom', documentName.trim());
      formData.append('type', documentType);
      formData.append('notes', notes.trim());
      
      // Ajouter le fichier
      formData.append('fichier', {
        uri: selectedFile.uri,
        type: selectedFile.type,
        name: selectedFile.name,
      } as any);

      await medicalRecordsService.addDocument(dossierId, formData);
      
      Alert.alert(
        'Succès', 
        'Document ajouté avec succès !',
        [
          {
            text: 'OK',
            onPress: () => onSuccess()
          }
        ]
      );
    } catch (error: any) {
      Alert.alert('Erreur', error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getFileIcon = (type: string) => {
    if (type.startsWith('image/')) return 'image';
    if (type === 'application/pdf') return 'document-text';
    return 'document';
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.closeButton}>
          <Ionicons name="arrow-back" size={24} color="#1f2937" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Ajouter un document</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView 
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Upload Area */}
        <TouchableOpacity 
          style={styles.uploadArea}
          onPress={handleSelectFile}
        >
          {selectedFile ? (
            <View style={styles.filePreview}>
              {selectedFile.type.startsWith('image/') ? (
                <Image source={{ uri: selectedFile.uri }} style={styles.imagePreview} />
              ) : (
                <View style={styles.fileIcon}>
                  <Ionicons name={getFileIcon(selectedFile.type) as any} size={48} color="#3b82f6" />
                </View>
              )}
              <View style={styles.fileInfo}>
                <Text style={styles.fileName}>{selectedFile.name}</Text>
                <Text style={styles.fileSize}>{formatFileSize(selectedFile.size)}</Text>
              </View>
              <TouchableOpacity style={styles.changeFileButton}>
                <Text style={styles.changeFileText}>Changer</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.uploadPrompt}>
              <View style={styles.uploadIcon}>
                <Ionicons name="cloud-upload-outline" size={48} color="#3b82f6" />
              </View>
              <Text style={styles.uploadTitle}>Ajouter un document</Text>
              <Text style={styles.uploadSubtitle}>
                Photo, PDF ou autre fichier médical
              </Text>
            </View>
          )}
        </TouchableOpacity>

        {/* Nom du document */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Nom du document *</Text>
          <View style={styles.inputContainer}>
            <Ionicons name="document-text-outline" size={20} color="#9ca3af" style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Ex: Résultats analyse sanguine"
              placeholderTextColor="#9ca3af"
              value={documentName}
              onChangeText={setDocumentName}
              maxLength={100}
            />
          </View>
        </View>

        {/* Type de document */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Type de document *</Text>
          <View style={styles.typeGrid}>
            {documentTypes.map((type) => (
              <TouchableOpacity
                key={type.id}
                style={[
                  styles.typeButton,
                  documentType === type.id && styles.typeButtonActive,
                  { borderColor: documentType === type.id ? type.color : '#e5e7eb' }
                ]}
                onPress={() => setDocumentType(type.id)}
              >
                <Ionicons
                  name={type.icon as any}
                  size={24}
                  color={documentType === type.id ? type.color : '#6b7280'}
                />
                <Text
                  style={[
                    styles.typeButtonText,
                    documentType === type.id && { color: type.color, fontWeight: '600' }
                  ]}
                >
                  {type.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Notes */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Notes (optionnel)</Text>
          <View style={[styles.inputContainer, styles.textAreaContainer]}>
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Informations complémentaires, contexte, observations..."
              placeholderTextColor="#9ca3af"
              value={notes}
              onChangeText={setNotes}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
              maxLength={500}
            />
          </View>
        </View>

        {/* Bouton d'enregistrement */}
        <TouchableOpacity 
          style={[styles.saveButton, isLoading && styles.saveButtonDisabled]} 
          onPress={handleSave}
          disabled={isLoading}
        >
          <Text style={styles.saveButtonText}>
            {isLoading ? 'Ajout en cours...' : 'Ajouter le document'}
          </Text>
        </TouchableOpacity>

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
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  closeButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
  },
  content: {
    padding: 16,
  },
  uploadArea: {
    backgroundColor: 'white',
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: '#bfdbfe',
    borderRadius: 16,
    padding: 24,
    marginBottom: 24,
  },
  uploadPrompt: {
    alignItems: 'center',
  },
  uploadIcon: {
    width: 80,
    height: 80,
    backgroundColor: '#eff6ff',
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  uploadTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    textAlign: 'center',
    marginBottom: 4,
  },
  uploadSubtitle: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
  },
  filePreview: {
    alignItems: 'center',
  },
  imagePreview: {
    width: 120,
    height: 120,
    borderRadius: 12,
    marginBottom: 12,
  },
  fileIcon: {
    width: 80,
    height: 80,
    backgroundColor: '#eff6ff',
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  fileInfo: {
    alignItems: 'center',
    marginBottom: 12,
  },
  fileName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1f2937',
    textAlign: 'center',
  },
  fileSize: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 2,
  },
  changeFileButton: {
    backgroundColor: '#eff6ff',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  changeFileText: {
    color: '#3b82f6',
    fontSize: 14,
    fontWeight: '500',
  },
  section: {
    marginBottom: 24,
  },
  sectionLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 12,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 48,
  },
  textAreaContainer: {
    height: 120,
    alignItems: 'flex-start',
    paddingVertical: 12,
  },
  inputIcon: {
    marginRight: 8,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#1f2937',
  },
  textArea: {
    height: '100%',
  },
  typeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  typeButton: {
    width: '31%',
    backgroundColor: 'white',
    borderWidth: 2,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  typeButtonActive: {
    backgroundColor: '#f8fafc',
  },
  typeButtonText: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 8,
    textAlign: 'center',
  },
  saveButton: {
    backgroundColor: '#3b82f6',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#3b82f6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  saveButtonDisabled: {
    backgroundColor: '#9ca3af',
    shadowOpacity: 0,
    elevation: 0,
  },
  saveButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default DocumentUploadScreen;