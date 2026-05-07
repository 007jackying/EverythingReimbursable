/* eslint-disable no-console */
import { GOOGLE_CONFIG } from '@/config/google'

const DRIVE_API_BASE = 'https://www.googleapis.com/drive/v3'
const DRIVE_UPLOAD_BASE = 'https://www.googleapis.com/upload/drive/v3'

export interface DriveFile {
  id: string
  name: string
  mimeType: string
  webViewLink?: string
  webContentLink?: string
  createdTime?: string
  modifiedTime?: string
  size?: string
  parents?: string[]
}

export interface UploadResult {
  fileId: string
  webViewLink: string
  webContentLink: string
}

export interface AboutInfo {
  user: {
    displayName: string
    emailAddress: string
    photoLink?: string
  }
  storageQuota?: {
    limit: string
    usage: string
    usageInDrive: string
  }
}

const makeRequest = async (
  url: string,
  accessToken: string,
  options: RequestInit = {}
): Promise<Response> => {
  console.log('[Drive] Making request to:', url)
  console.log('[Drive] Method:', options.method || 'GET')

  const res = await fetch(url, {
    ...options,
    headers: {
      Authorization: `Bearer ${accessToken}`,
      ...options.headers
    }
  })

  console.log('[Drive] Response status:', res.status)

  if (res.status === 401) {
    console.error('[Drive] Token expired or invalid')
    throw new Error('TOKEN_EXPIRED')
  }

  if (res.status === 403) {
    const errorText = await res.text()
    console.error('[Drive] Permission denied:', errorText)
    throw new Error('PERMISSION_DENIED')
  }

  if (res.status === 404) {
    console.error('[Drive] Resource not found')
    throw new Error('NOT_FOUND')
  }

  if (!res.ok) {
    const errorText = await res.text()
    console.error('[Drive] API error:', res.status, errorText)
    throw new Error(`Drive API error (${res.status}): ${errorText}`)
  }

  return res
}

/**
 * Gets information about the user, the user's Drive, and system capabilities.
 * GET /drive/v3/about
 */
export const getAbout = async (accessToken: string): Promise<AboutInfo> => {
  console.log('[Drive] Getting user info...')
  const url = `${DRIVE_API_BASE}/about?fields=user(displayName,emailAddress,photoLink),storageQuota`
  const res = await makeRequest(url, accessToken)
  const data = await res.json()
  console.log('[Drive] User info:', data)
  return data
}

/**
 * Creates a folder in Google Drive.
 * POST /drive/v3/files
 */
export const createFolder = async (accessToken: string, folderName: string): Promise<DriveFile> => {
  console.log('[Drive] Creating folder:', folderName)
  const url = `${DRIVE_API_BASE}/files`
  const res = await makeRequest(url, accessToken, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: folderName,
      mimeType: 'application/vnd.google-apps.folder'
    })
  })
  const data = await res.json()
  console.log('[Drive] Folder created:', data)
  return data
}

/**
 * Searches for files in Google Drive.
 * GET /drive/v3/files
 */
export const searchFiles = async (
  accessToken: string,
  query: string,
  folderId?: string,
  pageSize: number = 100
): Promise<DriveFile[]> => {
  console.log('[Drive] Searching files with query:', query)
  let searchQuery = `${query} and trashed=false`

  if (folderId) {
    searchQuery += ` and '${folderId}' in parents`
  }

  const fields =
    'files(id,name,mimeType,webViewLink,webContentLink,createdTime,modifiedTime,size,parents)'
  const url = `${DRIVE_API_BASE}/files?q=${encodeURIComponent(searchQuery)}&spaces=drive&fields=${fields}&pageSize=${pageSize}`

  const res = await makeRequest(url, accessToken)
  const data = await res.json()
  console.log('[Drive] Found', data.files?.length || 0, 'files')
  return data.files || []
}

/**
 * Lists files in a folder.
 * GET /drive/v3/files
 */
export const listFiles = async (
  accessToken: string,
  folderId?: string,
  pageSize: number = 100
): Promise<DriveFile[]> => {
  console.log('[Drive] Listing files in folder:', folderId || 'root')
  let query = 'trashed=false'

  if (folderId) {
    query += ` and '${folderId}' in parents`
  }

  const fields =
    'files(id,name,mimeType,webViewLink,webContentLink,createdTime,modifiedTime,size,parents)'
  const url = `${DRIVE_API_BASE}/files?q=${encodeURIComponent(query)}&spaces=drive&fields=${fields}&pageSize=${pageSize}`

  const res = await makeRequest(url, accessToken)
  const data = await res.json()
  console.log('[Drive] Listed', data.files?.length || 0, 'files')
  return data.files || []
}

/**
 * Gets a file's metadata by ID.
 * GET /drive/v3/files/{fileId}
 */
export const getFile = async (
  accessToken: string,
  fileId: string,
  fields?: string
): Promise<DriveFile> => {
  console.log('[Drive] Getting file:', fileId)
  const defaultFields =
    'id,name,mimeType,webViewLink,webContentLink,createdTime,modifiedTime,size,parents'
  const url = `${DRIVE_API_BASE}/files/${fileId}?fields=${fields || defaultFields}`

  const res = await makeRequest(url, accessToken)
  const data = await res.json()
  console.log('[Drive] File metadata:', data)
  return data
}

/**
 * Gets or creates a folder by name.
 * Uses search + create pattern.
 */
export const getOrCreateFolder = async (
  accessToken: string,
  folderName: string = GOOGLE_CONFIG.driveFolderName
): Promise<string> => {
  console.log('[Drive] Getting or creating folder:', folderName)

  // Search for existing folder
  const query = `name='${folderName}' and mimeType='application/vnd.google-apps.folder'`
  const files = await searchFiles(accessToken, query)

  if (files.length > 0) {
    console.log('[Drive] Found existing folder, ID:', files[0].id)
    return files[0].id
  }

  // Create new folder
  const folder = await createFolder(accessToken, folderName)
  console.log('[Drive] Created new folder, ID:', folder.id)
  return folder.id
}

/**
 * Uploads an image file to Google Drive using multipart upload.
 * POST /upload/drive/v3/files?uploadType=multipart
 */
export const uploadImage = async (
  accessToken: string,
  imageUri: string,
  fileName: string,
  folderId?: string
): Promise<UploadResult> => {
  console.log('[Drive] Starting upload for:', fileName)
  console.log('[Drive] Image URI:', imageUri)

  // Get or create target folder
  const targetFolderId = folderId || (await getOrCreateFolder(accessToken))
  console.log('[Drive] Target folder ID:', targetFolderId)

  // Fetch the image
  console.log('[Drive] Fetching image from local URI...')
  const imageResponse = await fetch(imageUri)
  const imageBlob = await imageResponse.blob()
  console.log('[Drive] Image blob size:', imageBlob.size, 'bytes, type:', imageBlob.type)

  // Prepare metadata
  const metadata = {
    name: fileName,
    parents: [targetFolderId],
    mimeType: imageBlob.type || 'image/jpeg'
  }

  // Build multipart body
  const multipartBody = new FormData()
  multipartBody.append(
    'metadata',
    new Blob([JSON.stringify(metadata)], { type: 'application/json' })
  )
  multipartBody.append('file', imageBlob)

  // Upload
  const uploadUrl = `${DRIVE_UPLOAD_BASE}/files?uploadType=multipart`
  console.log('[Drive] Uploading to:', uploadUrl)

  const res = await makeRequest(uploadUrl, accessToken, {
    method: 'POST',
    body: multipartBody as any
  })

  const data: DriveFile = await res.json()
  console.log('[Drive] Upload successful, file ID:', data.id)

  const result: UploadResult = {
    fileId: data.id,
    webViewLink: data.webViewLink || `https://drive.google.com/file/d/${data.id}/view`,
    webContentLink: data.webContentLink || `https://drive.google.com/uc?id=${data.id}`
  }

  console.log('[Drive] Web view link:', result.webViewLink)
  return result
}

/**
 * Uploads any file to Google Drive.
 * POST /upload/drive/v3/files?uploadType=multipart
 */
export const uploadFile = async (
  accessToken: string,
  fileUri: string,
  fileName: string,
  mimeType: string,
  folderId?: string
): Promise<UploadResult> => {
  console.log('[Drive] Uploading file:', fileName, 'type:', mimeType)

  const targetFolderId = folderId || (await getOrCreateFolder(accessToken))

  const fileResponse = await fetch(fileUri)
  const fileBlob = await fileResponse.blob()

  const metadata = {
    name: fileName,
    parents: [targetFolderId],
    mimeType
  }

  const multipartBody = new FormData()
  multipartBody.append(
    'metadata',
    new Blob([JSON.stringify(metadata)], { type: 'application/json' })
  )
  multipartBody.append('file', fileBlob)

  const uploadUrl = `${DRIVE_UPLOAD_BASE}/files?uploadType=multipart`
  const res = await makeRequest(uploadUrl, accessToken, {
    method: 'POST',
    body: multipartBody as any
  })

  const data: DriveFile = await res.json()
  console.log('[Drive] File uploaded, ID:', data.id)

  return {
    fileId: data.id,
    webViewLink: data.webViewLink || `https://drive.google.com/file/d/${data.id}/view`,
    webContentLink: data.webContentLink || `https://drive.google.com/uc?id=${data.id}`
  }
}

/**
 * Downloads a file's content.
 * GET /drive/v3/files/{fileId}?alt=media
 */
export const downloadFile = async (accessToken: string, fileId: string): Promise<Blob> => {
  console.log('[Drive] Downloading file:', fileId)
  const url = `${DRIVE_API_BASE}/files/${fileId}?alt=media`
  const res = await makeRequest(url, accessToken)
  const blob = await res.blob()
  console.log('[Drive] Downloaded blob size:', blob.size, 'bytes')
  return blob
}

/**
 * Deletes a file permanently.
 * DELETE /drive/v3/files/{fileId}
 */
export const deleteFile = async (accessToken: string, fileId: string): Promise<void> => {
  console.log('[Drive] Deleting file:', fileId)
  const url = `${DRIVE_API_BASE}/files/${fileId}`
  await makeRequest(url, accessToken, { method: 'DELETE' })
  console.log('[Drive] File deleted')
}

/**
 * Updates a file's metadata.
 * PATCH /drive/v3/files/{fileId}
 */
export const updateFileMetadata = async (
  accessToken: string,
  fileId: string,
  metadata: Partial<DriveFile>
): Promise<DriveFile> => {
  console.log('[Drive] Updating file metadata:', fileId, metadata)
  const url = `${DRIVE_API_BASE}/files/${fileId}`
  const res = await makeRequest(url, accessToken, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(metadata)
  })
  const data = await res.json()
  console.log('[Drive] File updated:', data)
  return data
}

/**
 * Moves a file to trash (soft delete).
 * PATCH /drive/v3/files/{fileId} with trashed=true
 */
export const trashFile = async (accessToken: string, fileId: string): Promise<DriveFile> => {
  console.log('[Drive] Moving file to trash:', fileId)
  const url = `${DRIVE_API_BASE}/files/${fileId}`
  const res = await makeRequest(url, accessToken, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ trashed: true })
  })
  const data = await res.json()
  console.log('[Drive] File moved to trash:', data)
  return data
}

/**
 * Generates a public URL for a file.
 */
export const getFileUrl = (fileId: string): string => `https://drive.google.com/uc?id=${fileId}`

/**
 * Generates a view URL for a file.
 */
export const getFileViewUrl = (fileId: string): string =>
  `https://drive.google.com/file/d/${fileId}/view`

/**
 * Checks if the access token is valid by making a simple API call.
 */
export const checkToken = async (accessToken: string): Promise<boolean> => {
  try {
    console.log('[Drive] Checking token validity...')
    await getAbout(accessToken)
    console.log('[Drive] Token is valid')
    return true
  } catch {
    console.log('[Drive] Token is invalid or expired')
    return false
  }
}
