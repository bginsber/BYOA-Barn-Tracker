import React, { useEffect, useState } from 'react';
import { 
  View, 
  Text, 
  FlatList, 
  TouchableOpacity, 
  StyleSheet, 
  RefreshControl,
  Animated,
  Platform
} from 'react-native';
import { Task } from '../types';
import { taskService } from '../services/taskService';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types';
// import { useAuth } from '../hooks/useAuth'; // We'll create this later

export const HomeScreen = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  // const { user, loading } = useAuth();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  useEffect(() => {
    loadTasks(); // Initial load
    
    const intervalId = setInterval(() => {
      loadTasks();
    }, 30000); // 30 seconds

    // Cleanup interval on component unmount
    return () => clearInterval(intervalId);
  }, []);

  const loadTasks = async () => {
    try {
      const fetchedTasks = await taskService.getTasks('dummyUserId');
      setTasks(fetchedTasks);
    } catch (error) {
      console.error('Error loading tasks:', error);
    }
  };

  const onRefresh = React.useCallback(async () => {
    setRefreshing(true);
    await loadTasks();
    setRefreshing(false);
  }, []);

  const handleToggleTask = async (taskId: string, completed: boolean) => {
    if (!taskId) {
      console.error('Invalid task ID:', taskId);
      return; // Exit if taskId is invalid
    }

    try {
      await taskService.toggleTaskCompletion(taskId, !completed);
      await loadTasks(); // Reload tasks after update
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
          style={styles.taskContainer}
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

  // if (loading) {
  //   return (
  //     <View style={styles.container}>
  //       <Text>Loading...</Text>
  //     </View>
  //   );
  // }

  // if (!user) {
  //   return (
  //     <View style={styles.container}>
  //       <Text>Please log in to view tasks</Text>
  //     </View>
  //   );
  // }

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Daily Tasks</Text>
      {tasks.length === 0 ? (
        <View style={styles.emptyState}>
          <Ionicons name="list" size={48} color="#d1d5db" />
          <Text style={styles.emptyText}>No tasks yet</Text>
          <Text style={styles.emptySubtext}>
            Add some tasks to get started with your barn routine
          </Text>
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
    backgroundColor: '#f8f9fa',
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
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
    borderWidth: Platform.OS === 'ios' ? 0 : 1,
    borderColor: Platform.OS === 'ios' ? undefined : '#f0f0f0',
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
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#6b7280',
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#9ca3af',
    textAlign: 'center',
    marginTop: 8,
  },
}); 