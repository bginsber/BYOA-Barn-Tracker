export const blanketingService = {
  calculateBlanketing(horse: Horse, weather: Weather) {
    const factors = {
      age: this.calculateAgeFactor(horse.age),
      weight: this.calculateWeightFactor(horse.weight),
      coat: this.calculateCoatFactor(horse.hairLength),
      weather: this.calculateWeatherFactor(weather)
    };
    
    const blanketingScore = Object.values(factors).reduce((sum, factor) => sum + factor, 0);
    
    return {
      blanketNeeded: blanketingScore > 7,
      blanketWeight: this.determineBlanketWeight(blanketingScore),
      factors: factors
    };
  },
  
  calculateAgeFactor(age: number): number {
    if (age > 20) return 3;
    if (age > 15) return 2;
    return 1;
  },
  
  calculateWeightFactor(weight: number): number {
    if (weight < 800) return 3;
    if (weight < 1000) return 2;
    return 1;
  },
  
  calculateCoatFactor(hairLength: Horse['hairLength']): number {
    const factors = {
      clipped: 4,
      short: 3,
      medium: 2,
      long: 1
    };
    return factors[hairLength];
  },
  
  calculateWeatherFactor(weather: Weather): number {
    let factor = 0;
    if (weather.temperature < 32) factor += 4;
    else if (weather.temperature < 45) factor += 3;
    else if (weather.temperature < 60) factor += 2;
    
    if (weather.precipitation > 0) factor += 1;
    if (weather.windSpeed > 15) factor += 1;
    
    return factor;
  },
  
  determineBlanketWeight(score: number): 'none' | 'light' | 'medium' | 'heavy' {
    if (score > 12) return 'heavy';
    if (score > 7) return 'medium';
    if (score > 5) return 'light';
    return 'none';
  }
}; 