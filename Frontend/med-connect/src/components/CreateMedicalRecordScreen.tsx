import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, StatusBar, SafeAreaView, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import medicalRecordsService, { CreateMedicalRecordData } from '../services/medicalRecordsService';

interface CreateMedicalRecordScreenProps {
  onBack: () => void;
  onSuccess: () => void;
}

const CreateMedicalRecordScreen: React.FC<CreateMedicalRecordScreenProps> = ({ onBack, onSuccess }) => {
  const [titre, setTitre] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState<'CONSULTATION' | 'URGENCE' | 'SUIVI'>('CONSULTATION');
  const [isLoading, setIsLoading] = useState(false);

  const types = [
    { value: 'CONSULTATION', label: 'Consultation', icon: 'document-text', color: '#3b82f6' },
    { value: 'URGENCE', label: 'Urgence', icon: 'warning', color: '#ef4444' },
    { value: 'SUIVI', label: 'Suivi', icon: 'heart', color: '#10b981' },
  ];

  const handleSubmit = async () => {
    if (!titre.trim()) {
      Alert.alert('Erreur', 'Veuillez saisir un titre pour le dossier');
      return;
    }

    setIsLoading(true);
    try {
      const data: CreateMedicalRecordData = {
        titre: titre.trim(),
        description: description.trim() || undefined,
        type
      };

      await medicalRecordsService.createMedicalRecord(data);
      
      Alert.alert(
        'Succès', 
        'Dossier médical créé avec succès !',
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

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={onBack} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#1f2937" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Nouveau dossier</Text>
          <View style={styles.placeholder} />
        </View>

        <View style={styles.content}>
          {/* Titre */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Titre du dossier *</Text>
            <TextInput
              style={styles.input}
              placeholder="Ex: Consultation cardiologie"
              placeholderTextColor="#9ca3af"
              value={titre}
              onChangeText={setTitre}
              maxLength={100}
            />
          </View>

          {/* Description */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Description (optionnel)</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Décrivez brièvement le motif ou le contexte..."
              placeholderTextColor="#9ca3af"
              value={description}
              onChangeText={setDescription}
              multiline
              numberOfLines={4}
              maxLength={500}
            />
          </View>

          {/* Type de dossier */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Type de dossier *</Text>
            <View style={styles.typeContainer}>
              {types.map((typeOption) => (
                <TouchableOpacity
                  key={typeOption.value}
                  style={[
                    styles.typeCard,
                    type === typeOption.value && styles.typeCardSelected,
                    { borderColor: type === typeOption.value ? typeOption.color : '#e5e7eb' }
                  ]}
                  onPress={() => setType(typeOption.value as any)}
                >
                  <View style={[styles.typeIcon, { backgroundColor: typeOption.color + '20' }]}>
                    <Ionicons name={typeOption.icon as any} size={24} color={typeOption.color} />
                  </View>
                  <Text style={[
                    styles.typeLabel,
                    type === typeOption.value && { color: typeOption.color, fontWeight: '600' }
                  ]}>
                    {typeOption.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Bouton de création */}
          <TouchableOpacity 
            style={[styles.createButton, isLoading && styles.createButtonDisabled]} 
            onPress={handleSubmit}
            disabled={isLoading}
          >
            <Text style={styles.createButtonText}>
              {isLoading ? 'Création en cours...' : 'Créer le dossier'}
            </Text>
          </TouchableOpacity>

          {/* Note d'information */}
          <View style={styles.infoContainer}>
            <Ionicons name="information-circle" size={20} color="#3b82f6" />
            <Text style={styles.infoText}>
              Une fois créé, vous pourrez ajouter des documents, des commentaires et donner accès à vos médecins.
            </Text>
          </View>
        </View>
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
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
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
    textAlign: 'center',
  },
  placeholder: {
    width: 40,
  },
  content: {
    padding: 16,
  },
  inputGroup: {
    marginBottom: 24,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 8,
  },
  input: {
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: '#1f2937',
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  typeContainer: {
    gap: 12,
  },
  typeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderWidth: 2,
    borderRadius: 12,
    padding: 16,
  },
  typeCardSelected: {
    backgroundColor: '#f8fafc',
  },
  typeIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  typeLabel: {
    fontSize: 16,
    color: '#1f2937',
  },
  createButton: {
    backgroundColor: '#3b82f6',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 24,
    shadowColor: '#3b82f6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  createButtonDisabled: {
    backgroundColor: '#9ca3af',
    shadowOpacity: 0,
    elevation: 0,
  },
  createButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  infoContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#eff6ff',
    padding: 16,
    borderRadius: 12,
    gap: 12,
  },
  infoText: {
    flex: 1,
    fontSize: 14,
    color: '#1e40af',
    lineHeight: 20,
  },
});

export default CreateMedicalRecordScreen;