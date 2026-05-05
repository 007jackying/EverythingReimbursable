# Google OAuth Setup Guide

## Current Configuration

Your Google OAuth Client ID: `312494219215-pm05tu8q22qo6ggvchf2jki6lbtbfdtc.apps.googleusercontent.com`

## Issue

The error `400: invalid_request - flowName=GeneralOAuthFlow` indicates that your redirect URI is not authorized in Google Cloud Console.

## Solution

### Step 1: Get the Redirect URI

1. Start the app: `npx expo start --web`
2. Open browser console (F12)
3. Look for: `Google OAuth Redirect URI: <URI>`
4. Copy this URI

### Step 2: Add Redirect URI to Google Cloud Console

1. Go to [Google Cloud Console](https://console.cloud.google.com/apis/credentials)
2. Select your project
3. Find your OAuth 2.0 Client ID: `312494219215-pm05tu8q22qo6ggvchf2jki6lbtbfdtc.apps.googleusercontent.com`
4. Click Edit
5. Under "Authorized redirect URIs", add:
   - For web: `http://localhost:8081/oauth-callback` (or the URI from console)
   - For production: Your production URL
6. Click Save

### Step 3: Configure OAuth Consent Screen

1. Go to [OAuth Consent Screen](https://console.cloud.google.com/apis/credentials/consent)
2. Make sure your app is configured
3. Add the scopes:
   - `https://www.googleapis.com/auth/drive.file`
   - `https://www.googleapis.com/auth/drive.readonly`
   - `https://www.googleapis.com/auth/userinfo.email`
   - `https://www.googleapis.com/auth/userinfo.profile`

### Step 4: Test

1. Restart the app
2. Try Google Sign-In again
3. It should now work

## Common Redirect URIs for Expo

- **Web (localhost):** `http://localhost:8081/oauth-callback`
- **Web (production):** `https://your-domain.com/oauth-callback`
- **iOS:** `com.everythingreimbursable.app:/oauth-callback`
- **Android:** `com.everythingreimbursable.app:/oauth-callback`

## Notes

- You need a **Web** OAuth Client ID for Expo web
- The Client ID in your `.env` should be a web client ID, not a native client ID
- PKCE is used for security (no client secret needed on client-side)
