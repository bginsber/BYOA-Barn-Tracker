/**
 * Audio Service
 *
 * Handles audio recording and transcription for voice journal entries
 * Uses expo-av for recording and OpenAI Whisper for transcription
 */

import { Audio } from 'expo-av';
import * as FileSystem from 'expo-file-system';
import { AudioTranscription, AudioTranscriptionRequest } from '../types/journal';

// OpenAI API configuration
const OPENAI_API_KEY = process.env.EXPO_PUBLIC_OPENAI_API_KEY || '';
const WHISPER_API_URL = 'https://api.openai.com/v1/audio/transcriptions';

/**
 * Audio recording manager
 */
class AudioRecorder {
  private recording: Audio.Recording | null = null;
  private isRecording = false;

  /**
   * Request audio recording permissions
   */
  async requestPermissions(): Promise<boolean> {
    try {
      const { status } = await Audio.requestPermissionsAsync();
      return status === 'granted';
    } catch (error) {
      console.error('Error requesting audio permissions:', error);
      return false;
    }
  }

  /**
   * Start audio recording
   */
  async startRecording(): Promise<void> {
    try {
      // Check permissions
      const hasPermission = await this.requestPermissions();
      if (!hasPermission) {
        throw new Error('Audio recording permission not granted');
      }

      // Configure audio mode
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      // Create and start recording
      const { recording } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY
      );

      this.recording = recording;
      this.isRecording = true;

      console.log('Audio recording started');
    } catch (error) {
      console.error('Error starting recording:', error);
      throw new Error('Failed to start audio recording');
    }
  }

  /**
   * Stop audio recording and return the file URI
   */
  async stopRecording(): Promise<{ uri: string; duration: number }> {
    try {
      if (!this.recording) {
        throw new Error('No active recording');
      }

      await this.recording.stopAndUnloadAsync();
      const uri = this.recording.getURI();
      const status = await this.recording.getStatusAsync();

      this.isRecording = false;
      this.recording = null;

      if (!uri) {
        throw new Error('Recording URI not available');
      }

      // Get duration in seconds
      const duration = status.isLoaded ? status.durationMillis / 1000 : 0;

      console.log('Audio recording stopped:', { uri, duration });

      return { uri, duration };
    } catch (error) {
      console.error('Error stopping recording:', error);
      this.recording = null;
      this.isRecording = false;
      throw new Error('Failed to stop audio recording');
    }
  }

  /**
   * Cancel current recording
   */
  async cancelRecording(): Promise<void> {
    if (this.recording) {
      try {
        await this.recording.stopAndUnloadAsync();
      } catch (error) {
        console.error('Error canceling recording:', error);
      }
      this.recording = null;
      this.isRecording = false;
    }
  }

  /**
   * Get current recording status
   */
  getIsRecording(): boolean {
    return this.isRecording;
  }

  /**
   * Get current recording duration in milliseconds
   */
  async getCurrentDuration(): Promise<number> {
    if (!this.recording) {
      return 0;
    }

    try {
      const status = await this.recording.getStatusAsync();
      return status.isLoaded ? status.durationMillis : 0;
    } catch (error) {
      console.error('Error getting recording duration:', error);
      return 0;
    }
  }
}

/**
 * Transcribe audio file using OpenAI Whisper API
 */
async function transcribeAudio(
  request: AudioTranscriptionRequest
): Promise<AudioTranscription> {
  try {
    if (!OPENAI_API_KEY) {
      throw new Error('OpenAI API key not configured');
    }

    // Read audio file
    const fileInfo = await FileSystem.getInfoAsync(request.audioUri);
    if (!fileInfo.exists) {
      throw new Error('Audio file not found');
    }

    // Create form data for API request
    const formData = new FormData();

    // Append the audio file
    const audioBlob = await fetch(request.audioUri).then(r => r.blob());
    formData.append('file', audioBlob, 'audio.m4a');
    formData.append('model', 'whisper-1');

    if (request.language) {
      formData.append('language', request.language);
    }

    // Request transcription from OpenAI
    const response = await fetch(WHISPER_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
      },
      body: formData,
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Whisper API error:', errorText);
      throw new Error(`Transcription failed: ${response.statusText}`);
    }

    const result = await response.json();

    const transcription: AudioTranscription = {
      text: result.text,
      transcribedAt: Date.now(),
      language: request.language || 'en',
    };

    // Optionally analyze content for task mentions
    if (request.analyzeContent) {
      const analysis = await analyzeTranscription(result.text);
      transcription.detectedTasks = analysis.detectedTasks;
      transcription.keywords = analysis.keywords;
      transcription.mentions = analysis.mentions;
    }

    return transcription;
  } catch (error) {
    console.error('Error transcribing audio:', error);
    throw new Error('Failed to transcribe audio');
  }
}

/**
 * Analyze transcription text for task mentions and entities
 * Uses AI to parse the transcription
 */
async function analyzeTranscription(text: string): Promise<{
  detectedTasks?: AudioTranscription['detectedTasks'];
  keywords?: string[];
  mentions?: AudioTranscription['mentions'];
}> {
  try {
    // Use Gemini to analyze the transcription
    const { GoogleGenerativeAI } = require('@google/generative-ai');
    const genAI = new GoogleGenerativeAI(process.env.EXPO_PUBLIC_GEMINI_API_KEY || '');
    const model = genAI.getGenerativeModel({ model: 'gemini-pro' });

    const prompt = `
Analyze this voice journal entry transcript and extract:

1. Any tasks mentioned (completed, to-do, or just discussed)
2. Keywords and main topics
3. Mentions of horses, people, or locations

Transcript: "${text}"

Format your response as JSON:
{
  "detectedTasks": [
    {
      "taskTitle": "task description",
      "action": "completed" | "added" | "mentioned",
      "confidence": 0.0-1.0
    }
  ],
  "keywords": ["keyword1", "keyword2"],
  "mentions": {
    "horses": ["horse names"],
    "people": ["person names"],
    "locations": ["location names"]
  }
}

Look for phrases like "I fed...", "I need to...", "completed...", "finished...", etc.
`;

    const result = await model.generateContent(prompt);
    const response = result.response;
    const responseText = response.text();

    // Parse JSON response
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const analysis = JSON.parse(jsonMatch[0]);
      return {
        detectedTasks: analysis.detectedTasks || [],
        keywords: analysis.keywords || [],
        mentions: analysis.mentions || {},
      };
    }

    return {};
  } catch (error) {
    console.error('Error analyzing transcription:', error);
    return {};
  }
}

/**
 * Play audio file
 */
async function playAudio(uri: string): Promise<Audio.Sound> {
  try {
    const { sound } = await Audio.Sound.createAsync({ uri });
    await sound.playAsync();
    return sound;
  } catch (error) {
    console.error('Error playing audio:', error);
    throw new Error('Failed to play audio');
  }
}

/**
 * Get audio file duration
 */
async function getAudioDuration(uri: string): Promise<number> {
  try {
    const { sound } = await Audio.Sound.createAsync({ uri });
    const status = await sound.getStatusAsync();
    await sound.unloadAsync();

    if (status.isLoaded) {
      return status.durationMillis / 1000; // Convert to seconds
    }
    return 0;
  } catch (error) {
    console.error('Error getting audio duration:', error);
    return 0;
  }
}

// Export singleton recorder instance
export const audioRecorder = new AudioRecorder();

export const audioService = {
  recorder: audioRecorder,
  transcribeAudio,
  playAudio,
  getAudioDuration,
};
