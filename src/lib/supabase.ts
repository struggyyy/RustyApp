import 'react-native-url-polyfill/auto';
import { createClient } from '@supabase/supabase-js';
import { isWeb, ENV, verifyEnvironment, logEnvironment } from '../config/env';
import storageAdapter from './storage';

// Log environment information
logEnvironment();

// Verify environment variables
verifyEnvironment();

console.log('[Supabase] Initializing Supabase client:', {
  hasUrl: !!ENV.SUPABASE_URL,
  isWeb: isWeb,
  detectSessionInUrl: isWeb,
});

// Create the Supabase client with platform-specific configuration
export const supabase = createClient(ENV.SUPABASE_URL, ENV.SUPABASE_KEY, {
  auth: {
    storage: storageAdapter,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: isWeb, // Only relevant for web
  },
});

// Test Supabase connection
(async () => {
  try {
    // Simple test query to check connection
    const { error } = await supabase.from('profiles').select('id').limit(1);
    if (error) {
      console.error('[Supabase] Connection test failed:', error.message);
    } else {
      console.log('[Supabase] Connection test successful');
    }
  } catch (err) {
    console.error('[Supabase] Connection error:', err);
  }
})(); 