import { Platform } from 'react-native';
import Constants from 'expo-constants';

// Enable or disable debug mode
export const DEBUG = process.env.NODE_ENV !== 'production';

// Environment detection
export const isWeb = Platform.OS === 'web';
export const isNative = !isWeb;
export const isIOS = Platform.OS === 'ios';
export const isAndroid = Platform.OS === 'android';

// Environment variables with fallbacks
export const ENV = {
  SUPABASE_URL: Constants.expoConfig?.extra?.supabaseUrl 
    || process.env.EXPO_PUBLIC_SUPABASE_URL 
    || '',
  SUPABASE_KEY: Constants.expoConfig?.extra?.supabaseKey 
    || process.env.EXPO_PUBLIC_SUPABASE_KEY 
    || '',
};

// Verify required environment variables exist
export const verifyEnvironment = () => {
  const missingVars = [];
  
  if (!ENV.SUPABASE_URL) missingVars.push('SUPABASE_URL');
  if (!ENV.SUPABASE_KEY) missingVars.push('SUPABASE_KEY');
  
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
  console.log(`SUPABASE_URL: ${ENV.SUPABASE_URL ? 'Set' : 'Missing'}`);
  console.log(`SUPABASE_KEY: ${ENV.SUPABASE_KEY ? 'Set' : 'Missing'}`);
}; 