interface BlanketingAlert {
  horseId: string;
  currentTemp: number;
  recommendation: 'add' | 'remove' | null;
  timestamp: Date;
}

export class WeatherAlertService {
  private async checkBlanketing(horse: Horse, weather: WeatherData): Promise<BlanketingAlert> {
    const recommendation = await calculateBlanketing({
      temp: weather.temperature,
      horseAge: horse.age,
      horseWeight: horse.weight,
      coatCondition: horse.coatCondition
    });
    
    return {
      horseId: horse.id,
      currentTemp: weather.temperature,
      recommendation,
      timestamp: new Date()
    };
  }

  public async monitorWeatherChanges() {
    // Implementation in next sprint
  }
} 