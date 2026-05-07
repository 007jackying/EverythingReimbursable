export const GOOGLE_CONFIG = {
  // Web client ID — from Google Cloud Console → OAuth 2.0 → Web client
  // Used by Android and for Drive API token exchange
  webClientId: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID || '',

  // iOS client ID — from Google Cloud Console → OAuth 2.0 → iOS client
  // Required for native iOS Sign-In
  iosClientId: process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID || '',

  androidPackage: 'com.everythingreimbursable.app',
  iosBundleId: 'com.everythingreimbursable.app',

  // Scopes for Google Drive access
  scopes: [
    'https://www.googleapis.com/auth/drive.file',
    'https://www.googleapis.com/auth/drive.readonly'
  ],

  driveFolderName: 'EverythingReimbursable'
}
