import * as Notifications from 'expo-notifications';
import * as TaskManager from 'expo-task-manager';
import { weatherService } from './weatherService';

export const notificationService = {
  async initialize() {
    await Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: true,
      }),
    });
  },

  async scheduleTaskNotification(task: Task, location: { latitude: number; longitude: number }) {
    if (!task.scheduledTime || !task.notifications?.enabled) return;

    let scheduledTime = new Date();
    scheduledTime.setHours(task.scheduledTime.hour);
    scheduledTime.setMinutes(task.scheduledTime.minute);

    if (task.scheduledTime.weatherDependent) {
      const weather = await weatherService.getCurrentWeather(location.latitude, location.longitude);
      
      // Adjust time based on weather conditions
      if (weather.condition === 'Rain' && task.scheduledTime.weatherConditions?.noRain) {
        scheduledTime.setHours(scheduledTime.getHours() + 2); // Delay by 2 hours
      }
    }

    return await Notifications.scheduleNotificationAsync({
      content: {
        title: task.title,
        body: task.description,
        sound: task.notifications.sound === 'alarm' ? 'alarm.wav' : 'default',
        data: { taskId: task.id },
      },
      trigger: {
        hour: scheduledTime.getHours(),
        minute: scheduledTime.getMinutes(),
        repeats: true,
      },
    });
  }
}; 