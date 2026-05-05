import * as ImagePicker from 'expo-image-picker';
import { useState } from 'react';
import { Alert } from 'react-native';

interface ImageState {
  uri: string;
  base64: string;
}

export function useImagePicker() {
  const [image, setImage] = useState<ImageState | null>(null);

  const PICKER_OPTIONS: ImagePicker.ImagePickerOptions = {
    mediaTypes: ImagePicker.MediaTypeOptions.Images,
    quality: 0.4,
    allowsEditing: true,
    aspect: [4, 3] as [number, number],
    base64: true,
    exif: false,
  };

  const pickFromCamera = async () => {
    try {
      const permResult = await ImagePicker.requestCameraPermissionsAsync();
      if (!permResult.granted) {
        if (!permResult.canAskAgain) {
          Alert.alert(
            'PERMISO REQUERIDO',
            'Debes habilitar el acceso a la cámara en Configuración del sistema.',
          );
        }
        return;
      }
      const result = await ImagePicker.launchCameraAsync(PICKER_OPTIONS);
      if (result.canceled) return;
      const asset = result.assets[0];
      const mime = asset.mimeType ?? 'image/jpeg';
      setImage({ uri: asset.uri, base64: `data:${mime};base64,${asset.base64}` });
    } catch {
      // silently handle errors to prevent crashes
    }
  };

  const pickFromGallery = async () => {
    try {
      const permResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permResult.granted) {
        if (!permResult.canAskAgain) {
          Alert.alert(
            'PERMISO REQUERIDO',
            'Debes habilitar el acceso a la galería en Configuración del sistema.',
          );
        }
        return;
      }
      const result = await ImagePicker.launchImageLibraryAsync(PICKER_OPTIONS);
      if (result.canceled) return;
      const asset = result.assets[0];
      const mime = asset.mimeType ?? 'image/jpeg';
      setImage({ uri: asset.uri, base64: `data:${mime};base64,${asset.base64}` });
    } catch {
      // silently handle errors to prevent crashes
    }
  };

  const clearImage = () => setImage(null);

  return { pickFromCamera, pickFromGallery, image, clearImage };
}
