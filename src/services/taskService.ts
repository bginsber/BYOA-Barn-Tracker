import { collection, addDoc, updateDoc, deleteDoc, doc, query, where, getDocs, orderBy, getDoc, Firestore } from 'firebase/firestore';
import { db, auth } from '../config/firebase';
import { Task, CompletionRecord } from '../types';

// Type assertion for db
const firestore: Firestore = db;

export const taskService = {
  async createTask(task: Omit<Task, 'id'>): Promise<string> {
    console.log('🔄 Creating task...');
    const user = auth.currentUser;
    if (!user) {
      console.error('❌ No authenticated user found');
      throw new Error('Must be logged in to create tasks');
    }

    console.log('👤 Creating task for user:', user.uid);

    const taskWithDefaults = {
      ...task,
      userId: user.uid,
      createdAt: Date.now(),
      completed: false,
      completionHistory: [],
      currentStreak: 0,
      bestStreak: 0,
      sharedWith: {},  // Initialize empty sharedWith map
    };

    console.log('Task with defaults:', taskWithDefaults);

    try {
      const docRef = await addDoc(collection(firestore, 'tasks'), taskWithDefaults);
      console.log('✅ Task created successfully with ID:', docRef.id);
      return docRef.id;
    } catch (error) {
      console.error('❌ Error creating task:', error);
      throw error;
    }
  },

  async getTasks(): Promise<Task[]> {
    console.log('🔄 Fetching tasks...');
    const user = auth.currentUser;
    if (!user) {
      console.error('❌ No authenticated user found');
      throw new Error('Must be logged in to fetch tasks');
    }

    console.log('👤 Fetching tasks for user:', user.uid);

    try {
      // Query for tasks where user is owner OR has shared access
      const userTasksQuery = query(
        collection(firestore, 'tasks'),
        where('userId', '==', user.uid),
        orderBy('createdAt', 'desc')
      );

      const sharedTasksQuery = query(
        collection(firestore, 'tasks'),
        where(`sharedWith.${user.uid}`, '==', true)
      );

      const [userTasksSnapshot, sharedTasksSnapshot] = await Promise.all([
        getDocs(userTasksQuery),
        getDocs(sharedTasksQuery)
      ]);

      const userTasks = userTasksSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Task));

      const sharedTasks = sharedTasksSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Task));

      const allTasks = [...userTasks, ...sharedTasks];
      console.log(`✅ Found ${allTasks.length} tasks (${userTasks.length} owned, ${sharedTasks.length} shared)`);

      return allTasks;
    } catch (error) {
      console.error('❌ Error fetching tasks:', error);
      throw error;
    }
  },

  async updateTask(taskId: string, updates: Partial<Task>): Promise<void> {
    const user = auth.currentUser;
    if (!user) throw new Error('Must be logged in to update tasks');

    try {
      const taskRef = doc(firestore, 'tasks', taskId);
      const taskDoc = await getDoc(taskRef);
      
      if (!taskDoc.exists()) throw new Error('Task not found');
      if (taskDoc.data()?.userId !== user.uid) throw new Error('Not authorized to update this task');
      
      const cleanUpdates = Object.entries(updates).reduce((acc, [key, value]) => {
        if (value !== undefined) {
          acc[key] = value;
        }
        return acc;
      }, {} as Record<string, any>);

      await updateDoc(taskRef, cleanUpdates);
    } catch (error) {
      console.error('Error updating task:', error);
      throw error;
    }
  },

  async deleteTask(taskId: string): Promise<void> {
    const user = auth.currentUser;
    if (!user) throw new Error('Must be logged in to delete tasks');

    try {
      const taskRef = doc(firestore, 'tasks', taskId);
      const taskDoc = await getDoc(taskRef);
      
      if (!taskDoc.exists()) throw new Error('Task not found');
      if (taskDoc.data()?.userId !== user.uid) throw new Error('Not authorized to delete this task');
      
      await deleteDoc(taskRef);
    } catch (error) {
      console.error('Error deleting task:', error);
      throw error;
    }
  },

  async toggleTaskCompletion(taskId: string, completed: boolean): Promise<void> {
    try {
      // Get direct reference to the document instead of querying
      const taskRef = doc(firestore, 'tasks', taskId);
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
    const taskDoc = await getDocs(query(collection(firestore, 'tasks'), where('id', '==', taskId)));
    const task = taskDoc.docs[0].data() as Task;
    return task.completionHistory || [];
  }
}; 