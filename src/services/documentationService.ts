import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system';
import { storage } from '../config/firebase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

export const documentationService = {
  async uploadTaskPhoto(taskId: string) {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      throw new Error('Permission denied');
    }

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.8,
      allowsEditing: true,
    });

    if (!result.canceled) {
      const response = await fetch(result.assets[0].uri);
      const blob = await response.blob();
      
      const storageRef = ref(storage, `task-photos/${taskId}/${Date.now()}.jpg`);
      await uploadBytes(storageRef, blob);
      return await getDownloadURL(storageRef);
    }
  },
  
  async exportData(dateRange: { start: Date; end: Date }, format: 'CSV' | 'PDF' | 'JSON') {
    const data = await this.fetchTaskData(dateRange);
    
    switch (format) {
      case 'CSV':
        return this.generateCSV(data);
      case 'PDF':
        return this.generatePDF(data);
      case 'JSON':
        return JSON.stringify(data, null, 2);
    }
  }
}; 