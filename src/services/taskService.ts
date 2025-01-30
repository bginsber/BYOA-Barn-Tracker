import { collection, addDoc, updateDoc, deleteDoc, doc, query, where, getDocs, orderBy, getDoc } from 'firebase/firestore';
import { db } from '../config/firebase';
import { Task, CompletionRecord } from '../types';

export const taskService = {
  async createTask(task: Omit<Task, 'id'>): Promise<string> {
    const docRef = await addDoc(collection(db, 'tasks'), task);
    return docRef.id;
  },

  async updateTask(taskId: string, updates: Partial<Task>): Promise<void> {
    const taskRef = doc(db, 'tasks', taskId);
    await updateDoc(taskRef, updates);
  },

  async deleteTask(taskId: string): Promise<void> {
    const taskRef = doc(db, 'tasks', taskId);
    await deleteDoc(taskRef);
  },

  async getTasks(userId: string): Promise<Task[]> {
    try {
      const tasksQuery = query(
        collection(db, 'tasks'),
        where('userId', '==', userId),
        orderBy('createdAt', 'desc')
      );
      
      const querySnapshot = await getDocs(tasksQuery);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Task));
    } catch (error) {
      console.error('Error fetching tasks:', error);
      return [];
    }
  },

  async toggleTaskCompletion(taskId: string, completed: boolean): Promise<void> {
    try {
      // Get direct reference to the document instead of querying
      const taskRef = doc(db, 'tasks', taskId);
      const taskDoc = await getDoc(taskRef);

      // Check if document exists
      if (!taskDoc.exists()) {
        console.error('No task found with the given ID:', taskId);
        return;
      }

      const task = taskDoc.data() as Task;
      const today = new Date().toISOString().split('T')[0];
      
      if (completed) {
        const lastCompletedDate = task.lastCompletedDate;
        const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
        
        // Calculate streak
        let newStreak = task.currentStreak || 0;
        if (!lastCompletedDate || lastCompletedDate === yesterday) {
          newStreak++;
        } else if (lastCompletedDate !== today) {
          newStreak = 1;
        }

        const completionRecord: CompletionRecord = {
          date: today,
          timestamp: Date.now()
        };

        await updateDoc(taskRef, {
          completed,
          completedAt: Date.now(),
          lastCompletedDate: today,
          currentStreak: newStreak,
          bestStreak: Math.max(newStreak, task.bestStreak || 0),
          completionHistory: [...(task.completionHistory || []), completionRecord]
        });
      } else {
        // If unchecking today's completion
        await updateDoc(taskRef, {
          completed,
          completedAt: null,
        });
      }
    } catch (error) {
      console.error('Error toggling task completion:', error);
      throw error; // Re-throw to handle in the component
    }
  },

  async getTaskHistory(taskId: string): Promise<CompletionRecord[]> {
    const taskDoc = await getDocs(query(collection(db, 'tasks'), where('id', '==', taskId)));
    const task = taskDoc.docs[0].data() as Task;
    return task.completionHistory || [];
  }
}; 