/** *************************************************************************
 *                                                                         *
 *                       Copyright (c) 2025, @struggyyy                    *
 *                                                                         *
 *                             Project: Rusty                              *
 *                                                                         *
 *                         All Rights Reserved                             *
 *                                                                         *
 *         This is unpublished proprietary source code of @struggyyy.      *
 *        The copyright notice above does not evidence any actual          *
 *              or intended publication of such source code.               *
 *                                                                         *
 ************************************************************************** */
// React-specific imports
import { useState } from "react";

// External libraries
import * as ImagePicker from "expo-image-picker";

// Internal imports
import { IS_MOCK_MODE, MOCK_REPORT_IMAGE_URL } from "@/config/mockConfig";

// Configuration options for image picker
interface ImagePickerOptions {
  aspect?: [number, number];
  quality?: number;
  allowsEditing?: boolean;
}

export const useImagePicker = () => {
  const [imageUri, setImageUri] = useState<string | null>(null);

  // Pick image from camera or gallery with configurable options
  const pickImage = async (
    useCamera: boolean,
    options: ImagePickerOptions = {},
  ) => {
    // MOCK MODE: Bypass native picker to prevent crashes/reloads during demo
    // and force the requested VW Bus image.
    if (IS_MOCK_MODE) {
      setImageUri(MOCK_REPORT_IMAGE_URL);
      return;
    }

    // Default configuration
    const {
      aspect = [4, 3], // Default aspect ratio
      quality = 0.5, // Default quality
      allowsEditing = true,
    } = options;

    // Choose picker type
    const action = useCamera
      ? ImagePicker.launchCameraAsync
      : ImagePicker.launchImageLibraryAsync;

    // Launch picker with configuration
    const result = await action({
      allowsEditing,
      aspect,
      quality,
    });

    // Update state if image was selected
    if (!result.canceled) {
      setImageUri(result.assets[0].uri);
    }
  };

  // Clear selected image
  const handleCancelImage = () => {
    setImageUri(null);
  };

  return {
    imageUri,
    pickImage,
    handleCancelImage,
  };
};
