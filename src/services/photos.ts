import * as FileSystem from 'expo-file-system';
import * as ImagePicker from 'expo-image-picker';
import { manipulateAsync, SaveFormat } from 'expo-image-manipulator';

const PHOTOS_DIR = `${FileSystem.documentDirectory}impulse_photos/`;
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
    const dirInfo = await FileSystem.getInfoAsync(PHOTOS_DIR);
    if (!dirInfo.exists) {
      await FileSystem.makeDirectoryAsync(PHOTOS_DIR, { intermediates: true });
    }
  },

  /**
   * Request camera/media library permissions
   */
  async requestPermissions(): Promise<boolean> {
    const { status: cameraStatus } = await ImagePicker.requestCameraPermissionsAsync();
    const { status: mediaStatus } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
    return cameraStatus === 'granted' && mediaStatus === 'granted';
  },

  /**
   * Pick image from camera or library
   */
  async pickImage(source: 'camera' | 'library' = 'library'): Promise<string | null> {
    const hasPermission = await this.requestPermissions();
    if (!hasPermission) {
      throw new Error('Camera and media library permissions are required');
    }

    const options: ImagePicker.ImagePickerOptions = {
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1, // We'll compress manually
    };

    let result: ImagePicker.ImagePickerResult;

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
    try {
      await this.ensurePhotosDirectory();
      const files = await FileSystem.readDirectoryAsync(PHOTOS_DIR);
      
      const impulseFiles = files.filter(file => file.startsWith(impulseId));
      
      await Promise.all(
        impulseFiles.map(file => 
          FileSystem.deleteAsync(`${PHOTOS_DIR}${file}`, { idempotent: true })
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
          FileSystem.deleteAsync(`${PHOTOS_DIR}${file}`, { idempotent: true })
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
    try {
      await this.ensurePhotosDirectory();
      const files = await FileSystem.readDirectoryAsync(PHOTOS_DIR);
      
      await Promise.all(
        files.map(file =>
          FileSystem.deleteAsync(`${PHOTOS_DIR}${file}`, { idempotent: true })
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
    
    const fileInfo = await FileSystem.getInfoAsync(photoUri);
    return fileInfo.exists ? photoUri : null;
  },

  /**
   * Get total storage used by photos
   */
  async getPhotosStorageSize(): Promise<number> {
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

