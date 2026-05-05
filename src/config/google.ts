export const GOOGLE_CONFIG = {
  // Web client ID (for Expo on web)
  clientId: process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID || '',

  // No client secret for web OAuth (PKCE is used instead)
  clientSecret: undefined,

  androidPackage: 'com.everythingreimbursable.app',
  iosBundleId: 'com.everythingreimbursable.app',

  scopes: [
    'https://www.googleapis.com/auth/drive.file',
    'https://www.googleapis.com/auth/drive.readonly',
    'https://www.googleapis.com/auth/userinfo.email',
    'https://www.googleapis.com/auth/userinfo.profile'
  ],

  driveFolderName: 'EverythingReimbursable'
}
