import React, { useState, useCallback } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView,
  KeyboardAvoidingView,
  Platform 
} from 'react-native';
import { Task, CompletionRecord } from '../types';
import { Calendar, MarkedDates } from 'react-native-calendars';
import { Ionicons } from '@expo/vector-icons';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types';

type Props = NativeStackScreenProps<RootStackParamList, 'TaskCalendar'>;

export const TaskCalendarScreen: React.FC<Props> = ({ route }) => {
  const { task } = route.params;
  const [selectedDate, setSelectedDate] = useState('');

  // Process completion history into calendar marking format
  const getMarkedDates = useCallback(() => {
    const markedDates: MarkedDates = {};
    
    // Add completion records
    task.completionHistory.forEach((record: CompletionRecord) => {
      markedDates[record.date] = {
        marked: true,
        selected: record.date === selectedDate,
        selectedColor: '#4CAF50',
        dotColor: '#4CAF50',
        startingDay: true,
        endingDay: true,
        color: '#4CAF50'
      };
    });

    // Add streak dates
    if (task.currentStreak > 0) {
      // Create a new array instead of modifying the original
      const streakDates = [...task.completionHistory]
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
        .slice(0, task.currentStreak);

      streakDates.forEach((record, index) => {
        const isFirst = index === 0;
        const isLast = index === streakDates.length - 1;

        markedDates[record.date] = {
          ...markedDates[record.date],
          startingDay: isFirst,
          endingDay: isLast,
          color: '#E8F5E9',
        };
      });
    }

    return markedDates;
  }, [task.completionHistory, selectedDate, task.currentStreak]);

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView style={styles.scrollView}>
        <View style={styles.header}>
          <Text style={styles.taskTitle}>{task.title}</Text>
          <View style={styles.statsContainer}>
            <View style={styles.statItem}>
              <Ionicons name="flame" size={24} color="#FF8C00" />
              <Text style={styles.statText}>Current Streak: {task.currentStreak}</Text>
            </View>
            <View style={styles.statItem}>
              <Ionicons name="trophy" size={24} color="#FFD700" />
              <Text style={styles.statText}>Best Streak: {task.bestStreak}</Text>
            </View>
          </View>
        </View>

        <View style={styles.calendarCard}>
          <Calendar
            style={styles.calendar}
            theme={{
              backgroundColor: '#ffffff',
              calendarBackground: '#ffffff',
              textSectionTitleColor: '#6b7280',
              selectedDayBackgroundColor: '#4CAF50',
              selectedDayTextColor: '#ffffff',
              todayTextColor: '#4CAF50',
              dayTextColor: '#1f2937',
              textDisabledColor: '#d1d5db',
              dotColor: '#4CAF50',
              selectedDotColor: '#ffffff',
              arrowColor: '#4CAF50',
              monthTextColor: '#1f2937',
              textDayFontWeight: '400',
              textMonthFontWeight: '600',
              textDayHeaderFontWeight: '500',
              textDayFontSize: 16,
              textMonthFontSize: 16,
              textDayHeaderFontSize: 14
            }}
            markedDates={getMarkedDates()}
            onDayPress={(day) => setSelectedDate(day.dateString)}
            enableSwipeMonths={true}
            markingType="period"
          />
        </View>

        <View style={styles.legend}>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: '#4CAF50' }]} />
            <Text style={styles.legendText}>Completed</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: '#E8F5E9' }]} />
            <Text style={styles.legendText}>Streak</Text>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  scrollView: {
    flex: 1,
  },
  header: {
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  taskTitle: {
    fontSize: 24,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 16,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 8,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f9fafb',
    padding: 12,
    borderRadius: 12,
    minWidth: 160,
  },
  statText: {
    marginLeft: 8,
    fontSize: 16,
    color: '#4b5563',
    fontWeight: '500',
  },
  calendarCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    margin: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  calendar: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  legend: {
    flexDirection: 'row',
    justifyContent: 'center',
    padding: 16,
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 16,
  },
  legendDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 8,
  },
  legendText: {
    color: '#6b7280',
    fontSize: 14,
    fontWeight: '500',
  },
}); 