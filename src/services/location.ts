/**
 * Location Tracking Service
 * Handles location permissions and tracking for impulses
 */

import * as Location from 'expo-location';
import { Alert } from 'react-native';

export interface LocationData {
  latitude: number;
  longitude: number;
  address?: string;
  city?: string;
  country?: string;
  timestamp: number;
}

/**
 * Request location permissions
 */
export async function requestLocationPermissions(): Promise<boolean> {
  try {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert(
        'Location Permission',
        'Location permission is needed to track where you make impulse purchases. You can enable it later in settings.',
        [{ text: 'OK' }]
      );
      return false;
    }
    return true;
  } catch (error) {
    console.error('Error requesting location permission:', error);
    return false;
  }
}

/**
 * Check if location permissions are granted
 */
export async function hasLocationPermissions(): Promise<boolean> {
  try {
    const { status } = await Location.getForegroundPermissionsAsync();
    return status === 'granted';
  } catch (error) {
    console.error('Error checking location permission:', error);
    return false;
  }
}

/**
 * Get current location
 */
export async function getCurrentLocation(): Promise<LocationData | null> {
  try {
    const hasPermission = await hasLocationPermissions();
    if (!hasPermission) {
      const granted = await requestLocationPermissions();
      if (!granted) {
        return null;
      }
    }

    const location = await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.Balanced,
    });

    // Reverse geocode to get address
    let address: string | undefined;
    let city: string | undefined;
    let country: string | undefined;

    try {
      const reverseGeocode = await Location.reverseGeocodeAsync({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      });

      if (reverseGeocode.length > 0) {
        const addr = reverseGeocode[0];
        address = [
          addr.street,
          addr.streetNumber,
          addr.district,
        ].filter(Boolean).join(', ');
        city = addr.city || addr.subregion || undefined;
        country = addr.country || undefined;
      }
    } catch (geocodeError) {
      console.error('Error reverse geocoding:', geocodeError);
      // Continue without address
    }

    return {
      latitude: location.coords.latitude,
      longitude: location.coords.longitude,
      address,
      city,
      country,
      timestamp: Date.now(),
    };
  } catch (error) {
    console.error('Error getting location:', error);
    return null;
  }
}

/**
 * Calculate distance between two locations (in km)
 */
export function calculateDistance(
  loc1: LocationData,
  loc2: LocationData
): number {
  const R = 6371; // Earth's radius in km
  const dLat = (loc2.latitude - loc1.latitude) * (Math.PI / 180);
  const dLon = (loc2.longitude - loc1.longitude) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(loc1.latitude * (Math.PI / 180)) *
      Math.cos(loc2.latitude * (Math.PI / 180)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

/**
 * Format location for display
 */
export function formatLocation(location: LocationData | null | undefined): string {
  if (!location) return 'Location not available';
  
  if (location.address) {
    return location.address;
  }
  
  if (location.city) {
    return `${location.city}${location.country ? `, ${location.country}` : ''}`;
  }
  
  return `${location.latitude.toFixed(4)}, ${location.longitude.toFixed(4)}`;
}



