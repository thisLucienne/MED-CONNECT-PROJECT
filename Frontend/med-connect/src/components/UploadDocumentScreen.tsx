import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, StatusBar, SafeAreaView, Alert,} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface UploadDocumentScreenProps {
  onBack: () => void;
  onUpload: () => void;
}

const UploadDocumentScreen: React.FC<UploadDocumentScreenProps> = ({ 
  onBack, 
  onUpload 
}) => {
  const [documentType, setDocumentType] = useState('');
  const [documentDate, setDocumentDate] = useState('');
  const [prescribingDoctor, setPrescribingDoctor] = useState('');
  const [notes, setNotes] = useState('');
  const [hasFile, setHasFile] = useState(false);

  const documentTypes = [
    { id: 'consultation', label: 'Consultation', icon: 'document-text' },
    { id: 'ordonnance', label: 'Ordonnance', icon: 'medical' },
    { id: 'analyse', label: 'Analyse', icon: 'flask' },
    { id: 'imagerie', label: 'Imagerie', icon: 'scan' },
    { id: 'vaccination', label: 'Vaccination', icon: 'bandage' },
    { id: 'autre', label: 'Autre', icon: 'document' },
  ];

  const handleSelectFile = () => {
    Alert.alert(
      'Choisir un fichier',
      'Sélectionnez la source',
      [
        { text: 'Appareil photo', onPress: () => setHasFile(true) },
        { text: 'Galerie', onPress: () => setHasFile(true) },
        { text: 'Fichiers', onPress: () => setHasFile(true) },
        { text: 'Annuler', style: 'cancel' },
      ]
    );
  };

  const handleSave = () => {
    if (!documentType) {
      Alert.alert('Erreur', 'Veuillez sélectionner un type de document');
      return;
    }
    if (!documentDate) {
      Alert.alert('Erreur', 'Veuillez saisir la date du document');
      return;
    }
    if (!hasFile) {
      Alert.alert('Erreur', 'Veuillez sélectionner un fichier');
      return;
    }
    
    onUpload();
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.closeButton}>
          <Ionicons name="close" size={24} color="#1f2937" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Nouveau document</Text>
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
          <View style={styles.uploadIcon}>
            <Ionicons name="cloud-upload-outline" size={48} color="#3b82f6" />
          </View>
          <Text style={styles.uploadTitle}>
            {hasFile ? 'Document sélectionné ✓' : 'Choisir un fichier ou fournir pour'}
          </Text>
          <Text style={styles.uploadSubtitle}>
            {hasFile ? 'Appuyez pour changer' : 'ajouter/cloner'}
          </Text>
          {hasFile && (
            <View style={styles.fileInfo}>
              <Ionicons name="document" size={20} color="#3b82f6" />
              <Text style={styles.fileName}>document_medical.pdf</Text>
            </View>
          )}
        </TouchableOpacity>

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
                ]}
                onPress={() => setDocumentType(type.id)}
              >
                <Ionicons
                  name={type.icon as any}
                  size={24}
                  color={documentType === type.id ? '#3b82f6' : '#6b7280'}
                />
                <Text
                  style={[
                    styles.typeButtonText,
                    documentType === type.id && styles.typeButtonTextActive,
                  ]}
                >
                  {type.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Date du document */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Date du document *</Text>
          <View style={styles.inputContainer}>
            <Ionicons name="calendar-outline" size={20} color="#9ca3af" style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="15 mars 2024"
              placeholderTextColor="#9ca3af"
              value={documentDate}
              onChangeText={setDocumentDate}
            />
          </View>
        </View>

        {/* Médecin prescripteur */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Médecin prescripteur (optionnel)</Text>
          <View style={styles.inputContainer}>
            <Ionicons name="person-outline" size={20} color="#9ca3af" style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Dr Sophie Martin"
              placeholderTextColor="#9ca3af"
              value={prescribingDoctor}
              onChangeText={setPrescribingDoctor}
            />
          </View>
        </View>

        {/* Notes */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Notes (optionnel)</Text>
          <View style={[styles.inputContainer, styles.textAreaContainer]}>
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Ajouter des informations complémentaires..."
              placeholderTextColor="#9ca3af"
              value={notes}
              onChangeText={setNotes}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />
          </View>
        </View>

        {/* Bouton d'enregistrement */}
        <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
          <Text style={styles.saveButtonText}>Enregistrer le document</Text>
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
    padding: 32,
    alignItems: 'center',
    marginBottom: 24,
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
  fileInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#eff6ff',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    marginTop: 16,
  },
  fileName: {
    fontSize: 14,
    color: '#3b82f6',
    marginLeft: 8,
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
  typeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  typeButton: {
    width: '31%',
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  typeButtonActive: {
    borderColor: '#3b82f6',
    backgroundColor: '#eff6ff',
  },
  typeButtonText: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 8,
    textAlign: 'center',
  },
  typeButtonTextActive: {
    color: '#3b82f6',
    fontWeight: '600',
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
  saveButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default UploadDocumentScreen;