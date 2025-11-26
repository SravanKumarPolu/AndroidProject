/**
 * Location Tracking Service
 * Handles location permissions and tracking for impulses
 */

import { Platform } from 'react-native';
import { Alert } from 'react-native';

// Conditionally import expo-location only on native platforms
let Location: typeof import('expo-location') | null = null;
if (Platform.OS !== 'web') {
  try {
    Location = require('expo-location');
  } catch (error) {
    console.warn('expo-location not available:', error);
  }
}

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
  if (Platform.OS === 'web') {
    // On web, use browser geolocation API
    return new Promise((resolve) => {
      if (!navigator.geolocation) {
        Alert.alert(
          'Location Permission',
          'Geolocation is not supported by your browser.',
          [{ text: 'OK' }]
        );
        resolve(false);
        return;
      }
      
      navigator.geolocation.getCurrentPosition(
        () => resolve(true),
        () => {
          Alert.alert(
            'Location Permission',
            'Location permission is needed to track where you make impulse purchases. You can enable it later in settings.',
            [{ text: 'OK' }]
          );
          resolve(false);
        }
      );
    });
  }

  if (!Location) {
    return false;
  }

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
  if (Platform.OS === 'web') {
    // On web, check if geolocation is available
    return 'geolocation' in navigator;
  }

  if (!Location) {
    return false;
  }

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
  if (Platform.OS === 'web') {
    // Use browser geolocation API on web
    return new Promise((resolve) => {
      if (!navigator.geolocation) {
        resolve(null);
        return;
      }

      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          
          // Try to reverse geocode using a web API (optional)
          let address: string | undefined;
          let city: string | undefined;
          let country: string | undefined;

          try {
            // Using OpenStreetMap Nominatim API (free, no key required)
            const response = await fetch(
              `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`,
              {
                headers: {
                  'User-Agent': 'ImpulseVault/1.0.0',
                },
              }
            );
            const data = await response.json();
            if (data.address) {
              address = [
                data.address.road,
                data.address.house_number,
              ].filter(Boolean).join(', ');
              city = data.address.city || data.address.town || data.address.village;
              country = data.address.country;
            }
          } catch (geocodeError) {
            console.error('Error reverse geocoding:', geocodeError);
            // Continue without address
          }

          resolve({
            latitude,
            longitude,
            address,
            city,
            country,
            timestamp: Date.now(),
          });
        },
        (error) => {
          console.error('Error getting location:', error);
          resolve(null);
        },
        {
          enableHighAccuracy: false,
          timeout: 10000,
          maximumAge: 60000,
        }
      );
    });
  }

  if (!Location) {
    return null;
  }

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



