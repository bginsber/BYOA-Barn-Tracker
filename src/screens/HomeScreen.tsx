import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, RefreshControl } from 'react-native';
import { Task } from '../types';
import { taskService } from '../services/taskService';
// import { useAuth } from '../hooks/useAuth'; // We'll create this later

export const HomeScreen = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  // const { user, loading } = useAuth();

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

  const renderTask = ({ item }: { item: Task }) => {
    // Log the taskId to verify it's being passed correctly
    console.log('Rendering task with ID:', item.id);

    return (
      <TouchableOpacity 
        style={styles.taskItem}
        onPress={() => handleToggleTask(item.id, item.completed)}
      >
        <View style={[styles.checkbox, item.completed && styles.checked]} />
        <View style={styles.taskContent}>
          <View style={styles.taskHeader}>
            <Text style={[
              styles.taskTitle,
              item.completed && styles.completedText
            ]}>
              {item.title}
            </Text>
            {item.currentStreak > 0 && (
              <View style={styles.streakContainer}>
                <Text style={styles.streakText}>🔥 {item.currentStreak}</Text>
              </View>
            )}
          </View>
          <View style={styles.taskDetails}>
            <Text style={styles.taskCategory}>{item.category}</Text>
            {item.lastCompletedDate && (
              <Text style={styles.lastCompleted}>
                Last completed: {new Date(item.lastCompletedDate).toLocaleDateString()}
              </Text>
            )}
          </View>
        </View>
      </TouchableOpacity>
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
        <Text style={styles.emptyText}>No tasks yet. Add some tasks to get started!</Text>
      ) : (
        <FlatList
          data={tasks}
          renderItem={renderTask}
          keyExtractor={item => item.id}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
            />
          }
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#fff',
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  taskItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#666',
    marginRight: 12,
  },
  checked: {
    backgroundColor: '#4CAF50',
    borderColor: '#4CAF50',
  },
  taskContent: {
    flex: 1,
  },
  taskHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  streakContainer: {
    backgroundColor: '#FFE4B5',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  streakText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#FF8C00',
  },
  taskDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 4,
  },
  taskTitle: {
    fontSize: 16,
    fontWeight: '500',
  },
  completedText: {
    textDecorationLine: 'line-through',
    color: '#666',
  },
  taskCategory: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 20,
    color: '#666',
  },
  lastCompleted: {
    fontSize: 12,
    color: '#666',
  },
}); 