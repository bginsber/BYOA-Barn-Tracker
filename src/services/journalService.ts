/**
 * Journal Service
 *
 * Firebase operations for journal entries
 * Handles CRUD operations, media upload, and queries
 */

import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  query,
  where,
  getDocs,
  orderBy,
  getDoc,
  Firestore,
  Timestamp,
  limit as firestoreLimit,
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { db, auth, storage } from '../config/firebase';
import {
  JournalEntry,
  CreateJournalEntryInput,
  JournalPhoto,
  JournalAudio,
  JournalQueryFilters,
  JournalStats,
  PhotoAnalysis,
  AudioTranscription,
} from '../types/journal';

// Type assertion for db
const firestore: Firestore = db;

/**
 * Upload photo to Firebase Storage
 */
async function uploadPhoto(
  uri: string,
  entryId: string,
  photoId: string
): Promise<string> {
  try {
    const response = await fetch(uri);
    const blob = await response.blob();

    const filename = `${photoId}_${Date.now()}.jpg`;
    const storageRef = ref(storage, `journal-photos/${entryId}/${filename}`);

    await uploadBytes(storageRef, blob);
    const downloadURL = await getDownloadURL(storageRef);

    return downloadURL;
  } catch (error) {
    console.error('Error uploading photo:', error);
    throw new Error('Failed to upload photo');
  }
}

/**
 * Upload audio to Firebase Storage
 */
async function uploadAudio(
  uri: string,
  entryId: string,
  audioId: string
): Promise<string> {
  try {
    const response = await fetch(uri);
    const blob = await response.blob();

    const filename = `${audioId}_${Date.now()}.m4a`;
    const storageRef = ref(storage, `journal-audio/${entryId}/${filename}`);

    await uploadBytes(storageRef, blob);
    const downloadURL = await getDownloadURL(storageRef);

    return downloadURL;
  } catch (error) {
    console.error('Error uploading audio:', error);
    throw new Error('Failed to upload audio');
  }
}

/**
 * Delete photo from Firebase Storage
 */
async function deletePhoto(photoUrl: string): Promise<void> {
  try {
    const photoRef = ref(storage, photoUrl);
    await deleteObject(photoRef);
  } catch (error) {
    console.error('Error deleting photo:', error);
    // Don't throw - file might already be deleted
  }
}

/**
 * Delete audio from Firebase Storage
 */
async function deleteAudio(audioUrl: string): Promise<void> {
  try {
    const audioRef = ref(storage, audioUrl);
    await deleteObject(audioRef);
  } catch (error) {
    console.error('Error deleting audio:', error);
    // Don't throw - file might already be deleted
  }
}

export const journalService = {
  /**
   * Create a new journal entry
   */
  async createEntry(input: CreateJournalEntryInput): Promise<string> {
    console.log('🔄 Creating journal entry...');
    const user = auth.currentUser;
    if (!user) {
      console.error('❌ No authenticated user found');
      throw new Error('Must be logged in to create journal entries');
    }

    const entry: Omit<JournalEntry, 'id'> = {
      userId: user.uid,
      type: input.type,
      category: input.category,
      title: input.title,
      notes: input.notes,
      photos: [],
      audio: [],
      createdAt: Date.now(),
      updatedAt: Date.now(),
      entryDate: input.entryDate || Date.now(),
      relatedTasks: input.relatedTasks || [],
      tags: input.tags || [],
      isPrivate: input.isPrivate || false,
    };

    try {
      const docRef = await addDoc(collection(firestore, 'journal'), entry);
      console.log('✅ Journal entry created with ID:', docRef.id);
      return docRef.id;
    } catch (error) {
      console.error('❌ Error creating journal entry:', error);
      throw error;
    }
  },

  /**
   * Add photo to journal entry
   */
  async addPhoto(
    entryId: string,
    photoUri: string,
    analysis?: PhotoAnalysis
  ): Promise<JournalPhoto> {
    const user = auth.currentUser;
    if (!user) throw new Error('Must be logged in');

    try {
      // Generate photo ID
      const photoId = `photo_${Date.now()}`;

      // Upload photo to storage
      const photoUrl = await uploadPhoto(photoUri, entryId, photoId);

      // Create photo object
      const photo: JournalPhoto = {
        id: photoId,
        url: photoUrl,
        localUri: photoUri,
        analysis,
        uploadedAt: Date.now(),
        analysisStatus: analysis ? 'completed' : 'pending',
      };

      // Update entry with new photo
      const entryRef = doc(firestore, 'journal', entryId);
      const entryDoc = await getDoc(entryRef);

      if (!entryDoc.exists()) throw new Error('Journal entry not found');
      if (entryDoc.data()?.userId !== user.uid) {
        throw new Error('Not authorized to update this entry');
      }

      const currentPhotos = entryDoc.data()?.photos || [];
      await updateDoc(entryRef, {
        photos: [...currentPhotos, photo],
        updatedAt: Date.now(),
      });

      console.log('✅ Photo added to journal entry');
      return photo;
    } catch (error) {
      console.error('❌ Error adding photo:', error);
      throw error;
    }
  },

  /**
   * Add audio to journal entry
   */
  async addAudio(
    entryId: string,
    audioUri: string,
    duration: number,
    transcription?: AudioTranscription
  ): Promise<JournalAudio> {
    const user = auth.currentUser;
    if (!user) throw new Error('Must be logged in');

    try {
      // Generate audio ID
      const audioId = `audio_${Date.now()}`;

      // Upload audio to storage
      const audioUrl = await uploadAudio(audioUri, entryId, audioId);

      // Create audio object
      const audio: JournalAudio = {
        id: audioId,
        url: audioUrl,
        localUri: audioUri,
        duration,
        transcription,
        uploadedAt: Date.now(),
        transcriptionStatus: transcription ? 'completed' : 'pending',
      };

      // Update entry with new audio
      const entryRef = doc(firestore, 'journal', entryId);
      const entryDoc = await getDoc(entryRef);

      if (!entryDoc.exists()) throw new Error('Journal entry not found');
      if (entryDoc.data()?.userId !== user.uid) {
        throw new Error('Not authorized to update this entry');
      }

      const currentAudio = entryDoc.data()?.audio || [];
      await updateDoc(entryRef, {
        audio: [...currentAudio, audio],
        updatedAt: Date.now(),
      });

      console.log('✅ Audio added to journal entry');
      return audio;
    } catch (error) {
      console.error('❌ Error adding audio:', error);
      throw error;
    }
  },

  /**
   * Update photo analysis
   */
  async updatePhotoAnalysis(
    entryId: string,
    photoId: string,
    analysis: PhotoAnalysis
  ): Promise<void> {
    const user = auth.currentUser;
    if (!user) throw new Error('Must be logged in');

    try {
      const entryRef = doc(firestore, 'journal', entryId);
      const entryDoc = await getDoc(entryRef);

      if (!entryDoc.exists()) throw new Error('Journal entry not found');
      if (entryDoc.data()?.userId !== user.uid) {
        throw new Error('Not authorized to update this entry');
      }

      const photos = entryDoc.data()?.photos || [];
      const updatedPhotos = photos.map((photo: JournalPhoto) =>
        photo.id === photoId
          ? { ...photo, analysis, analysisStatus: 'completed' }
          : photo
      );

      await updateDoc(entryRef, {
        photos: updatedPhotos,
        updatedAt: Date.now(),
      });

      console.log('✅ Photo analysis updated');
    } catch (error) {
      console.error('❌ Error updating photo analysis:', error);
      throw error;
    }
  },

  /**
   * Update audio transcription
   */
  async updateAudioTranscription(
    entryId: string,
    audioId: string,
    transcription: AudioTranscription
  ): Promise<void> {
    const user = auth.currentUser;
    if (!user) throw new Error('Must be logged in');

    try {
      const entryRef = doc(firestore, 'journal', entryId);
      const entryDoc = await getDoc(entryRef);

      if (!entryDoc.exists()) throw new Error('Journal entry not found');
      if (entryDoc.data()?.userId !== user.uid) {
        throw new Error('Not authorized to update this entry');
      }

      const audioFiles = entryDoc.data()?.audio || [];
      const updatedAudio = audioFiles.map((audio: JournalAudio) =>
        audio.id === audioId
          ? { ...audio, transcription, transcriptionStatus: 'completed' }
          : audio
      );

      await updateDoc(entryRef, {
        audio: updatedAudio,
        updatedAt: Date.now(),
      });

      console.log('✅ Audio transcription updated');
    } catch (error) {
      console.error('❌ Error updating audio transcription:', error);
      throw error;
    }
  },

  /**
   * Get journal entries with filters
   */
  async getEntries(filters?: JournalQueryFilters): Promise<JournalEntry[]> {
    console.log('🔄 Fetching journal entries...');
    const user = auth.currentUser;
    if (!user) {
      console.error('❌ No authenticated user found');
      throw new Error('Must be logged in to fetch journal entries');
    }

    try {
      let q = query(
        collection(firestore, 'journal'),
        where('userId', '==', user.uid),
        orderBy('entryDate', 'desc')
      );

      // Apply filters
      if (filters?.types && filters.types.length > 0) {
        q = query(q, where('type', 'in', filters.types));
      }

      if (filters?.categories && filters.categories.length > 0) {
        q = query(q, where('category', 'in', filters.categories));
      }

      if (filters?.startDate) {
        q = query(q, where('entryDate', '>=', filters.startDate));
      }

      if (filters?.endDate) {
        q = query(q, where('entryDate', '<=', filters.endDate));
      }

      if (filters?.relatedTaskId) {
        q = query(q, where('relatedTasks', 'array-contains', filters.relatedTaskId));
      }

      const snapshot = await getDocs(q);
      const entries = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as JournalEntry[];

      console.log(`✅ Found ${entries.length} journal entries`);
      return entries;
    } catch (error) {
      console.error('❌ Error fetching journal entries:', error);
      throw error;
    }
  },

  /**
   * Get single journal entry
   */
  async getEntry(entryId: string): Promise<JournalEntry | null> {
    const user = auth.currentUser;
    if (!user) throw new Error('Must be logged in');

    try {
      const entryRef = doc(firestore, 'journal', entryId);
      const entryDoc = await getDoc(entryRef);

      if (!entryDoc.exists()) return null;
      if (entryDoc.data()?.userId !== user.uid) {
        throw new Error('Not authorized to view this entry');
      }

      return { id: entryDoc.id, ...entryDoc.data() } as JournalEntry;
    } catch (error) {
      console.error('❌ Error fetching journal entry:', error);
      throw error;
    }
  },

  /**
   * Update journal entry
   */
  async updateEntry(
    entryId: string,
    updates: Partial<JournalEntry>
  ): Promise<void> {
    const user = auth.currentUser;
    if (!user) throw new Error('Must be logged in');

    try {
      const entryRef = doc(firestore, 'journal', entryId);
      const entryDoc = await getDoc(entryRef);

      if (!entryDoc.exists()) throw new Error('Journal entry not found');
      if (entryDoc.data()?.userId !== user.uid) {
        throw new Error('Not authorized to update this entry');
      }

      await updateDoc(entryRef, {
        ...updates,
        updatedAt: Date.now(),
      });

      console.log('✅ Journal entry updated');
    } catch (error) {
      console.error('❌ Error updating journal entry:', error);
      throw error;
    }
  },

  /**
   * Delete journal entry
   */
  async deleteEntry(entryId: string): Promise<void> {
    const user = auth.currentUser;
    if (!user) throw new Error('Must be logged in');

    try {
      const entryRef = doc(firestore, 'journal', entryId);
      const entryDoc = await getDoc(entryRef);

      if (!entryDoc.exists()) throw new Error('Journal entry not found');
      if (entryDoc.data()?.userId !== user.uid) {
        throw new Error('Not authorized to delete this entry');
      }

      const entry = entryDoc.data() as JournalEntry;

      // Delete associated media files
      if (entry.photos) {
        await Promise.all(entry.photos.map((photo) => deletePhoto(photo.url)));
      }

      if (entry.audio) {
        await Promise.all(entry.audio.map((audio) => deleteAudio(audio.url)));
      }

      // Delete entry
      await deleteDoc(entryRef);

      console.log('✅ Journal entry deleted');
    } catch (error) {
      console.error('❌ Error deleting journal entry:', error);
      throw error;
    }
  },

  /**
   * Get journal statistics
   */
  async getStats(): Promise<JournalStats> {
    const user = auth.currentUser;
    if (!user) throw new Error('Must be logged in');

    try {
      const entries = await this.getEntries();

      const stats: JournalStats = {
        totalEntries: entries.length,
        entriesByType: {
          photo: 0,
          audio: 0,
          combined: 0,
          note: 0,
        },
        entriesByCategory: {
          feeding: 0,
          care: 0,
          medical: 0,
          training: 0,
          maintenance: 0,
          observation: 0,
          other: 0,
        },
        totalPhotos: 0,
        totalAudioRecordings: 0,
        recentActivity: [],
      };

      // Calculate statistics
      entries.forEach((entry) => {
        stats.entriesByType[entry.type]++;
        stats.entriesByCategory[entry.category]++;
        stats.totalPhotos += entry.photos?.length || 0;
        stats.totalAudioRecordings += entry.audio?.length || 0;
      });

      return stats;
    } catch (error) {
      console.error('❌ Error getting journal stats:', error);
      throw error;
    }
  },
};
