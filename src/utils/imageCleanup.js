import { ref as storageRef, deleteObject } from 'firebase/storage'
import { storage } from '@/firebase'

export function extractStoragePathFromURL(downloadURL) {
  if (!downloadURL || typeof downloadURL !== 'string') return null
  
  try {
    const url = new URL(downloadURL)
    const pathMatch = url.pathname.match(/\/o\/(.+)$/)
    if (!pathMatch) return null
    
    const encodedPath = pathMatch[1]
    const decodedPath = decodeURIComponent(encodedPath)
    
    return decodedPath
  } catch (error) {
    console.error('Error extracting storage path from URL:', error)
    return null
  }
}

export async function deleteImageFromStorage(imageUrl) {
  if (!imageUrl) return
  
  try {
    const storagePath = extractStoragePathFromURL(imageUrl)
    if (!storagePath) {
      console.warn('Could not extract storage path from URL:', imageUrl)
      return
    }
    
    const imageRef = storageRef(storage, storagePath)
    await deleteObject(imageRef)
    console.log('Successfully deleted image:', storagePath)
  } catch (error) {
    if (error.code !== 'storage/object-not-found') {
      console.error('Error deleting image from storage:', error)
    }
  }
}

export async function deleteImagesFromStorage(imageUrls) {
  if (!imageUrls || imageUrls.length === 0) return
  
  const deletePromises = imageUrls
    .filter(url => url)
    .map(url => deleteImageFromStorage(url))
  
  await Promise.allSettled(deletePromises)
}

