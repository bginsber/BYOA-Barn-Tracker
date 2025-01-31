import * as Calendar from 'expo-calendar';
import { Task } from '../types';

export const calendarService = {
  async addTaskToCalendar(task: Task) {
    const { status } = await Calendar.requestCalendarPermissionsAsync();
    if (status === 'granted') {
      // Get default calendar ID
      const calendars = await Calendar.getCalendarsAsync(Calendar.EntityTypes.EVENT);
      const defaultCalendar = calendars[0]; // Get first available calendar
      
      // Convert scheduledTime object to Date
      const startDate = new Date();
      startDate.setHours(task.scheduledTime?.hour || 0);
      startDate.setMinutes(task.scheduledTime?.minute || 0);
      
      return await Calendar.createEventAsync(defaultCalendar.id, {
        title: task.title,
        startDate,
        endDate: new Date(startDate.getTime() + 30 * 60000),
        alarms: [{ relativeOffset: -15 }]
      });
    }
  }
}; 