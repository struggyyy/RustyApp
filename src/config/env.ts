import { Platform } from 'react-native';
import Constants from 'expo-constants';

// Enable or disable debug mode
export const DEBUG = process.env.NODE_ENV !== 'production';

// Environment detection
export const isWeb = Platform.OS === 'web';
export const isNative = !isWeb;
export const isIOS = Platform.OS === 'ios';
export const isAndroid = Platform.OS === 'android';

// Define the shape of your environment variables
interface EnvironmentVariables {
  NODE_ENV: string;
  // Firebase vars removed as config is now hardcoded in firebase.ts
  // FIREBASE_API_KEY: string | undefined;
  // FIREBASE_AUTH_DOMAIN: string | undefined;
  // FIREBASE_PROJECT_ID: string | undefined;
  // FIREBASE_STORAGE_BUCKET: string | undefined;
  // FIREBASE_MESSAGING_SENDER_ID: string | undefined;
  // FIREBASE_APP_ID: string | undefined;
  // FIREBASE_MEASUREMENT_ID?: string | undefined;
}

// Load environment variables from Expo config (app.config.js or app.json) extra field
// and fall back to process.env for broader compatibility (e.g., web, testing)
const ENV: EnvironmentVariables = {
  NODE_ENV: process.env.NODE_ENV || 'development',
  // Firebase vars removed
};

// Validate essential variables
const validateEnv = () => {
  const missingVars: string[] = [];
  // Firebase checks removed
  // if (!ENV.FIREBASE_API_KEY) missingVars.push('FIREBASE_API_KEY');
  // ... other firebase checks

  // Check only for NODE_ENV now if needed, or remove validation if only NODE_ENV remains
  if (!ENV.NODE_ENV) missingVars.push('NODE_ENV');


  if (missingVars.length > 0) {
    console.warn(
      `[ENV Validation] Missing environment variables: ${missingVars.join(', ')}. `
      // Update warning message if applicable
    );
    // Optional: throw an error in production if critical vars are missing
  }

  // Log status (optional, for debugging)
  console.log('[ENV Status] Environment variables loaded:');
  console.log(`NODE_ENV: ${ENV.NODE_ENV}`);
  // Firebase logs removed
};

validateEnv();

export { ENV };

// Verify required environment variables exist
export const verifyEnvironment = () => {
  const missingVars = [];
  
  if (!ENV.NODE_ENV) missingVars.push('NODE_ENV');
  
  if (missingVars.length > 0) {
    console.error(`Missing environment variables: ${missingVars.join(', ')}`);
    return false;
  }
  
  return true;
};

// Log environment for debugging
export const logEnvironment = () => {
  if (!DEBUG) return;
  
  console.log(`Environment: ${isWeb ? 'Web' : 'Native'}`);
  if (isNative) {
    console.log(`Platform: ${Platform.OS}`);
  }
  
  // Only log that variables exist, not their values for security
  console.log(`NODE_ENV: ${ENV.NODE_ENV ? 'Set' : 'Missing'}`);
  // Firebase logs removed
}; 