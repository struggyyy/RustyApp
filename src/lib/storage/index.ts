/**
 * Storage Adapter index
 * 
 * This file exports the appropriate storage adapter based on the current platform.
 */

import { isWeb } from '../../config/env';
import webStorageAdapter from './webStorage';
import nativeStorageAdapter from './nativeStorage';

// Export the appropriate storage adapter based on platform
const storageAdapter = isWeb ? webStorageAdapter : nativeStorageAdapter;

export default storageAdapter; 