import { Weather } from '../services/weatherService';

export interface Horse {
  hairLength: 'clipped' | 'short' | 'medium' | 'long';
  age: number;
}

export const calculateBlanketing = (horse: Horse, weather: Weather) => {
  const baseTemp = 60; // Fahrenheit
  let blanketNeeded = false;
  
  if (weather.temperature < baseTemp) {
    if (horse.hairLength === 'clipped') {
      blanketNeeded = true;
    } else if (horse.age > 20) {
      blanketNeeded = true;
    }
  }
  
  return {
    blanketNeeded,
    blanketWeight: blanketNeeded ? 'medium' : 'none'
  };
}; 