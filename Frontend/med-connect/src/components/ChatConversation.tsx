import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  StatusBar,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface ChatConversationProps {
  onBack: () => void;
}

interface ChatMessage {
  id: string;
  sender: 'doctor' | 'user';
  type: 'text' | 'file' | 'info';
  content?: string;
  fileName?: string;
  fileSize?: string;
  time: string;
}

const ChatConversation: React.FC<ChatConversationProps> = ({ onBack }) => {
  const [message, setMessage] = useState('');

  const messages: ChatMessage[] = [
    {
      id: '1',
      sender: 'doctor',
      type: 'text',
      content: 'Bonjour! Comment allez-vous aujourd\'hui?',
      time: '09:15',
    },
    {
      id: '2',
      sender: 'doctor',
      type: 'info',
      content: 'La conversation sécurisée est confirmée',
      time: '09:15',
    },
    {
      id: '3',
      sender: 'user',
      type: 'text',
      content: 'Bonjour Docteur, je me sens bien merci',
      time: '09:17',
    },
    {
      id: '4',
      sender: 'doctor',
      type: 'text',
      content: 'Voici le compte-rendu détaillé de votre dernière visite. Les résultats sont normaux.',
      time: '09:18',
    },
    {
      id: '5',
      sender: 'doctor',
      type: 'file',
      fileName: 'resultats_analyses.pdf',
      fileSize: '245 KB',
      time: '09:18',
    },
    {
      id: '6',
      sender: 'doctor',
      type: 'text',
      content: 'Parfait! N\'hésitez pas si vous avez des questions. Je serai disponible.',
      time: '09:19',
    },
    {
      id: '7',
      sender: 'user',
      type: 'text',
      content: 'D\'accord, merci beaucoup pour votre suivi!',
      time: '09:21',
    },
  ];

  const handleSendMessage = () => {
    if (message.trim()) {
      alert(`Message envoyé: ${message}`);
      setMessage('');
    }
  };

  const renderMessage = ({ item }: { item: ChatMessage }) => {
    if (item.type === 'info') {
      return (
        <View style={styles.infoMessageContainer}>
          <View style={styles.infoMessage}>
            <Ionicons name="information-circle" size={16} color="#f59e0b" />
            <Text style={styles.infoMessageText}>{item.content}</Text>
          </View>
        </View>
      );
    }

    if (item.type === 'file') {
      return (
        <View style={[styles.messageContainer, item.sender === 'user' ? styles.userMessageContainer : styles.doctorMessageContainer]}>
          <View style={[styles.messageBubble, item.sender === 'user' ? styles.userMessageBubble : styles.doctorMessageBubble]}>
            <View style={styles.fileContent}>
              <View style={[styles.fileIcon, item.sender === 'user' ? styles.fileIconUser : styles.fileIconDoctor]}>
                <Ionicons name="document-text" size={20} color={item.sender === 'user' ? 'white' : '#3b82f6'} />
              </View>
              <View style={styles.fileInfo}>
                <Text style={[styles.fileName, item.sender === 'user' && styles.fileNameUser]} numberOfLines={1}>
                  {item.fileName}
                </Text>
                <Text style={[styles.fileSize, item.sender === 'user' && styles.fileSizeUser]}>
                  {item.fileSize}
                </Text>
              </View>
            </View>
            <Text style={[styles.messageTime, item.sender === 'user' && styles.messageTimeUser]}>
              {item.time}
            </Text>
          </View>
        </View>
      );
    }

    return (
      <View style={[styles.messageContainer, item.sender === 'user' ? styles.userMessageContainer : styles.doctorMessageContainer]}>
        <View style={[styles.messageBubble, item.sender === 'user' ? styles.userMessageBubble : styles.doctorMessageBubble]}>
          <Text style={[styles.messageText, item.sender === 'user' && styles.messageTextUser]}>
            {item.content}
          </Text>
          <Text style={[styles.messageTime, item.sender === 'user' && styles.messageTimeUser]}>
            {item.time}
          </Text>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#1f2937" />
        </TouchableOpacity>

        <View style={styles.doctorInfo}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>SM</Text>
            <View style={styles.verifiedBadge}>
              <Ionicons name="checkmark" size={10} color="white" />
            </View>
          </View>
          <View>
            <Text style={styles.doctorName}>Dr. Sophia Martin</Text>
            <View style={styles.onlineStatus}>
              <View style={styles.onlineDot} />
              <Text style={styles.onlineText}>En ligne</Text>
            </View>
          </View>
        </View>

        <View style={styles.headerActions}>
          <TouchableOpacity style={styles.headerButton}>
            <Ionicons name="call" size={20} color="#1f2937" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.headerButton}>
            <Ionicons name="videocam" size={20} color="#1f2937" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.headerButton}>
            <Ionicons name="ellipsis-vertical" size={20} color="#1f2937" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Messages */}
      <FlatList
        data={messages}
        renderItem={renderMessage}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.messagesList}
        inverted={false}
      />

      {/* Input */}
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
      >
        <View style={styles.inputContainer}>
          <TouchableOpacity style={styles.attachButton}>
            <Ionicons name="attach" size={24} color="#6b7280" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.attachButton}>
            <Ionicons name="image" size={24} color="#6b7280" />
          </TouchableOpacity>

          <View style={styles.textInputContainer}>
            <TextInput
              style={styles.textInput}
              placeholder="Écrire votre message..."
              placeholderTextColor="#9ca3af"
              value={message}
              onChangeText={setMessage}
              multiline
            />
          </View>

          {message.trim() ? (
            <TouchableOpacity style={styles.sendButton} onPress={handleSendMessage}>
              <Ionicons name="send" size={20} color="white" />
            </TouchableOpacity>
          ) : (
            <TouchableOpacity style={styles.attachButton}>
              <Ionicons name="mic" size={24} color="#6b7280" />
            </TouchableOpacity>
          )}
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f3f4f6',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  backButton: {
    padding: 8,
    marginRight: 8,
  },
  doctorInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#3b82f6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    position: 'relative',
  },
  avatarText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  verifiedBadge: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#10b981',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'white',
  },
  doctorName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
  },
  onlineStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  onlineDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#10b981',
    marginRight: 4,
  },
  onlineText: {
    fontSize: 12,
    color: '#10b981',
  },
  headerActions: {
    flexDirection: 'row',
    gap: 8,
  },
  headerButton: {
    padding: 8,
  },
  messagesList: {
    padding: 16,
    paddingBottom: 8,
  },
  messageContainer: {
    marginBottom: 16,
  },
  userMessageContainer: {
    alignItems: 'flex-end',
  },
  doctorMessageContainer: {
    alignItems: 'flex-start',
  },
  messageBubble: {
    maxWidth: '75%',
    padding: 12,
    borderRadius: 16,
  },
  userMessageBubble: {
    backgroundColor: '#3b82f6',
    borderBottomRightRadius: 4,
  },
  doctorMessageBubble: {
    backgroundColor: 'white',
    borderBottomLeftRadius: 4,
  },
  messageText: {
    fontSize: 14,
    color: '#1f2937',
    marginBottom: 4,
  },
  messageTextUser: {
    color: 'white',
  },
  messageTime: {
    fontSize: 11,
    color: '#6b7280',
    textAlign: 'right',
  },
  messageTimeUser: {
    color: 'rgba(255, 255, 255, 0.7)',
  },
  fileContent: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  fileIcon: {
    width: 36,
    height: 36,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  fileIconUser: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  fileIconDoctor: {
    backgroundColor: '#eff6ff',
  },
  fileInfo: {
    flex: 1,
  },
  fileName: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1f2937',
  },
  fileNameUser: {
    color: 'white',
  },
  fileSize: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 2,
  },
  fileSizeUser: {
    color: 'rgba(255, 255, 255, 0.7)',
  },
  infoMessageContainer: {
    alignItems: 'center',
    marginBottom: 16,
  },
  infoMessage: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fef3c7',
    borderColor: '#fde68a',
    borderWidth: 1,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 12,
    gap: 8,
  },
  infoMessageText: {
    fontSize: 12,
    color: '#92400e',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    backgroundColor: 'white',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    gap: 8,
  },
  attachButton: {
    padding: 8,
  },
  textInputContainer: {
    flex: 1,
    backgroundColor: '#f3f4f6',
    borderRadius: 24,
    paddingHorizontal: 16,
    paddingVertical: 8,
    maxHeight: 100,
  },
  textInput: {
    fontSize: 16,
    color: '#1f2937',
  },
  sendButton: {
    width: 40,
    height: 40,
    backgroundColor: '#3b82f6',
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default ChatConversation;