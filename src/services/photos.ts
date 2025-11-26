import { Platform } from 'react-native';

// Conditionally import native modules only on native platforms
let FileSystem: typeof import('expo-file-system') | null = null;
let ImagePicker: typeof import('expo-image-picker') | null = null;
let manipulateAsync: typeof import('expo-image-manipulator').manipulateAsync | null = null;
let SaveFormat: typeof import('expo-image-manipulator').SaveFormat | null = null;

if (Platform.OS !== 'web') {
  try {
    FileSystem = require('expo-file-system');
    ImagePicker = require('expo-image-picker');
    const ImageManipulator = require('expo-image-manipulator');
    manipulateAsync = ImageManipulator.manipulateAsync;
    SaveFormat = ImageManipulator.SaveFormat;
  } catch (error) {
    console.warn('Native image modules not available:', error);
  }
}

const PHOTOS_DIR = Platform.OS === 'web' ? '' : `${FileSystem?.documentDirectory || ''}impulse_photos/`;
const MAX_IMAGE_SIZE = 1920; // Max width/height in pixels
const COMPRESSION_QUALITY = 0.8; // 80% quality

/**
 * Photo Service
 * Efficient image management with compression and cleanup
 */
export const photos = {
  /**
   * Initialize photos directory
   */
  async ensurePhotosDirectory(): Promise<void> {
    if (Platform.OS === 'web') {
      // On web, we use IndexedDB or localStorage for file storage
      // No directory creation needed
      return;
    }

    if (!FileSystem) {
      return;
    }

    const dirInfo = await FileSystem.getInfoAsync(PHOTOS_DIR);
    if (!dirInfo.exists) {
      await FileSystem.makeDirectoryAsync(PHOTOS_DIR, { intermediates: true });
    }
  },

  /**
   * Request camera/media library permissions
   */
  async requestPermissions(): Promise<boolean> {
    if (Platform.OS === 'web') {
      // On web, file input doesn't require permissions
      return true;
    }

    if (!ImagePicker) {
      return false;
    }

    const { status: cameraStatus } = await ImagePicker.requestCameraPermissionsAsync();
    const { status: mediaStatus } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
    return cameraStatus === 'granted' && mediaStatus === 'granted';
  },

  /**
   * Pick image from camera or library
   */
  async pickImage(source: 'camera' | 'library' = 'library'): Promise<string | null> {
    if (Platform.OS === 'web') {
      // On web, use file input
      return new Promise((resolve) => {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = 'image/*';
        if (source === 'camera' && 'capture' in input) {
          (input as any).capture = 'environment';
        }
        
        input.onchange = (e) => {
          const file = (e.target as HTMLInputElement).files?.[0];
          if (!file) {
            resolve(null);
            return;
          }

          // Create object URL for the selected file
          const objectUrl = URL.createObjectURL(file);
          resolve(objectUrl);
        };

        input.oncancel = () => {
          resolve(null);
        };

        input.click();
      });
    }

    if (!ImagePicker) {
      throw new Error('Image picker not available');
    }

    const hasPermission = await this.requestPermissions();
    if (!hasPermission) {
      throw new Error('Camera and media library permissions are required');
    }

    const options: any = {
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1, // We'll compress manually
    };

    let result: any;

    if (source === 'camera') {
      result = await ImagePicker.launchCameraAsync(options);
    } else {
      result = await ImagePicker.launchImageLibraryAsync(options);
    }

    if (result.canceled || !result.assets || result.assets.length === 0) {
      return null;
    }

    const asset = result.assets[0];
    return asset.uri;
  },

  /**
   * Save and compress image for an impulse
   * Returns the local file URI
   */
  async savePhotoForImpulse(impulseId: string, imageUri: string): Promise<string> {
    if (Platform.OS === 'web') {
      // On web, store image in IndexedDB or return blob URL
      // For now, return the blob URL as-is (could be enhanced with IndexedDB storage)
      return imageUri;
    }

    if (!FileSystem || !manipulateAsync || !SaveFormat) {
      throw new Error('File system or image manipulator not available');
    }

    await this.ensurePhotosDirectory();

    // Compress and resize image
    const manipulatedImage = await manipulateAsync(
      imageUri,
      [
        {
          resize: {
            width: MAX_IMAGE_SIZE,
            height: MAX_IMAGE_SIZE,
          },
        },
      ],
      {
        compress: COMPRESSION_QUALITY,
        format: SaveFormat.JPEG,
      }
    );

    // Generate unique filename
    const filename = `${impulseId}_${Date.now()}.jpg`;
    const destinationUri = `${PHOTOS_DIR}${filename}`;

    // Copy compressed image to our directory
    await FileSystem.copyAsync({
      from: manipulatedImage.uri,
      to: destinationUri,
    });

    return destinationUri;
  },

  /**
   * Delete photo for an impulse
   */
  async deletePhoto(photoUri: string): Promise<void> {
    if (Platform.OS === 'web') {
      // On web, revoke blob URL if it's a blob URL
      if (photoUri.startsWith('blob:')) {
        URL.revokeObjectURL(photoUri);
      }
      return;
    }

    if (!FileSystem) {
      return;
    }

    try {
      const fileInfo = await FileSystem.getInfoAsync(photoUri);
      if (fileInfo.exists) {
        await FileSystem.deleteAsync(photoUri, { idempotent: true });
      }
    } catch (error) {
      console.error('Error deleting photo:', error);
      // Don't throw - photo might already be deleted
    }
  },

  /**
   * Delete all photos for an impulse
   */
  async deleteImpulsePhotos(impulseId: string): Promise<void> {
    if (Platform.OS === 'web') {
      // On web, photos are stored as blob URLs in the data
      // They'll be cleaned up when the impulse is deleted
      return;
    }

    if (!FileSystem) {
      return;
    }

    if (!FileSystem) {
      return;
    }

    try {
      await this.ensurePhotosDirectory();
      const files = await FileSystem.readDirectoryAsync(PHOTOS_DIR);
      
      const impulseFiles = files.filter(file => file.startsWith(impulseId));
      
      await Promise.all(
        impulseFiles.map(file => 
          FileSystem!.deleteAsync(`${PHOTOS_DIR}${file}`, { idempotent: true })
        )
      );
    } catch (error) {
      console.error('Error deleting impulse photos:', error);
    }
  },

  /**
   * Clean up orphaned photos (photos without corresponding impulses)
   */
  async cleanupOrphanedPhotos(impulseIds: string[]): Promise<void> {
    if (Platform.OS === 'web') {
      // On web, photos are managed differently
      return;
    }

    if (!FileSystem) {
      return;
    }

    if (!FileSystem) {
      return;
    }

    try {
      await this.ensurePhotosDirectory();
      const files = await FileSystem.readDirectoryAsync(PHOTOS_DIR);
      
      const orphanedFiles = files.filter(file => {
        // Extract impulse ID from filename (format: impulseId_timestamp.jpg)
        const impulseId = file.split('_')[0];
        return !impulseIds.includes(impulseId);
      });

      await Promise.all(
        orphanedFiles.map(file =>
          FileSystem!.deleteAsync(`${PHOTOS_DIR}${file}`, { idempotent: true })
        )
      );
    } catch (error) {
      console.error('Error cleaning up orphaned photos:', error);
    }
  },

  /**
   * Delete all photos (used when clearing all data)
   */
  async deleteAllPhotos(): Promise<void> {
    if (Platform.OS === 'web') {
      // On web, photos are managed differently
      return;
    }

    if (!FileSystem) {
      return;
    }

    try {
      await this.ensurePhotosDirectory();
      const files = await FileSystem.readDirectoryAsync(PHOTOS_DIR);
      
      await Promise.all(
        files.map(file =>
          FileSystem!.deleteAsync(`${PHOTOS_DIR}${file}`, { idempotent: true })
        )
      );
    } catch (error) {
      console.error('Error deleting all photos:', error);
      // Don't throw - photos directory might not exist or already be empty
    }
  },

  /**
   * Get photo URI (returns local URI if exists)
   */
  async getPhotoUri(photoUri: string | undefined): Promise<string | null> {
    if (!photoUri) return null;
    
    if (Platform.OS === 'web') {
      // On web, return blob URL as-is
      return photoUri;
    }

    if (!FileSystem) {
      return null;
    }

    const fileInfo = await FileSystem.getInfoAsync(photoUri);
    return fileInfo.exists ? photoUri : null;
  },

  /**
   * Get total storage used by photos
   */
  async getPhotosStorageSize(): Promise<number> {
    if (Platform.OS === 'web') {
      // On web, storage calculation would require IndexedDB API
      // For now, return 0
      return 0;
    }

    if (!FileSystem) {
      return 0;
    }

    try {
      await this.ensurePhotosDirectory();
      const files = await FileSystem.readDirectoryAsync(PHOTOS_DIR);
      
      let totalSize = 0;
      for (const file of files) {
        const fileInfo = await FileSystem.getInfoAsync(`${PHOTOS_DIR}${file}`);
        if (fileInfo.exists && 'size' in fileInfo) {
          totalSize += fileInfo.size || 0;
        }
      }
      
      return totalSize;
    } catch (error) {
      console.error('Error calculating photos storage:', error);
      return 0;
    }
  },
};

