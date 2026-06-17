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

const makeRequest = async (
  url: string,
  accessToken: string,
  options: RequestInit = {}
): Promise<Response> => {
  console.log('[Drive] Making request to:', url)

  const res = await fetch(url, {
    ...options,
    headers: {
      Authorization: `Bearer ${accessToken}`,
      ...options.headers
    }
  })

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
 * Creates a folder in Google Drive.
 * POST /drive/v3/files
 */
const createFolder = async (accessToken: string, folderName: string): Promise<DriveFile> => {
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
  return res.json()
}

/**
 * Searches for files in Google Drive.
 * GET /drive/v3/files
 */
const searchFiles = async (
  accessToken: string,
  query: string,
  pageSize: number = 100
): Promise<DriveFile[]> => {
  const searchQuery = `${query} and trashed=false`
  const fields =
    'files(id,name,mimeType,webViewLink,webContentLink,createdTime,modifiedTime,size,parents)'
  const url = `${DRIVE_API_BASE}/files?q=${encodeURIComponent(searchQuery)}&spaces=drive&fields=${fields}&pageSize=${pageSize}`

  const res = await makeRequest(url, accessToken)
  const data = await res.json()
  console.log('[Drive] Found', data.files?.length || 0, 'files')
  return data.files || []
}

/**
 * Gets or creates a folder by name.
 * Uses search + create pattern.
 */
const getOrCreateFolder = async (
  accessToken: string,
  folderName: string = GOOGLE_CONFIG.driveFolderName
): Promise<string> => {
  const query = `name='${folderName}' and mimeType='application/vnd.google-apps.folder'`
  const files = await searchFiles(accessToken, query)

  if (files.length > 0) {
    return files[0].id
  }

  const folder = await createFolder(accessToken, folderName)
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

  // Get or create target folder
  const targetFolderId = folderId || (await getOrCreateFolder(accessToken))

  // Fetch the image
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
  const res = await makeRequest(uploadUrl, accessToken, {
    method: 'POST',
    body: multipartBody as any
  })

  const data: DriveFile = await res.json()
  console.log('[Drive] Upload successful, file ID:', data.id)

  return {
    fileId: data.id,
    webViewLink: data.webViewLink || `https://drive.google.com/file/d/${data.id}/view`,
    webContentLink: data.webContentLink || `https://drive.google.com/uc?id=${data.id}`
  }
}
