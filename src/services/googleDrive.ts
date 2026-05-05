import { GOOGLE_CONFIG } from '@/config/google'

const DRIVE_API_BASE = 'https://www.googleapis.com/drive/v3'
const DRIVE_UPLOAD_BASE = 'https://www.googleapis.com/upload/drive/v3'

interface DriveFile {
  id: string
  name: string
  mimeType: string
  webViewLink?: string
  webContentLink?: string
}

interface UploadResult {
  fileId: string
  webViewLink: string
  webContentLink: string
}

const makeRequest = async (
  url: string,
  accessToken: string,
  options: RequestInit = {}
): Promise<Response> => {
  const res = await fetch(url, {
    ...options,
    headers: {
      Authorization: `Bearer ${accessToken}`,
      ...options.headers
    }
  })

  if (res.status === 401) {
    throw new Error('TOKEN_EXPIRED')
  }

  if (!res.ok) {
    const error = await res.text()
    throw new Error(`Drive API error: ${error}`)
  }

  return res
}

export const getOrCreateFolder = async (
  accessToken: string,
  folderName: string = GOOGLE_CONFIG.driveFolderName
): Promise<string> => {
  const searchUrl = `${DRIVE_API_BASE}/files?q=name='${folderName}'+and+mimeType='application/vnd.google-apps.folder'+and+trashed=false&spaces=drive&fields=files(id)`

  const searchRes = await makeRequest(searchUrl, accessToken)
  const searchData = await searchRes.json()

  if (searchData.files && searchData.files.length > 0) {
    return searchData.files[0].id
  }

  const createUrl = `${DRIVE_API_BASE}/files`
  const createRes = await makeRequest(createUrl, accessToken, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: folderName,
      mimeType: 'application/vnd.google-apps.folder'
    })
  })

  const createData = await createRes.json()
  return createData.id
}

export const uploadImage = async (
  accessToken: string,
  imageUri: string,
  fileName: string,
  folderId?: string
): Promise<UploadResult> => {
  const targetFolderId = folderId || (await getOrCreateFolder(accessToken))

  const imageResponse = await fetch(imageUri)
  const imageBlob = await imageResponse.blob()

  const metadata = {
    name: fileName,
    parents: [targetFolderId],
    mimeType: imageBlob.type || 'image/jpeg'
  }

  const multipartBoundary = 'foo_bar_baz'
  const multipartBody = new FormData()

  multipartBody.append(
    'metadata',
    new Blob([JSON.stringify(metadata)], { type: 'application/json' })
  )
  multipartBody.append('file', imageBlob)

  const uploadUrl = `${DRIVE_UPLOAD_BASE}/files?uploadType=multipart`

  const res = await makeRequest(uploadUrl, accessToken, {
    method: 'POST',
    headers: {
      'Content-Type': `multipart/related; boundary=${multipartBoundary}`
    },
    body: multipartBody as any
  })

  const data: DriveFile = await res.json()

  return {
    fileId: data.id,
    webViewLink: data.webViewLink || `https://drive.google.com/file/d/${data.id}/view`,
    webContentLink: data.webContentLink || `https://drive.google.com/uc?id=${data.id}`
  }
}

export const getFileMetadata = async (accessToken: string, fileId: string): Promise<DriveFile> => {
  const url = `${DRIVE_API_BASE}/files/${fileId}?fields=id,name,mimeType,webViewLink,webContentLink`

  const res = await makeRequest(url, accessToken)
  return res.json()
}

export const getFileUrl = (fileId: string): string => `https://drive.google.com/uc?id=${fileId}`

export const downloadFile = async (accessToken: string, fileId: string): Promise<Blob> => {
  const url = `${DRIVE_API_BASE}/files/${fileId}?alt=media`

  const res = await makeRequest(url, accessToken)
  return res.blob()
}

export const deleteFile = async (accessToken: string, fileId: string): Promise<void> => {
  const url = `${DRIVE_API_BASE}/files/${fileId}`

  await makeRequest(url, accessToken, { method: 'DELETE' })
}

export const searchFiles = async (
  accessToken: string,
  query: string,
  folderId?: string
): Promise<DriveFile[]> => {
  let searchQuery = `name contains '${query}' and trashed=false`

  if (folderId) {
    searchQuery += ` and '${folderId}' in parents`
  }

  const url = `${DRIVE_API_BASE}/files?q=${encodeURIComponent(searchQuery)}&spaces=drive&fields=files(id,name,mimeType,webViewLink,webContentLink)`

  const res = await makeRequest(url, accessToken)
  const data = await res.json()

  return data.files || []
}

export const listFiles = async (
  accessToken: string,
  folderId?: string,
  pageSize: number = 100
): Promise<DriveFile[]> => {
  let query = 'trashed=false'

  if (folderId) {
    query += ` and '${folderId}' in parents`
  }

  const url = `${DRIVE_API_BASE}/files?q=${encodeURIComponent(query)}&spaces=drive&fields=files(id,name,mimeType,webViewLink,webContentLink)&pageSize=${pageSize}`

  const res = await makeRequest(url, accessToken)
  const data = await res.json()

  return data.files || []
}
