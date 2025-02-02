import * as Location from 'expo-location';

export interface LocationCoordinates {
  latitude: number;
  longitude: number;
}

const CLEWS_RANCH_COORDINATES: LocationCoordinates = {
  latitude: 32.9427,
  longitude: -117.1837,
};

class LocationService {
  private lastKnownLocation: LocationCoordinates = CLEWS_RANCH_COORDINATES;

  async getCurrentLocation(): Promise<LocationCoordinates> {
    return CLEWS_RANCH_COORDINATES;
  }

  async startLocationUpdates(onLocationUpdate: (location: LocationCoordinates) => void) {
    // Immediately return the fixed location
    onLocationUpdate(CLEWS_RANCH_COORDINATES);
    
    // Return a no-op cleanup function
    return {
      remove: () => {}
    };
  }

  stopLocationUpdates() {
    // No-op since we're using fixed coordinates
  }

  getLastKnownLocation(): LocationCoordinates {
    return CLEWS_RANCH_COORDINATES;
  }
}

export const locationService = new LocationService(); 