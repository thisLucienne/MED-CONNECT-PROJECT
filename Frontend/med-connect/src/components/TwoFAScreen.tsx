import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  StatusBar,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { authService } from '../services/authService';

interface TwoFAScreenProps {
  userId: string;
  email: string;
  onVerificationSuccess: () => void;
  onGoBack: () => void;
}

const TwoFAScreen: React.FC<TwoFAScreenProps> = ({
  userId,
  email,
  onVerificationSuccess,
  onGoBack,
}) => {
  const [code, setCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [timeLeft, setTimeLeft] = useState(300); // 5 minutes

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const formatTime = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const handleVerify = async () => {
    if (!code || code.length !== 4) {
      Alert.alert('Code invalide', 'Veuillez entrer un code à 4 chiffres');
      return;
    }

    setIsLoading(true);

    try {
      const response = await authService.verifyTwoFA({ userId, code });

      if (response.success) {
        onVerificationSuccess();
      } else {
        Alert.alert('Code incorrect', response.error?.message || 'Le code saisi est incorrect');
        setCode('');
      }
    } catch (error: any) {
      console.error('Erreur de vérification 2FA:', error);
      Alert.alert('Erreur', error.message || 'Une erreur est survenue lors de la vérification');
      setCode('');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendCode = async () => {
    try {
      // Ici, vous pourriez implémenter une API pour renvoyer le code
      Alert.alert('Code renvoyé', 'Un nouveau code a été envoyé à votre adresse email');
      setTimeLeft(300); // Reset timer
    } catch (error: any) {
      Alert.alert('Erreur', 'Impossible de renvoyer le code');
    }
  };

  const maskEmail = (email: string): string => {
    const [localPart, domain] = email.split('@');
    const maskedLocal = localPart.charAt(0) + '*'.repeat(localPart.length - 2) + localPart.charAt(localPart.length - 1);
    return `${maskedLocal}@${domain}`;
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <StatusBar barStyle="dark-content" />
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header avec bouton retour */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={onGoBack}>
            <Ionicons name="arrow-back" size={24} color="#374151" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Vérification</Text>
          <View style={styles.placeholder} />
        </View>

        {/* Icône de sécurité */}
        <View style={styles.iconContainer}>
          <View style={styles.iconBackground}>
            <Ionicons name="shield-checkmark" size={32} color="#10b981" />
          </View>
        </View>

        {/* Titre et description */}
        <View style={styles.content}>
          <Text style={styles.title}>Authentification à deux facteurs</Text>
          <Text style={styles.description}>
            Un code de vérification à 4 chiffres a été envoyé à{'\n'}
            <Text style={styles.emailText}>{maskEmail(email)}</Text>
          </Text>

          {/* Input pour le code */}
          <View style={styles.codeInputContainer}>
            <Text style={styles.label}>Code de vérification</Text>
            <View style={styles.codeInputWrapper}>
              <Ionicons name="key-outline" size={20} color="#9ca3af" style={styles.inputIcon} />
              <TextInput
                style={styles.codeInput}
                placeholder="0000"
                placeholderTextColor="#9ca3af"
                value={code}
                onChangeText={(text) => setCode(text.replace(/[^0-9]/g, '').slice(0, 4))}
                keyboardType="numeric"
                maxLength={4}
                autoFocus
                textAlign="center"
                fontSize={18}
                letterSpacing={4}
              />
            </View>
          </View>

          {/* Timer */}
          {timeLeft > 0 && (
            <View style={styles.timerContainer}>
              <Ionicons name="time-outline" size={16} color="#6b7280" />
              <Text style={styles.timerText}>
                Code valide pendant {formatTime(timeLeft)}
              </Text>
            </View>
          )}

          {/* Bouton de vérification */}
          <TouchableOpacity
            style={[styles.verifyButton, isLoading && styles.verifyButtonDisabled]}
            onPress={handleVerify}
            disabled={isLoading || code.length !== 4}
          >
            {isLoading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator color="white" size="small" />
                <Text style={[styles.verifyButtonText, { marginLeft: 8 }]}>Vérification...</Text>
              </View>
            ) : (
              <Text style={styles.verifyButtonText}>Vérifier</Text>
            )}
          </TouchableOpacity>

          {/* Renvoyer le code */}
          <View style={styles.resendContainer}>
            <Text style={styles.resendText}>Vous n'avez pas reçu le code ?</Text>
            <TouchableOpacity onPress={handleResendCode} disabled={timeLeft > 0}>
              <Text style={[styles.resendButton, timeLeft > 0 && styles.resendButtonDisabled]}>
                Renvoyer
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Footer de sécurité */}
        <View style={styles.footer}>
          <View style={styles.securityInfo}>
            <Ionicons name="information-circle-outline" size={16} color="#6b7280" />
            <Text style={styles.securityText}>
              Cette étape supplémentaire protège votre compte
            </Text>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  scrollContent: {
    flexGrow: 1,
    padding: 24,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 32,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
  },
  placeholder: {
    width: 40,
  },
  iconContainer: {
    alignItems: 'center',
    marginBottom: 32,
  },
  iconBackground: {
    width: 80,
    height: 80,
    backgroundColor: '#d1fae5',
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 12,
    textAlign: 'center',
  },
  description: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 32,
  },
  emailText: {
    fontWeight: '600',
    color: '#374151',
  },
  codeInputContainer: {
    width: '100%',
    marginBottom: 24,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
    marginBottom: 8,
    textAlign: 'center',
  },
  codeInputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderWidth: 2,
    borderColor: '#d1d5db',
    borderRadius: 12,
    paddingHorizontal: 16,
    height: 56,
  },
  inputIcon: {
    marginRight: 12,
  },
  codeInput: {
    flex: 1,
    fontSize: 18,
    color: '#1f2937',
    fontWeight: '600',
  },
  timerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  timerText: {
    fontSize: 14,
    color: '#6b7280',
    marginLeft: 6,
  },
  verifyButton: {
    backgroundColor: '#10b981',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 24,
    width: '100%',
    shadowColor: '#10b981',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  verifyButtonDisabled: {
    opacity: 0.6,
  },
  verifyButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  resendContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 32,
  },
  resendText: {
    fontSize: 14,
    color: '#6b7280',
    marginRight: 8,
  },
  resendButton: {
    fontSize: 14,
    color: '#3b82f6',
    fontWeight: '600',
  },
  resendButtonDisabled: {
    color: '#9ca3af',
  },
  footer: {
    alignItems: 'center',
  },
  securityInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#eff6ff',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
  },
  securityText: {
    fontSize: 12,
    color: '#6b7280',
    marginLeft: 6,
  },
});

export default TwoFAScreen;