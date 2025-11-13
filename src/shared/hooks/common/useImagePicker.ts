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

export const useImagePicker = () => {
  const [imageUri, setImageUri] = useState<string | null>(null);

  // Image picker functions
  const pickImage = async (useCamera: boolean) => {
    const action = useCamera
      ? ImagePicker.launchCameraAsync
      : ImagePicker.launchImageLibraryAsync;

    const result = await action({
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.5,
    });

    if (!result.canceled) {
      setImageUri(result.assets[0].uri);
    }
  };

  const handleCancelImage = () => {
    setImageUri(null);
  };

  return {
    imageUri,
    pickImage,
    handleCancelImage,
  };
};
