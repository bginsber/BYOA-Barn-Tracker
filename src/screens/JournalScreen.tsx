/**
 * Journal Screen
 *
 * Main screen for viewing and creating journal entries
 * Displays timeline of photo and audio entries with AI analysis
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  RefreshControl,
  Alert,
  Modal,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { journalService } from '../services/journalService';
import { PhotoJournalEntry } from '../components/PhotoJournalEntry';
import { AudioJournalEntry } from '../components/AudioJournalEntry';
import {
  JournalEntry,
  JournalEntryType,
  JournalCategory,
  PhotoAnalysis,
  AudioTranscription,
} from '../types/journal';
import { colors } from '../theme/colors';
import { spacing } from '../theme/spacing';

type CreateMode = 'photo' | 'audio' | null;

export const JournalScreen: React.FC = () => {
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [createMode, setCreateMode] = useState<CreateMode>(null);
  const [selectedCategory, setSelectedCategory] = useState<JournalCategory>('observation');

  /**
   * Load journal entries
   */
  const loadEntries = async () => {
    try {
      const data = await journalService.getEntries();
      setEntries(data);
    } catch (error) {
      console.error('Error loading journal entries:', error);
      Alert.alert('Error', 'Failed to load journal entries');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  /**
   * Refresh entries
   */
  const onRefresh = useCallback(() => {
    setIsRefreshing(true);
    loadEntries();
  }, []);

  /**
   * Load entries on mount
   */
  useEffect(() => {
    loadEntries();
  }, []);

  /**
   * Handle photo added
   */
  const handlePhotoAdded = async (uri: string, analysis?: PhotoAnalysis) => {
    try {
      // Determine category from analysis
      let category: JournalCategory = 'observation';
      if (analysis?.foodDetected) {
        category = 'feeding';
      } else if (analysis?.horseDetected) {
        category = 'care';
      }

      // Create journal entry
      const entryId = await journalService.createEntry({
        type: 'photo',
        category,
        title: analysis?.description || 'Photo Entry',
      });

      // Add photo with analysis
      await journalService.addPhoto(entryId, uri, analysis);

      // Reload entries
      await loadEntries();

      // Close modal
      setCreateMode(null);

      Alert.alert('Success', 'Photo journal entry created!');
    } catch (error) {
      console.error('Error creating photo entry:', error);
      Alert.alert('Error', 'Failed to create photo entry');
    }
  };

  /**
   * Handle audio added
   */
  const handleAudioAdded = async (
    uri: string,
    duration: number,
    transcription?: AudioTranscription
  ) => {
    try {
      // Create journal entry
      const entryId = await journalService.createEntry({
        type: 'audio',
        category: selectedCategory,
        title: transcription?.text?.substring(0, 50) || 'Voice Note',
        notes: transcription?.text,
      });

      // Add audio with transcription
      await journalService.addAudio(entryId, uri, duration, transcription);

      // Reload entries
      await loadEntries();

      // Close modal
      setCreateMode(null);

      Alert.alert('Success', 'Voice journal entry created!');
    } catch (error) {
      console.error('Error creating audio entry:', error);
      Alert.alert('Error', 'Failed to create voice entry');
    }
  };

  /**
   * Format date for display
   */
  const formatDate = (timestamp: number): string => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 1) return 'Today';
    if (diffDays === 2) return 'Yesterday';
    if (diffDays <= 7) return `${diffDays - 1} days ago`;

    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined,
    });
  };

  /**
   * Get category emoji
   */
  const getCategoryEmoji = (category: JournalCategory): string => {
    const emojiMap: Record<JournalCategory, string> = {
      feeding: '🥕',
      care: '🐎',
      medical: '💊',
      training: '🏇',
      maintenance: '🔧',
      observation: '📝',
      other: '📌',
    };
    return emojiMap[category];
  };

  /**
   * Render journal entry card
   */
  const renderEntry = ({ item }: { item: JournalEntry }) => {
    const firstPhoto = item.photos?.[0];
    const firstAudio = item.audio?.[0];

    return (
      <View style={styles.entryCard}>
        <View style={styles.entryHeader}>
          <View style={styles.entryMeta}>
            <Text style={styles.categoryEmoji}>{getCategoryEmoji(item.category)}</Text>
            <View>
              <Text style={styles.entryTitle}>{item.title || 'Journal Entry'}</Text>
              <Text style={styles.entryDate}>{formatDate(item.entryDate)}</Text>
            </View>
          </View>
          <View style={styles.entryTypeBadge}>
            <Ionicons
              name={item.type === 'photo' ? 'camera' : 'mic'}
              size={16}
              color={colors.primary.main}
            />
          </View>
        </View>

        {/* Photo content */}
        {firstPhoto && (
          <View style={styles.photoContent}>
            <Image source={{ uri: firstPhoto.url }} style={styles.entryPhoto} />
            {item.photos && item.photos.length > 1 && (
              <View style={styles.photoCount}>
                <Ionicons name="images" size={16} color="white" />
                <Text style={styles.photoCountText}>{item.photos.length}</Text>
              </View>
            )}

            {/* Photo analysis summary */}
            {firstPhoto.analysis && (
              <View style={styles.analysisSummary}>
                {firstPhoto.analysis.foodDetected && (
                  <Text style={styles.analysisSummaryText}>
                    🍽️ {firstPhoto.analysis.totalCalories || '?'} cal
                  </Text>
                )}
                {firstPhoto.analysis.horseDetected && (
                  <Text style={styles.analysisSummaryText}>
                    {firstPhoto.analysis.blanketStatus === 'blanketed' ? '🧥' : '🐴'}{' '}
                    {firstPhoto.analysis.blanketType !== 'none'
                      ? firstPhoto.analysis.blanketType
                      : 'No blanket'}
                  </Text>
                )}
              </View>
            )}
          </View>
        )}

        {/* Audio content */}
        {firstAudio && (
          <View style={styles.audioContent}>
            <Ionicons name="musical-notes" size={24} color={colors.primary.main} />
            <View style={styles.audioInfo}>
              {firstAudio.transcription ? (
                <Text style={styles.transcriptionPreview} numberOfLines={2}>
                  {firstAudio.transcription.text}
                </Text>
              ) : (
                <Text style={styles.audioInfoText}>
                  Voice note ({Math.floor(firstAudio.duration)}s)
                </Text>
              )}
            </View>
          </View>
        )}

        {/* Notes */}
        {item.notes && (
          <Text style={styles.entryNotes} numberOfLines={2}>
            {item.notes}
          </Text>
        )}

        {/* Related tasks */}
        {item.relatedTasks && item.relatedTasks.length > 0 && (
          <View style={styles.relatedTasks}>
            <Ionicons name="checkmark-circle" size={16} color={colors.success.main} />
            <Text style={styles.relatedTasksText}>
              {item.relatedTasks.length} task{item.relatedTasks.length > 1 ? 's' : ''}{' '}
              linked
            </Text>
          </View>
        )}
      </View>
    );
  };

  /**
   * Render empty state
   */
  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <Ionicons name="journal" size={64} color={colors.gray[300]} />
      <Text style={styles.emptyTitle}>No Journal Entries Yet</Text>
      <Text style={styles.emptyText}>
        Start documenting your barn activities with photos and voice notes
      </Text>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Journal</Text>
        <View style={styles.headerActions}>
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => setCreateMode('photo')}
          >
            <Ionicons name="camera" size={24} color={colors.primary.main} />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => setCreateMode('audio')}
          >
            <Ionicons name="mic" size={24} color={colors.primary.main} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Entry list */}
      <FlatList
        data={entries}
        renderItem={renderEntry}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={!isLoading ? renderEmpty : null}
      />

      {/* Create entry modal */}
      <Modal
        visible={createMode !== null}
        animationType="slide"
        onRequestClose={() => setCreateMode(null)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setCreateMode(null)}>
              <Ionicons name="close" size={28} color={colors.gray[700]} />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>
              {createMode === 'photo' ? 'Photo Entry' : 'Voice Entry'}
            </Text>
            <View style={{ width: 28 }} />
          </View>

          <View style={styles.modalContent}>
            {createMode === 'photo' && (
              <PhotoJournalEntry
                onPhotoAdded={handlePhotoAdded}
                analysisType="all"
                showAnalysis={true}
              />
            )}

            {createMode === 'audio' && (
              <AudioJournalEntry
                onAudioAdded={handleAudioAdded}
                autoTranscribe={true}
                analyzeContent={true}
              />
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.gray[50],
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.lg,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: colors.gray[200],
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.gray[900],
  },
  headerActions: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  addButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.primary.light,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContent: {
    padding: spacing.md,
    flexGrow: 1,
  },
  entryCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: spacing.lg,
    marginBottom: spacing.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  entryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.md,
  },
  entryMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  categoryEmoji: {
    fontSize: 32,
  },
  entryTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: colors.gray[900],
    marginBottom: 2,
  },
  entryDate: {
    fontSize: 14,
    color: colors.gray[500],
  },
  entryTypeBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.primary.light,
    justifyContent: 'center',
    alignItems: 'center',
  },
  photoContent: {
    marginBottom: spacing.md,
    position: 'relative',
  },
  entryPhoto: {
    width: '100%',
    height: 200,
    borderRadius: 8,
    resizeMode: 'cover',
  },
  photoCount: {
    position: 'absolute',
    top: spacing.sm,
    right: spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  photoCountText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  analysisSummary: {
    marginTop: spacing.sm,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  analysisSummaryText: {
    fontSize: 14,
    color: colors.gray[700],
    backgroundColor: colors.gray[100],
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: 8,
  },
  audioContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    padding: spacing.md,
    backgroundColor: colors.gray[50],
    borderRadius: 8,
    marginBottom: spacing.sm,
  },
  audioInfo: {
    flex: 1,
  },
  audioInfoText: {
    fontSize: 15,
    color: colors.gray[600],
  },
  transcriptionPreview: {
    fontSize: 15,
    color: colors.gray[700],
    lineHeight: 20,
  },
  entryNotes: {
    fontSize: 15,
    color: colors.gray[600],
    lineHeight: 20,
    marginBottom: spacing.sm,
  },
  relatedTasks: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginTop: spacing.sm,
  },
  relatedTasksText: {
    fontSize: 14,
    color: colors.success.main,
    fontWeight: '500',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.gray[900],
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
  },
  emptyText: {
    fontSize: 15,
    color: colors.gray[500],
    textAlign: 'center',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'white',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray[200],
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.gray[900],
  },
  modalContent: {
    flex: 1,
  },
});
