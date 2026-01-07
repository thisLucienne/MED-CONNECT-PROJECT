import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  StyleSheet, 
  ScrollView, 
  StatusBar, 
  Alert, 
  ActivityIndicator,
  Image,
  Platform
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as ImagePicker from 'expo-image-picker';
import profileService, { UserProfile, UpdateProfileData } from '../services/profileService';

interface EditProfileScreenProps {
  onBack: () => void;
  profile: UserProfile;
  onProfileUpdated: (updatedProfile: UserProfile) => void;
}

const EditProfileScreen: React.FC<EditProfileScreenProps> = ({ 
  onBack, 
  profile, 
  onProfileUpdated 
}) => {
  const [formData, setFormData] = useState<UpdateProfileData>({
    firstName: profile.firstName,
    lastName: profile.lastName,
    phone: profile.phone || '',
    dateNaissance: profile.dateNaissance || ''
  });
  const [profileImage, setProfileImage] = useState<string | null>(profile.profilePicture || null);
  const [loading, setLoading] = useState(false);
  const [imageLoading, setImageLoading] = useState(false);

  // Demander les permissions pour la caméra et la galerie
  useEffect(() => {
    (async () => {
      if (Platform.OS !== 'web') {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
          Alert.alert(
            'Permission requise',
            'Nous avons besoin de l\'accès à votre galerie pour changer votre photo de profil.'
          );
        }
      }
    })();
  }, []);

  // Sélectionner une image
  const pickImage = async () => {
    try {
      Alert.alert(
        'Photo de profil',
        'Choisissez une option',
        [
          { text: 'Annuler', style: 'cancel' },
          { text: 'Galerie', onPress: () => openImagePicker('gallery') },
          { text: 'Caméra', onPress: () => openImagePicker('camera') }
        ]
      );
    } catch (error) {
      console.error('Erreur sélection image:', error);
    }
  };

  const openImagePicker = async (source: 'gallery' | 'camera') => {
    try {
      setImageLoading(true);
      
      let result;
      if (source === 'camera') {
        const { status } = await ImagePicker.requestCameraPermissionsAsync();
        if (status !== 'granted') {
          Alert.alert('Permission refusée', 'Accès à la caméra requis');
          return;
        }
        result = await ImagePicker.launchCameraAsync({
          mediaTypes: ImagePicker.MediaTypeOptions.Images,
          allowsEditing: true,
          aspect: [1, 1],
          quality: 0.8,
        });
      } else {
        result = await ImagePicker.launchImageLibraryAsync({
          mediaTypes: ImagePicker.MediaTypeOptions.Images,
          allowsEditing: true,
          aspect: [1, 1],
          quality: 0.8,
        });
      }

      if (!result.canceled && result.assets[0]) {
        setProfileImage(result.assets[0].uri);
        setFormData(prev => ({ ...prev, profilePicture: result.assets[0].uri }));
      }
    } catch (error) {
      console.error('Erreur ouverture image picker:', error);
      Alert.alert('Erreur', 'Impossible de sélectionner l\'image');
    } finally {
      setImageLoading(false);
    }
  };

  // Valider les données
  const validateForm = (): boolean => {
    if (!formData.firstName?.trim()) {
      Alert.alert('Erreur', 'Le prénom est requis');
      return false;
    }
    if (!formData.lastName?.trim()) {
      Alert.alert('Erreur', 'Le nom est requis');
      return false;
    }
    if (formData.phone && !/^[0-9\s\-\+\(\)]{8,15}$/.test(formData.phone.trim())) {
      Alert.alert('Erreur', 'Format de téléphone invalide');
      return false;
    }
    if (formData.dateNaissance) {
      const birthDate = new Date(formData.dateNaissance);
      const today = new Date();
      const age = today.getFullYear() - birthDate.getFullYear();
      if (age < 13 || age > 120) {
        Alert.alert('Erreur', 'Date de naissance invalide');
        return false;
      }
    }
    return true;
  };

  // Sauvegarder les modifications
  const handleSave = async () => {
    if (!validateForm()) return;

    try {
      setLoading(true);

      // Préparer les données à envoyer
      const updateData: UpdateProfileData = {
        firstName: formData.firstName?.trim(),
        lastName: formData.lastName?.trim(),
        phone: formData.phone?.trim() || undefined,
        dateNaissance: formData.dateNaissance || undefined
      };

      // Mettre à jour le profil
      const response = await profileService.updateProfile(updateData);
      
      if (response.success) {
        console.log('🔄 Réponse de mise à jour reçue:', JSON.stringify(response, null, 2));
        
        // Si une nouvelle image a été sélectionnée, l'uploader
        if (formData.profilePicture && formData.profilePicture !== profile.profilePicture) {
          try {
            // Créer un FormData pour l'upload
            const imageFormData = new FormData();
            
            // Pour React Native, nous devons créer un objet avec uri, type et name
            const imageData = {
              uri: formData.profilePicture,
              type: 'image/jpeg',
              name: 'profile.jpg',
            };
            
            imageFormData.append('profilePicture', imageData as any);

            const imageResponse = await profileService.uploadProfilePicture(imageFormData);
            
            if (imageResponse.success) {
              // Mettre à jour le profil avec la nouvelle URL
              const updatedProfile = { ...response.data.user, profilePicture: imageResponse.data.url };
              console.log('🔄 Appel onProfileUpdated avec image:', JSON.stringify(updatedProfile, null, 2));
              onProfileUpdated(updatedProfile);
            }
          } catch (imageError) {
            console.warn('Erreur upload image:', imageError);
            // Continuer même si l'upload de l'image échoue
          }
        } else {
          console.log('🔄 Appel onProfileUpdated sans image:', JSON.stringify(response.data.user, null, 2));
          onProfileUpdated(response.data.user);
        }

        Alert.alert(
          'Succès',
          'Profil mis à jour avec succès',
          [{ text: 'OK', onPress: () => {
            console.log('🔄 Alert OK pressé, appel de onBack()');
            onBack();
          }}]
        );
      }
    } catch (error: any) {
      console.error('Erreur mise à jour profil:', error);
      Alert.alert('Erreur', error.message || 'Erreur lors de la mise à jour');
    } finally {
      setLoading(false);
    }
  };

  // Générer les initiales
  const getInitials = (firstName?: string, lastName?: string) => {
    const first = firstName || '';
    const last = lastName || '';
    const firstInitial = first.length > 0 ? first.charAt(0) : '';
    const lastInitial = last.length > 0 ? last.charAt(0) : '';
    const initials = `${firstInitial}${lastInitial}`.toUpperCase();
    return initials || 'U';
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
          <Text style={styles.headerTitle}>Modifier le profil</Text>
          <TouchableOpacity onPress={handleSave} style={styles.saveButton} disabled={loading}>
            {loading ? (
              <ActivityIndicator size="small" color="white" />
            ) : (
              <Ionicons name="checkmark" size={24} color="white" />
            )}
          </TouchableOpacity>
        </LinearGradient>

        {/* Photo de profil */}
        <View style={styles.profileSection}>
          <View style={styles.avatarContainer}>
            <TouchableOpacity onPress={pickImage} disabled={imageLoading}>
              {profileImage ? (
                <Image source={{ uri: profileImage }} style={styles.avatar} />
              ) : (
                <View style={styles.avatar}>
                  <Text style={styles.avatarText}>
                    {getInitials(formData.firstName, formData.lastName)}
                  </Text>
                </View>
              )}
              <View style={styles.cameraButton}>
                {imageLoading ? (
                  <ActivityIndicator size="small" color="white" />
                ) : (
                  <Ionicons name="camera" size={16} color="white" />
                )}
              </View>
            </TouchableOpacity>
          </View>
          <Text style={styles.changePhotoText}>Touchez pour changer la photo</Text>
        </View>

        {/* Formulaire */}
        <View style={styles.formSection}>
          <Text style={styles.sectionTitle}>Informations personnelles</Text>
          
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Prénom *</Text>
            <TextInput
              style={styles.input}
              value={formData.firstName}
              onChangeText={(text) => setFormData(prev => ({ ...prev, firstName: text }))}
              placeholder="Votre prénom"
              placeholderTextColor="#9ca3af"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Nom *</Text>
            <TextInput
              style={styles.input}
              value={formData.lastName}
              onChangeText={(text) => setFormData(prev => ({ ...prev, lastName: text }))}
              placeholder="Votre nom"
              placeholderTextColor="#9ca3af"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Téléphone</Text>
            <TextInput
              style={styles.input}
              value={formData.phone}
              onChangeText={(text) => setFormData(prev => ({ ...prev, phone: text }))}
              placeholder="6 12 34 56 78"
              placeholderTextColor="#9ca3af"
              keyboardType="phone-pad"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Date de naissance</Text>
            <TextInput
              style={styles.input}
              value={formData.dateNaissance}
              onChangeText={(text) => setFormData(prev => ({ ...prev, dateNaissance: text }))}
              placeholder="YYYY-MM-DD"
              placeholderTextColor="#9ca3af"
            />
            <Text style={styles.inputHint}>Format: YYYY-MM-DD (ex: 1990-01-15)</Text>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Email</Text>
            <TextInput
              style={[styles.input, styles.inputDisabled]}
              value={profile.email}
              editable={false}
              placeholderTextColor="#9ca3af"
            />
            <Text style={styles.inputHint}>L'email ne peut pas être modifié</Text>
          </View>
        </View>

        {/* Boutons d'action */}
        <View style={styles.actionSection}>
          <TouchableOpacity 
            style={[styles.saveButtonLarge, loading && styles.saveButtonDisabled]} 
            onPress={handleSave}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator size="small" color="white" />
            ) : (
              <>
                <Ionicons name="save" size={20} color="white" />
                <Text style={styles.saveButtonText}>Sauvegarder les modifications</Text>
              </>
            )}
          </TouchableOpacity>

          <TouchableOpacity style={styles.cancelButton} onPress={onBack}>
            <Text style={styles.cancelButtonText}>Annuler</Text>
          </TouchableOpacity>
        </View>

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
    height: 120,
    paddingTop: 16,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
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
  headerTitle: {
    flex: 1,
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
    marginHorizontal: 16,
  },
  saveButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileSection: {
    alignItems: 'center',
    marginTop: -40,
    paddingHorizontal: 24,
    marginBottom: 32,
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: 12,
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
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
    fontSize: 40,
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
  changePhotoText: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
  },
  formSection: {
    paddingHorizontal: 24,
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 20,
  },
  inputGroup: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
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
  inputDisabled: {
    backgroundColor: '#f3f4f6',
    color: '#6b7280',
  },
  inputHint: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 4,
  },
  actionSection: {
    paddingHorizontal: 24,
  },
  saveButtonLarge: {
    backgroundColor: '#3b82f6',
    borderRadius: 12,
    paddingVertical: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 12,
  },
  saveButtonDisabled: {
    backgroundColor: '#9ca3af',
  },
  saveButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  cancelButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: '#6b7280',
    fontSize: 16,
    fontWeight: '500',
  },
});

export default EditProfileScreen;