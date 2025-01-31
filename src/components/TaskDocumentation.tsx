import React from 'react';
import { View, Text, TouchableOpacity, Image, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { documentationService } from '../services/documentationService';

interface Props {
  taskId: string;
  onPhotoAdded: (photoUrl: string) => void;
}

export const TaskDocumentation: React.FC<Props> = ({ taskId, onPhotoAdded }) => {
  const handleTakePhoto = async () => {
    try {
      const photoUrl = await documentationService.uploadTaskPhoto(taskId);
      if (photoUrl) {
        onPhotoAdded(photoUrl);
      }
    } catch (error) {
      console.error('Error taking photo:', error);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.title}>Task Documentation</Text>
        
        <TouchableOpacity 
          style={styles.photoButton}
          onPress={handleTakePhoto}
        >
          <Ionicons name="camera" size={24} color="#0284c7" />
          <Text style={styles.photoButtonText}>Take Photo</Text>
        </TouchableOpacity>

        <View style={styles.infoBox}>
          <Ionicons name="information-circle-outline" size={20} color="#6b7280" />
          <Text style={styles.infoText}>
            Photos help track task completion and maintain records for the barn.
          </Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 16,
  },
  photoButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f0f9ff',
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
  },
  photoButtonText: {
    marginLeft: 8,
    fontSize: 16,
    color: '#0284c7',
    fontWeight: '500',
  },
  infoBox: {
    flexDirection: 'row',
    backgroundColor: '#f9fafb',
    padding: 12,
    borderRadius: 8,
    alignItems: 'flex-start',
  },
  infoText: {
    flex: 1,
    marginLeft: 8,
    fontSize: 14,
    color: '#6b7280',
    lineHeight: 20,
  },
}); 