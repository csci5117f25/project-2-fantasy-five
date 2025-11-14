// Firebase configuration and initialization
import { initializeApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'
import { getStorage } from 'firebase/storage'

const firebaseConfig = {
  apiKey: 'AIzaSyDfqceJsSEzZvy7f5XaEG43tdTG684MsXo',
  authDomain: 'outfittracker-28a32.firebaseapp.com',
  projectId: 'outfittracker-28a32',
  storageBucket: 'outfittracker-28a32.firebasestorage.app',
  messagingSenderId: '234772813844',
  appId: '1:234772813844:web:b592e8aeeb36f557232f01',
  measurementId: 'G-SRE0S7D0DZ',
}

// Initialize Firebase
const app = initializeApp(firebaseConfig)

// Initialize Firebase services
export const auth = getAuth(app)
export const db = getFirestore(app)
export const storage = getStorage(app)

// Export the app instance in case it's needed
export default app
