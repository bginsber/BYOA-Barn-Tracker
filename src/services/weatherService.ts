import { WEATHER_API_KEY } from '@env';

export interface Weather {
  temperature: number;
  condition: string;
  windSpeed: number;
  precipitation: number;
  humidity: number;
}

export const weatherService = {
  async getCurrentWeather(latitude: number, longitude: number): Promise<Weather> {
    try {
      const response = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=${WEATHER_API_KEY}&units=imperial`
      );
      const data = await response.json();
      
      return {
        temperature: data.main.temp,
        condition: data.weather[0].main,
        windSpeed: data.wind.speed,
        precipitation: data.rain?.['1h'] || 0,
        humidity: data.main.humidity
      };
    } catch (error) {
      console.error('Error fetching weather:', error);
      throw error;
    }
  }
}; 