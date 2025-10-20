/**
 * Audio Journal Entry Component
 *
 * Allows users to record voice notes with AI transcription
 * Supports task detection and keyword extraction
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { audioService } from '../services/audioService';
import { AudioTranscription } from '../types/journal';
import { colors } from '../theme/colors';
import { spacing } from '../theme/spacing';

interface AudioJournalEntryProps {
  onAudioAdded: (uri: string, duration: number, transcription?: AudioTranscription) => void;
  autoTranscribe?: boolean;
  analyzeContent?: boolean;
}

export const AudioJournalEntry: React.FC<AudioJournalEntryProps> = ({
  onAudioAdded,
  autoTranscribe = true,
  analyzeContent = true,
}) => {
  const [isRecording, setIsRecording] = useState(false);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [audioUri, setAudioUri] = useState<string | null>(null);
  const [audioDuration, setAudioDuration] = useState(0);
  const [transcription, setTranscription] = useState<AudioTranscription | null>(null);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);

  // Update recording duration timer
  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (isRecording) {
      interval = setInterval(async () => {
        const duration = await audioService.recorder.getCurrentDuration();
        setRecordingDuration(Math.floor(duration / 1000));
      }, 100);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isRecording]);

  /**
   * Start recording audio
   */
  const startRecording = async () => {
    try {
      await audioService.recorder.startRecording();
      setIsRecording(true);
      setRecordingDuration(0);
      setAudioUri(null);
      setTranscription(null);
    } catch (error) {
      console.error('Error starting recording:', error);
      Alert.alert('Error', 'Failed to start recording. Please check permissions.');
    }
  };

  /**
   * Stop recording audio
   */
  const stopRecording = async () => {
    try {
      const { uri, duration } = await audioService.recorder.stopRecording();
      setIsRecording(false);
      setAudioUri(uri);
      setAudioDuration(duration);

      // Auto-transcribe if enabled
      if (autoTranscribe) {
        await transcribeAudio(uri);
      } else {
        onAudioAdded(uri, duration);
      }
    } catch (error) {
      console.error('Error stopping recording:', error);
      Alert.alert('Error', 'Failed to stop recording');
    }
  };

  /**
   * Cancel recording
   */
  const cancelRecording = async () => {
    try {
      await audioService.recorder.cancelRecording();
      setIsRecording(false);
      setRecordingDuration(0);
    } catch (error) {
      console.error('Error canceling recording:', error);
    }
  };

  /**
   * Transcribe audio using AI
   */
  const transcribeAudio = async (uri: string) => {
    setIsTranscribing(true);
    try {
      const result = await audioService.transcribeAudio({
        audioUri: uri,
        analyzeContent,
      });

      setTranscription(result);
      onAudioAdded(uri, audioDuration, result);
    } catch (error) {
      console.error('Error transcribing audio:', error);
      Alert.alert(
        'Transcription Error',
        'Failed to transcribe audio. You can still save the recording.'
      );
      onAudioAdded(uri, audioDuration);
    } finally {
      setIsTranscribing(false);
    }
  };

  /**
   * Play audio recording
   */
  const playAudio = async () => {
    if (!audioUri) return;

    try {
      setIsPlaying(true);
      const sound = await audioService.playAudio(audioUri);

      sound.setOnPlaybackStatusUpdate((status) => {
        if (status.isLoaded && status.didJustFinish) {
          setIsPlaying(false);
        }
      });
    } catch (error) {
      console.error('Error playing audio:', error);
      Alert.alert('Error', 'Failed to play audio');
      setIsPlaying(false);
    }
  };

  /**
   * Clear current recording
   */
  const clearRecording = () => {
    setAudioUri(null);
    setAudioDuration(0);
    setTranscription(null);
  };

  /**
   * Format duration as MM:SS
   */
  const formatDuration = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <View style={styles.container}>
      {!audioUri ? (
        <View style={styles.recordingContainer}>
          {isRecording ? (
            <>
              <View style={styles.recordingIndicator}>
                <View style={styles.pulsingDot} />
                <Text style={styles.recordingText}>Recording...</Text>
              </View>

              <Text style={styles.durationText}>
                {formatDuration(recordingDuration)}
              </Text>

              <View style={styles.recordingActions}>
                <TouchableOpacity
                  style={[styles.recordButton, styles.cancelButton]}
                  onPress={cancelRecording}
                >
                  <Ionicons name="close" size={32} color="white" />
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.recordButton, styles.stopButton]}
                  onPress={stopRecording}
                >
                  <Ionicons name="stop" size={32} color="white" />
                </TouchableOpacity>
              </View>
            </>
          ) : (
            <TouchableOpacity
              style={[styles.recordButton, styles.startButton]}
              onPress={startRecording}
            >
              <Ionicons name="mic" size={48} color="white" />
              <Text style={styles.startButtonText}>Tap to Record</Text>
            </TouchableOpacity>
          )}
        </View>
      ) : (
        <View style={styles.playbackContainer}>
          <View style={styles.audioInfo}>
            <Ionicons name="musical-notes" size={32} color={colors.primary.main} />
            <Text style={styles.audioInfoText}>
              Audio Recording ({formatDuration(Math.floor(audioDuration))})
            </Text>
          </View>

          <View style={styles.playbackActions}>
            <TouchableOpacity
              style={styles.iconButton}
              onPress={playAudio}
              disabled={isPlaying}
            >
              <Ionicons
                name={isPlaying ? 'pause' : 'play'}
                size={32}
                color={isPlaying ? colors.gray[400] : colors.primary.main}
              />
            </TouchableOpacity>

            <TouchableOpacity style={styles.iconButton} onPress={clearRecording}>
              <Ionicons name="trash" size={28} color={colors.error.main} />
            </TouchableOpacity>
          </View>

          {isTranscribing && (
            <View style={styles.transcribingContainer}>
              <ActivityIndicator size="small" color={colors.primary.main} />
              <Text style={styles.transcribingText}>Transcribing...</Text>
            </View>
          )}

          {transcription && !isTranscribing && (
            <ScrollView style={styles.transcriptionContainer}>
              <Text style={styles.transcriptionTitle}>Transcription</Text>

              <View style={styles.transcriptionBox}>
                <Text style={styles.transcriptionText}>{transcription.text}</Text>
              </View>

              {/* Detected tasks */}
              {transcription.detectedTasks && transcription.detectedTasks.length > 0 && (
                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>Detected Tasks:</Text>
                  {transcription.detectedTasks.map((task, index) => (
                    <View key={index} style={styles.taskItem}>
                      <Ionicons
                        name={
                          task.action === 'completed'
                            ? 'checkmark-circle'
                            : task.action === 'added'
                            ? 'add-circle'
                            : 'information-circle'
                        }
                        size={20}
                        color={
                          task.action === 'completed'
                            ? colors.success.main
                            : colors.primary.main
                        }
                      />
                      <Text style={styles.taskText}>
                        {task.taskTitle} ({task.action})
                      </Text>
                    </View>
                  ))}
                </View>
              )}

              {/* Keywords */}
              {transcription.keywords && transcription.keywords.length > 0 && (
                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>Keywords:</Text>
                  <View style={styles.keywordsContainer}>
                    {transcription.keywords.map((keyword, index) => (
                      <View key={index} style={styles.keyword}>
                        <Text style={styles.keywordText}>{keyword}</Text>
                      </View>
                    ))}
                  </View>
                </View>
              )}

              {/* Mentions */}
              {transcription.mentions && (
                <View style={styles.section}>
                  {transcription.mentions.horses &&
                    transcription.mentions.horses.length > 0 && (
                      <>
                        <Text style={styles.sectionTitle}>Horses Mentioned:</Text>
                        <Text style={styles.mentionText}>
                          {transcription.mentions.horses.join(', ')}
                        </Text>
                      </>
                    )}
                  {transcription.mentions.people &&
                    transcription.mentions.people.length > 0 && (
                      <>
                        <Text style={styles.sectionTitle}>People Mentioned:</Text>
                        <Text style={styles.mentionText}>
                          {transcription.mentions.people.join(', ')}
                        </Text>
                      </>
                    )}
                </View>
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
  recordingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
  },
  recordingIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  pulsingDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: colors.error.main,
    marginRight: spacing.sm,
  },
  recordingText: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.gray[900],
  },
  durationText: {
    fontSize: 48,
    fontWeight: 'bold',
    color: colors.primary.main,
    marginBottom: spacing.xl,
    fontVariant: ['tabular-nums'],
  },
  recordingActions: {
    flexDirection: 'row',
    gap: spacing.lg,
  },
  recordButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  startButton: {
    backgroundColor: colors.primary.main,
    width: 120,
    height: 120,
    borderRadius: 60,
  },
  startButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    marginTop: spacing.sm,
  },
  stopButton: {
    backgroundColor: colors.error.main,
  },
  cancelButton: {
    backgroundColor: colors.gray[500],
  },
  playbackContainer: {
    flex: 1,
    padding: spacing.lg,
  },
  audioInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.lg,
    backgroundColor: 'white',
    borderRadius: 12,
    marginBottom: spacing.md,
  },
  audioInfoText: {
    marginLeft: spacing.md,
    fontSize: 16,
    fontWeight: '600',
    color: colors.gray[900],
  },
  playbackActions: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: spacing.xl,
    marginBottom: spacing.lg,
  },
  iconButton: {
    padding: spacing.md,
  },
  transcribingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.lg,
    backgroundColor: colors.gray[100],
    borderRadius: 8,
  },
  transcribingText: {
    marginLeft: spacing.sm,
    fontSize: 15,
    color: colors.gray[700],
  },
  transcriptionContainer: {
    flex: 1,
    backgroundColor: 'white',
    borderRadius: 12,
    padding: spacing.lg,
  },
  transcriptionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.gray[900],
    marginBottom: spacing.md,
  },
  transcriptionBox: {
    padding: spacing.md,
    backgroundColor: colors.gray[50],
    borderRadius: 8,
    marginBottom: spacing.lg,
  },
  transcriptionText: {
    fontSize: 15,
    lineHeight: 22,
    color: colors.gray[700],
  },
  section: {
    marginBottom: spacing.lg,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.gray[700],
    marginBottom: spacing.sm,
  },
  taskItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.xs,
    gap: spacing.sm,
  },
  taskText: {
    fontSize: 15,
    color: colors.gray[700],
  },
  keywordsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  keyword: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    backgroundColor: colors.primary.light,
    borderRadius: 16,
  },
  keywordText: {
    fontSize: 14,
    color: colors.primary.main,
    fontWeight: '500',
  },
  mentionText: {
    fontSize: 15,
    color: colors.gray[600],
    marginBottom: spacing.sm,
  },
});
