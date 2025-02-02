import React, { useEffect, useState } from 'react';
import { 
  View, 
  Text, 
  FlatList, 
  TouchableOpacity, 
  StyleSheet, 
  RefreshControl,
  Animated,
  Platform,
  ActivityIndicator,
  Alert
} from 'react-native';
import { Task } from '../types';
import { taskService } from '../services/taskService';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types';
import { useAuth } from '../hooks/useAuth';

export const HomeScreen = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();
  const [refreshing, setRefreshing] = useState(false);
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  const fetchTasks = async () => {
    try {
      setLoading(true);
      setError(null);
      
      if (!user) {
        console.log('❌ No authenticated user found in HomeScreen');
        setError('Please log in to view tasks');
        return;
      }

      console.log('🔄 HomeScreen: Fetching tasks for user:', user.uid);
      const fetchedTasks = await taskService.getTasks();
      console.log('✅ HomeScreen: Fetched tasks:', fetchedTasks.length);
      setTasks(fetchedTasks);
    } catch (err) {
      console.error('❌ HomeScreen: Error fetching tasks:', err);
      setError('Failed to load tasks. Please try again.');
      Alert.alert('Error', 'Failed to load tasks. Please try again.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    console.log('🔄 HomeScreen: Auth state changed:', user ? `User ${user.uid} present` : 'No user');
    if (user) {
      console.log('👤 HomeScreen: User authenticated, fetching tasks');
      fetchTasks();
    } else {
      console.log('⚠️ HomeScreen: No user authenticated');
      setTasks([]);
      setLoading(false);
    }
  }, [user]);

  const onRefresh = React.useCallback(async () => {
    setRefreshing(true);
    await fetchTasks();
    setRefreshing(false);
  }, []);

  const handleToggleTask = async (taskId: string, completed: boolean) => {
    if (!taskId) {
      console.error('Invalid task ID:', taskId);
      return; // Exit if taskId is invalid
    }

    try {
      await taskService.toggleTaskCompletion(taskId, !completed);
      await fetchTasks(); // Reload tasks after update
    } catch (error) {
      console.error('Error toggling task:', error);
    }
  };

  const getCategoryIcon = (category: string) => {
    const icons = {
      grooming: '🐎',
      feeding: '🥕',
      medical: '💊',
      maintenance: '🔧',
      other: '📝'
    } as { [key: string]: string };
    return icons[category] || '📝';
  };

  const renderTask = ({ item }: { item: Task }) => {
    return (
      <View style={styles.taskCard}>
        <TouchableOpacity 
          style={[styles.taskContainer, { pointerEvents: 'auto' }]}
          onPress={() => handleToggleTask(item.id, item.completed)}
          activeOpacity={0.7}
        >
          <View style={styles.checkboxContainer}>
            <Animated.View style={[
              styles.checkbox,
              item.completed && styles.checkedBox
            ]}>
              {item.completed && (
                <Ionicons name="checkmark" size={16} color="#fff" />
              )}
            </Animated.View>
          </View>
          
          <View style={styles.taskContent}>
            <View style={styles.taskHeader}>
              <Text style={[
                styles.taskTitle,
                item.completed && styles.completedText
              ]}>
                {item.title}
              </Text>
              {item.priority === 'high' && (
                <View style={styles.priorityBadge}>
                  <Ionicons name="flame" size={14} color="#fff" />
                </View>
              )}
            </View>
            
            <View style={styles.taskDetails}>
              <View style={styles.categoryTag}>
                <Text style={styles.categoryIcon}>
                  {getCategoryIcon(item.category)}
                </Text>
                <Text style={styles.categoryText}>
                  {item.category.charAt(0).toUpperCase() + item.category.slice(1)}
                </Text>
              </View>
              
              {item.lastCompletedDate && (
                <TouchableOpacity 
                  style={styles.timestampContainer}
                  onPress={() => navigation.navigate('TaskCalendar', { task: item })}
                >
                  <Ionicons name="calendar-outline" size={14} color="#6b7280" />
                  <Text style={styles.lastCompleted}>
                    Last: {new Date(item.lastCompletedDate).toLocaleDateString()}
                  </Text>
                </TouchableOpacity>
              )}
            </View>

            {item.description && (
              <Text style={styles.description} numberOfLines={2}>
                {item.description}
              </Text>
            )}
          </View>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.editButton}
          onPress={() => navigation.navigate('EditTask', { task: item })}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Ionicons name="ellipsis-horizontal" size={20} color="#6b7280" />
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Daily Tasks</Text>
      {loading && !refreshing ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#0000ff" />
          <Text style={styles.loadingText}>Loading tasks...</Text>
        </View>
      ) : error ? (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={fetchTasks}>
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      ) : tasks.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No tasks found</Text>
          <TouchableOpacity 
            style={styles.addButton}
            onPress={() => navigation.navigate('AddTask')}
          >
            <Text style={styles.addButtonText}>Add Your First Task</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={tasks}
          renderItem={renderTask}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.listContainer}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor="#007AFF"
            />
          }
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    fontSize: 28,
    fontWeight: '700',
    color: '#111827',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
  },
  listContainer: {
    padding: 16,
  },
  taskCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 12,
    ...Platform.select({
      ios: {
        boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.05)',
      },
      android: {
        elevation: 3,
        borderWidth: 1,
        borderColor: '#f0f0f0',
      },
      web: {
        boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.05)',
      }
    }),
  },
  taskContainer: {
    flexDirection: 'row',
    padding: 16,
    alignItems: 'flex-start',
  },
  checkboxContainer: {
    marginRight: 16,
    paddingTop: 2,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: '#4CAF50',
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkedBox: {
    backgroundColor: '#4CAF50',
  },
  taskContent: {
    flex: 1,
    marginRight: 24,
  },
  taskHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  taskTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    flex: 1,
    marginRight: 8,
  },
  completedText: {
    textDecorationLine: 'line-through',
    color: '#9ca3af',
  },
  priorityBadge: {
    backgroundColor: '#FF8C00',
    borderRadius: 12,
    padding: 4,
  },
  taskDetails: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 8,
  },
  categoryTag: {
    backgroundColor: '#f3f4f6',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
  },
  categoryIcon: {
    marginRight: 4,
    fontSize: 12,
  },
  categoryText: {
    fontSize: 12,
    color: '#4b5563',
    fontWeight: '500',
  },
  timestampContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  lastCompleted: {
    fontSize: 12,
    color: '#6b7280',
  },
  description: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 8,
    lineHeight: 20,
  },
  editButton: {
    position: 'absolute',
    right: 12,
    top: 12,
    padding: 4,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    color: '#ff0000',
    textAlign: 'center',
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 5,
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 16,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    fontSize: 18,
    color: '#666',
    marginBottom: 20,
  },
  addButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 5,
  },
  addButtonText: {
    color: '#fff',
    fontSize: 16,
  },
}); 