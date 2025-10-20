/**
 * Photo Journal Entry Component
 *
 * Allows users to capture photos and get AI analysis
 * Supports food calorie counting and horse blanket detection
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  ScrollView,
  Alert,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';
import { visionService } from '../services/visionService';
import { PhotoAnalysis } from '../types/journal';
import { colors } from '../theme/colors';
import { spacing } from '../theme/spacing';

interface PhotoJournalEntryProps {
  onPhotoAdded: (uri: string, analysis?: PhotoAnalysis) => void;
  analysisType?: 'food' | 'horse' | 'general' | 'all';
  showAnalysis?: boolean;
}

export const PhotoJournalEntry: React.FC<PhotoJournalEntryProps> = ({
  onPhotoAdded,
  analysisType = 'all',
  showAnalysis = true,
}) => {
  const [photoUri, setPhotoUri] = useState<string | null>(null);
  const [analysis, setAnalysis] = useState<PhotoAnalysis | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  /**
   * Request camera permissions and take photo
   */
  const takePhoto = async () => {
    try {
      // Request camera permissions
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          'Permission Required',
          'Camera permission is needed to take photos'
        );
        return;
      }

      // Launch camera
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        const uri = result.assets[0].uri;
        setPhotoUri(uri);

        // Analyze photo if requested
        if (showAnalysis) {
          await analyzePhoto(uri);
        } else {
          onPhotoAdded(uri);
        }
      }
    } catch (error) {
      console.error('Error taking photo:', error);
      Alert.alert('Error', 'Failed to take photo');
    }
  };

  /**
   * Pick photo from gallery
   */
  const pickPhoto = async () => {
    try {
      // Request media library permissions
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          'Permission Required',
          'Photo library permission is needed to select photos'
        );
        return;
      }

      // Launch image picker
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        const uri = result.assets[0].uri;
        setPhotoUri(uri);

        // Analyze photo if requested
        if (showAnalysis) {
          await analyzePhoto(uri);
        } else {
          onPhotoAdded(uri);
        }
      }
    } catch (error) {
      console.error('Error picking photo:', error);
      Alert.alert('Error', 'Failed to select photo');
    }
  };

  /**
   * Analyze photo using AI
   */
  const analyzePhoto = async (uri: string) => {
    setIsAnalyzing(true);
    try {
      const result = await visionService.analyzePhoto({
        photoUri: uri,
        analysisType,
      });

      setAnalysis(result);
      onPhotoAdded(uri, result);
    } catch (error) {
      console.error('Error analyzing photo:', error);
      Alert.alert('Analysis Error', 'Failed to analyze photo. You can still save it.');
      onPhotoAdded(uri);
    } finally {
      setIsAnalyzing(false);
    }
  };

  /**
   * Clear current photo
   */
  const clearPhoto = () => {
    setPhotoUri(null);
    setAnalysis(null);
  };

  return (
    <View style={styles.container}>
      {!photoUri ? (
        <View style={styles.actionsContainer}>
          <TouchableOpacity style={styles.button} onPress={takePhoto}>
            <Ionicons name="camera" size={32} color={colors.primary.main} />
            <Text style={styles.buttonText}>Take Photo</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.button} onPress={pickPhoto}>
            <Ionicons name="images" size={32} color={colors.primary.main} />
            <Text style={styles.buttonText}>Choose from Gallery</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View style={styles.photoContainer}>
          <Image source={{ uri: photoUri }} style={styles.photo} />

          <TouchableOpacity style={styles.clearButton} onPress={clearPhoto}>
            <Ionicons name="close-circle" size={32} color={colors.error.main} />
          </TouchableOpacity>

          {isAnalyzing && (
            <View style={styles.analyzingOverlay}>
              <ActivityIndicator size="large" color={colors.primary.main} />
              <Text style={styles.analyzingText}>Analyzing photo...</Text>
            </View>
          )}

          {showAnalysis && analysis && !isAnalyzing && (
            <ScrollView style={styles.analysisContainer}>
              <Text style={styles.analysisTitle}>AI Analysis</Text>

              {/* General description */}
              {analysis.description && (
                <View style={styles.analysisSection}>
                  <Text style={styles.analysisLabel}>Description:</Text>
                  <Text style={styles.analysisText}>{analysis.description}</Text>
                </View>
              )}

              {/* Food analysis */}
              {analysis.foodDetected && (
                <View style={styles.analysisSection}>
                  <Text style={styles.analysisLabel}>Food Items:</Text>
                  {analysis.foodItems?.map((item, index) => (
                    <View key={index} style={styles.foodItem}>
                      <Text style={styles.foodItemName}>
                        {item.name} {item.quantity && `(${item.quantity})`}
                      </Text>
                      {item.calories && (
                        <Text style={styles.foodItemCalories}>
                          {item.calories} cal
                        </Text>
                      )}
                    </View>
                  ))}
                  {analysis.totalCalories && (
                    <Text style={styles.totalCalories}>
                      Total: {analysis.totalCalories} calories
                    </Text>
                  )}
                </View>
              )}

              {/* Horse analysis */}
              {analysis.horseDetected && (
                <View style={styles.analysisSection}>
                  <Text style={styles.analysisLabel}>Horse Status:</Text>
                  <Text style={styles.analysisText}>
                    Blanket: {analysis.blanketStatus === 'blanketed' ? '✅ Yes' : '❌ No'}
                  </Text>
                  {analysis.blanketType && analysis.blanketType !== 'none' && (
                    <Text style={styles.analysisText}>
                      Type: {analysis.blanketType}
                    </Text>
                  )}
                  {analysis.horseCondition?.coatCondition && (
                    <Text style={styles.analysisText}>
                      Coat: {analysis.horseCondition.coatCondition}
                    </Text>
                  )}
                  {analysis.horseCondition?.notes && (
                    <Text style={styles.analysisText}>
                      {analysis.horseCondition.notes}
                    </Text>
                  )}
                </View>
              )}

              {/* Animals detected */}
              {analysis.animalsDetected && analysis.animalsDetected.length > 0 && (
                <View style={styles.analysisSection}>
                  <Text style={styles.analysisLabel}>Animals Detected:</Text>
                  <Text style={styles.analysisText}>
                    {analysis.animalsDetected.join(', ')}
                  </Text>
                </View>
              )}

              {/* Barn activity */}
              {analysis.barnActivity && (
                <View style={styles.analysisSection}>
                  <Text style={styles.analysisLabel}>Activity:</Text>
                  <Text style={styles.analysisText}>{analysis.barnActivity}</Text>
                </View>
              )}

              {/* Confidence */}
              {analysis.confidence !== undefined && (
                <Text style={styles.confidence}>
                  Confidence: {Math.round(analysis.confidence * 100)}%
                </Text>
              )}
            </ScrollView>
          )}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.gray[50],
  },
  actionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: spacing.lg,
    gap: spacing.md,
  },
  button: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl,
    backgroundColor: 'white',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: colors.primary.main,
    borderStyle: 'dashed',
  },
  buttonText: {
    marginTop: spacing.sm,
    fontSize: 16,
    fontWeight: '600',
    color: colors.primary.main,
  },
  photoContainer: {
    flex: 1,
    position: 'relative',
  },
  photo: {
    width: '100%',
    height: 300,
    resizeMode: 'cover',
  },
  clearButton: {
    position: 'absolute',
    top: spacing.md,
    right: spacing.md,
    backgroundColor: 'white',
    borderRadius: 20,
  },
  analyzingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  analyzingText: {
    marginTop: spacing.md,
    fontSize: 16,
    color: 'white',
    fontWeight: '600',
  },
  analysisContainer: {
    flex: 1,
    padding: spacing.lg,
    backgroundColor: 'white',
  },
  analysisTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.gray[900],
    marginBottom: spacing.md,
  },
  analysisSection: {
    marginBottom: spacing.lg,
    paddingBottom: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray[200],
  },
  analysisLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.gray[700],
    marginBottom: spacing.sm,
  },
  analysisText: {
    fontSize: 15,
    color: colors.gray[600],
    lineHeight: 22,
  },
  foodItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.xs,
  },
  foodItemName: {
    fontSize: 15,
    color: colors.gray[700],
  },
  foodItemCalories: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.secondary.main,
  },
  totalCalories: {
    fontSize: 17,
    fontWeight: 'bold',
    color: colors.primary.main,
    marginTop: spacing.sm,
  },
  confidence: {
    fontSize: 14,
    color: colors.gray[500],
    fontStyle: 'italic',
    marginTop: spacing.md,
  },
});
