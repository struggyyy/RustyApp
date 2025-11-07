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

// React specific imports
import { useEffect } from 'react';
import { Platform } from 'react-native';

// External libraries
import { useRouter } from 'expo-router';
import * as Linking from 'expo-linking';

// Internal imports
import { useAuth } from '../../context/AuthContext';

export const useDeepLinking = () => {
  const { handleSignInWithLink } = useAuth();
  const router = useRouter();

  // Set up deep linking event listeners for non-web platforms
  useEffect(() => {
    // Handle different types of deep link URLs
    const handleDeepLink = (event: { url: string }) => {
      // Process authentication action links (e.g., email verification)
      if (event.url.includes('__/auth/action')) {
        handleSignInWithLink(event.url);
      // Process password recovery/reset links
      } else if (event.url.includes('type=recovery') || event.url.includes('reset-password')) {
        const token = event.url.split('token=')[1]?.split('&')[0] || '';
        if (token) {
          router.navigate(`/reset-password?token=${token}`);
        }
      }
    };

    // Initialize deep linking on app start and listen for events
    if (Platform.OS !== 'web') {
      Linking.getInitialURL().then((url) => {
        if (url) handleDeepLink({ url });
      });
      const subscription = Linking.addEventListener('url', handleDeepLink);
      // Clean up the event listener on unmount
      return () => {
        subscription.remove();
      };
    }
  }, [handleSignInWithLink, router]);
};
