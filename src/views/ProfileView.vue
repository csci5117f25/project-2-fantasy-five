<template>
  <div class="container py-5">
    <div v-if="loading" class="text-center py-5">
      <div class="spinner-border text-primary" role="status">
        <span class="visually-hidden">Loading...</span>
      </div>
      <p class="mt-2">Loading profile...</p>
    </div>
    <div v-else class="row justify-content-center">
      <div class="col-lg-8">

        <div class="row">
          <!-- Left Column - Profile Info -->
          <div class="col-md-4 mb-4">
            <div class="card text-center shadow-sm">
              <div class="card-body">

                <!-- Profile Picture -->
                <div class="mb-3">
                  <div class="mb-2">
                    <button class="btn btn-outline-secondary btn-sm me-2" @click="takePhoto">📸 Take Photo</button>
                    <button class="btn btn-outline-secondary btn-sm" @click="triggerFileInput">📁 Upload Image</button>
                  </div>
                  <div class="position-relative d-inline-block">
                    <img 
                      :src="userProfile.profilePic || defaultProfilePic" 
                      alt="Profile Picture"
                      class="rounded-circle img-fluid profile-pic"
                      @error="handleImageError"
                    >
                    <button 
                      v-if="userProfile.profilePic"
                      @click="removeProfilePic"
                      class="btn-close position-absolute top-0 end-0"
                    ></button>
                  </div>
                  <input 
                    ref="fileInput"
                    type="file" 
                    accept="image/*"
                    class="d-none"
                    @change="handleProfilePicChange"
                  >
                </div>

                <!-- Editable Name and Username -->
                <div class="mb-2">
                  <span 
                    class="editable-name fw-bold fs-5 d-block" 
                    contenteditable
                    @blur="saveName"
                  >{{ userProfile.name || 'Your Name' }}</span>
                  <span 
                    class="editable-username text-muted d-block" 
                    contenteditable
                    @blur="saveUsername"
                  >@{{ userProfile.username || 'username' }}</span>
                </div>

                <!-- Bio -->
                <textarea 
                  v-model="userProfile.bio"
                  class="form-control mb-2"
                  rows="3"
                  placeholder="Tell us about your style..."
                  @blur="saveProfile"
                ></textarea>
                <small class="text-muted">Click outside to save</small>
              </div>
            </div>
          </div>

          <!-- Right Column - Details & Settings -->
          <div class="col-md-8">

            <!-- About Me -->
            <div class="card mb-4 shadow-sm">
              <div class="card-header bg-primary text-white">
                <h5 class="mb-0">About Me</h5>
              </div>
              <div class="card-body">

                <div class="row mb-3">
                  <!-- Head Size -->
                  <div class="col-md-6 mb-3">
                    <label class="form-label fw-bold">Head Size</label>
                    <select class="form-select" v-model="userProfile.headSize" @change="saveProfile">
                      <option value="">Select Size</option>
                      <option v-for="size in headSizes" :key="size" :value="size">{{ size }}</option>
                    </select>
                  </div>
                  
                  <!-- Top Size -->
                  <div class="col-md-6 mb-3">
                    <label class="form-label fw-bold">Top Size</label>
                    <select class="form-select" v-model="userProfile.topSize" @change="saveProfile">
                      <option value="">Select Size</option>
                      <option v-for="size in topSizes" :key="size" :value="size">{{ size }}</option>
                    </select>
                  </div>
                  
                  <!-- Bottom Size -->
                  <div class="col-md-6 mb-3">
                    <label class="form-label fw-bold">Bottom Size</label>
                    <select class="form-select" v-model="userProfile.bottomSize" @change="saveProfile">
                      <option value="">Select Size</option>
                      <option v-for="size in bottomSizes" :key="size" :value="size">{{ size }}</option>
                    </select>
                  </div>
                  
                  <!-- Shoe Size -->
                  <div class="col-md-6 mb-3">
                    <label class="form-label fw-bold">Shoe Size</label>
                    <select class="form-select" v-model="userProfile.shoeSize" @change="saveProfile">
                      <option value="">Select Size</option>
                      <option v-for="size in shoeSizes" :key="size" :value="size">{{ size }}</option>
                    </select>
                  </div>
                  
                  <!-- Dress Size -->
                  <div class="col-md-6 mb-3">
                    <label class="form-label fw-bold">Dress Size</label>
                    <select class="form-select" v-model="userProfile.dressSize" @change="saveProfile">
                      <option value="">Select Size</option>
                      <option v-for="size in dressSizes" :key="size" :value="size">{{ size }}</option>
                    </select>
                  </div>
                  
                  <!-- Jacket Size -->
                  <div class="col-md-6 mb-3">
                    <label class="form-label fw-bold">Jacket/Outerwear Size</label>
                    <select class="form-select" v-model="userProfile.jacketSize" @change="saveProfile">
                      <option value="">Select Size</option>
                      <option v-for="size in jacketSizes" :key="size" :value="size">{{ size }}</option>
                    </select>
                  </div>
                  
                  <!-- Ring Size -->
                  <div class="col-md-6 mb-3">
                    <label class="form-label fw-bold">Ring Size</label>
                    <select class="form-select" v-model="userProfile.ringSize" @change="saveProfile">
                      <option value="">Select Size</option>
                      <option v-for="size in ringSizes" :key="size" :value="size">{{ size }}</option>
                    </select>
                  </div>
                  
                  <!-- Waist Measurement -->
                  <div class="col-md-6 mb-3">
                    <label class="form-label fw-bold">Waist Measurement (inches)</label>
                    <select class="form-select" v-model="userProfile.waistMeasurement" @change="saveProfile">
                      <option value="">Select Measurement</option>
                      <option v-for="size in waistMeasurements" :key="size" :value="size">{{ size }}"</option>
                    </select>
                  </div>
                  
                  <!-- Chest Measurement -->
                  <div class="col-md-6 mb-3">
                    <label class="form-label fw-bold">Chest Measurement (inches)</label>
                    <select class="form-select" v-model="userProfile.chestMeasurement" @change="saveProfile">
                      <option value="">Select Measurement</option>
                      <option v-for="size in chestMeasurements" :key="size" :value="size">{{ size }}"</option>
                    </select>
                  </div>
                  
                  <!-- Inseam Measurement -->
                  <div class="col-md-6 mb-3">
                    <label class="form-label fw-bold">Inseam Measurement (inches)</label>
                    <select class="form-select" v-model="userProfile.inseamMeasurement" @change="saveProfile">
                      <option value="">Select Measurement</option>
                      <option v-for="size in inseamMeasurements" :key="size" :value="size">{{ size }}"</option>
                    </select>
                  </div>
                </div>

                <!-- Additional Stats -->
                <div class="row text-center">
                  <div class="col-6 border-end">
                    <div class="h5 text-primary">{{ stats.clothesCount }}</div>
                    <small class="text-muted d-block"># of clothes</small>
                  </div>
                  <div class="col-6">
                    <div class="h5 text-primary">{{ stats.outfitsCount }}</div>
                    <small class="text-muted d-block"># of outfits</small>
                  </div>
                </div>

              </div>
            </div>

            <!-- Site Settings -->
            <div class="card mb-4 shadow-sm">
              <div class="card-header">
                <h5 class="mb-0">Site Settings</h5>
              </div>
              <div class="card-body">

                <div class="row mb-3 align-items-center">
                  <div class="col-sm-4 fw-bold">Theme</div>
                  <div class="col-sm-8">
                    <select class="form-select" v-model="userSettings.theme" @change="applyTheme">
                      <option value="auto">Auto</option>
                      <option value="light">Light</option>
                      <option value="dark">Dark</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>

            <!-- Action Buttons -->
            <div class="d-flex justify-content-end gap-2">
              <button class="btn btn-outline-secondary" @click="logout">
                <i class="fas fa-sign-out-alt me-2"></i>Logout
              </button>
              <button class="btn btn-outline-danger" @click="showDeleteConfirm = true">
                <i class="fas fa-trash me-2"></i>Delete Account
              </button>
            </div>

          </div>
        </div>

      </div>
    </div>

    <!-- Delete Confirmation Modal -->
    <div v-if="showDeleteConfirm" class="modal fade show d-block" tabindex="-1" style="background-color: rgba(0,0,0,0.5);">
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title text-danger">Delete Account</h5>
            <button type="button" class="btn-close" @click="showDeleteConfirm = false"></button>
          </div>
          <div class="modal-body">
            <p>Are you sure you want to delete your account? This action cannot be undone.</p>
            <p class="text-danger fw-bold">All your clothes, outfits, and data will be permanently deleted.</p>
            <input type="text" v-model="deleteConfirmation" class="form-control" placeholder='Type "DELETE" to confirm'>
          </div>
          <div class="modal-footer">
            <button class="btn btn-secondary" @click="showDeleteConfirm = false">Cancel</button>
            <button class="btn btn-danger" :disabled="deleteConfirmation !== 'DELETE'" @click="deleteAccount">
              Delete Account Permanently
            </button>
          </div>
        </div>
      </div>
    </div>

  </div>
</template>

<script>
import { ref, watch, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useCurrentUser } from 'vuefire'
import { doc, getDoc, setDoc, collection, getDocs, deleteDoc } from 'firebase/firestore';
import { ref as storageRef, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { signOut, deleteUser, onAuthStateChanged } from 'firebase/auth';
import { db, storage, auth } from '../firebase.js';

export default {
  name: 'ProfileView',
  setup() {
    const router = useRouter()
    const currentUser = useCurrentUser()
    const loading = ref(true)
    
    const userProfile = ref({
      name: '',
      username: '',
      bio: '',
      profilePic: '',
      headSize: '',
      topSize: '',
      bottomSize: '',
      shoeSize: '',
      dressSize: '',
      jacketSize: '',
      ringSize: '',
      waistMeasurement: '',
      chestMeasurement: '',
      inseamMeasurement: ''
    })
    
    const userSettings = ref({
      theme: 'auto',
      notifications: true,
      emailUpdates: true
    })
    
    const stats = ref({
      clothesCount: 0,
      outfitsCount: 0
    })
    
    const showDeleteConfirm = ref(false)
    const deleteConfirmation = ref('')
    const defaultProfilePic = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDIwMCAyMDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0iI2RlZTZmNiIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LXNpemU9IjE4IiBmaWxsPSIjOWM5YzljIHRleHQtYW5jaG9yPSJtaWRkbGUiPk5vIFBob3RvPC90ZXh0Pjwvc3ZnPg=='
    
    const headSizes = ref([])
    const topSizes = ref([])
    const bottomSizes = ref([])
    const shoeSizes = ref([])
    const dressSizes = ref([])
    const jacketSizes = ref([])
    const ringSizes = ref([])
    const waistMeasurements = ref([])
    const chestMeasurements = ref([])
    const inseamMeasurements = ref([])
    const fileInput = ref(null)

    const loadUserProfile = async () => {
      if (!currentUser.value) return;
      try {
        const userDoc = await getDoc(doc(db, 'users', currentUser.value.uid));
        if (userDoc.exists()) {
          const data = userDoc.data();
          userProfile.value.name = data.userSettings?.name || '';
          userProfile.value.username = data.userSettings?.username || '';
          userProfile.value.bio = data.userSettings?.bio || '';
          userProfile.value.profilePic = data.userSettings?.profilePictureUrl || '';
          userProfile.value.headSize = data.userMeasurements?.head || '';
          userProfile.value.topSize = data.userMeasurements?.top || '';
          userProfile.value.bottomSize = data.userMeasurements?.bottom || '';
          userProfile.value.shoeSize = data.userMeasurements?.shoe || '';
          userProfile.value.dressSize = data.userMeasurements?.dress || '';
          userProfile.value.jacketSize = data.userMeasurements?.jacket || '';
          userProfile.value.ringSize = data.userMeasurements?.ring || '';
          userProfile.value.waistMeasurement = data.userMeasurements?.waist || '';
          userProfile.value.chestMeasurement = data.userMeasurements?.chest || '';
          userProfile.value.inseamMeasurement = data.userMeasurements?.inseam || '';
        }
      } catch (error) {
        console.error(error);
      }
    }
    
    const loadUserStats = async () => {
      if (!currentUser.value) return;
      try {
        const clothingSnapshot = await getDocs(collection(db, 'users', currentUser.value.uid, 'clothingItems'));
        stats.value.clothesCount = clothingSnapshot.size;
        const outfitsSnapshot = await getDocs(collection(db, 'users', currentUser.value.uid, 'outfits'));
        stats.value.outfitsCount = outfitsSnapshot.size;
      } catch (error) {
        console.error(error);
      }
    }
    
    const loadUserSettings = async () => {
      if (!currentUser.value) return;
      try {
        const userDoc = await getDoc(doc(db, 'users', currentUser.value.uid));
        if (userDoc.exists()) {
          const data = userDoc.data();
          userSettings.value.theme = data.userSettings?.theme || 'auto';
        }
      } catch (error) {
        console.error(error);
      }
    }
    
    const generateSizeOptions = () => {
      headSizes.value = ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL'];
      topSizes.value = ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL'];
      const waistSizes = Array.from({length: 20}, (_, i) => (26 + i*2).toString());
      const inseamSizes = ['28', '30', '32', '34', '36', '38'];
      bottomSizes.value = [...waistSizes];
      inseamSizes.forEach(inseam => {
        waistSizes.forEach(waist => {
          bottomSizes.value.push(`${waist}x${inseam}`);
        });
      });
      shoeSizes.value = Array.from({length: 21}, (_, i) => (4 + i*0.5).toFixed(1));
      dressSizes.value = ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL'];
      jacketSizes.value = ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL'];
      ringSizes.value = Array.from({length: 19}, (_, i) => (4 + i*0.5).toFixed(1));
      waistMeasurements.value = Array.from({length: 14}, (_, i) => (24 + i*2).toString());
      chestMeasurements.value = Array.from({length: 13}, (_, i) => (32 + i*2).toString());
      inseamMeasurements.value = Array.from({length: 7}, (_, i) => (26 + i*2).toString());
    }
    
    const applyTheme = () => {
      const theme = userSettings.value.theme;
      if (theme === 'dark' || (theme === 'auto' && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
        document.body.setAttribute('data-bs-theme', 'dark');
      } else {
        document.body.setAttribute('data-bs-theme', 'light');
      }
    }
    
    // Load data when user is authenticated
    const loadData = async () => {
      if (currentUser.value) {
        loading.value = true
        await loadUserProfile();
        await loadUserStats();
        await loadUserSettings();
        generateSizeOptions();
        applyTheme();
        loading.value = false
      }
    }
    
    // Watch for user authentication changes
    watch(currentUser, async (user) => {
      if (user) {
        await loadData()
      }
      // Don't redirect immediately - let onMounted handle initial check
    })
    
    onMounted(async () => {
      generateSizeOptions()
      // Wait a moment for auth to initialize
      await new Promise(resolve => setTimeout(resolve, 100))
      
      // Check if user is authenticated
      if (currentUser.value) {
        await loadData()
      } else {
        // Check auth state directly as fallback
        await new Promise(resolve => {
          const unsubscribe = onAuthStateChanged(auth, (user) => {
            unsubscribe()
            resolve()
            if (user) {
              loadData()
            } else {
              router.push('/login')
            }
          })
        })
      }
    })

    const saveProfile = async () => {
      if (!currentUser.value) return;
      try {
        const userDocRef = doc(db, 'users', currentUser.value.uid);
        const userDoc = await getDoc(userDocRef);
        const existingData = userDoc.exists() ? userDoc.data() : {};
        
        const userMeasurements = existingData.userMeasurements || {};
        if (userProfile.value.headSize) userMeasurements.head = userProfile.value.headSize;
        else delete userMeasurements.head;
        if (userProfile.value.topSize) userMeasurements.top = userProfile.value.topSize;
        else delete userMeasurements.top;
        if (userProfile.value.bottomSize) userMeasurements.bottom = userProfile.value.bottomSize;
        else delete userMeasurements.bottom;
        if (userProfile.value.shoeSize) userMeasurements.shoe = userProfile.value.shoeSize;
        else delete userMeasurements.shoe;
        if (userProfile.value.dressSize) userMeasurements.dress = userProfile.value.dressSize;
        else delete userMeasurements.dress;
        if (userProfile.value.jacketSize) userMeasurements.jacket = userProfile.value.jacketSize;
        else delete userMeasurements.jacket;
        if (userProfile.value.ringSize) userMeasurements.ring = userProfile.value.ringSize;
        else delete userMeasurements.ring;
        if (userProfile.value.waistMeasurement) userMeasurements.waist = userProfile.value.waistMeasurement;
        else delete userMeasurements.waist;
        if (userProfile.value.chestMeasurement) userMeasurements.chest = userProfile.value.chestMeasurement;
        else delete userMeasurements.chest;
        if (userProfile.value.inseamMeasurement) userMeasurements.inseam = userProfile.value.inseamMeasurement;
        else delete userMeasurements.inseam;
        
        await setDoc(userDocRef, {
          userSettings: {
            name: userProfile.value.name || '',
            username: userProfile.value.username || '',
            theme: userSettings.value.theme || 'system',
            profilePictureUrl: userProfile.value.profilePic || null,
            bio: userProfile.value.bio || ''
          },
          userStats: existingData.userStats || { clothingCount: 0, outfitCount: 0 },
          userMeasurements: userMeasurements,
          createdAt: existingData.createdAt || new Date(),
          updatedAt: new Date()
        }, { merge: true });
      } catch (error) { 
        console.error('Save profile error:', error); 
      }
    }
    
    const saveName = (event) => {
      userProfile.value.name = event.target.innerText.trim();
      saveProfile();
    }
    
    const saveUsername = (event) => {
      userProfile.value.username = event.target.innerText.trim().replace(/\s+/g,'');
      saveProfile();
    }
    
    const saveSettings = async () => {
      if (!currentUser.value) return;
      try {
        const userDocRef = doc(db, 'users', currentUser.value.uid);
        await setDoc(userDocRef, {
          userSettings: {
            theme: userSettings.value.theme || 'system'
          },
          updatedAt: new Date()
        }, { merge: true });
      } catch (error) { 
        console.error('Save settings error:', error); 
      }
    }
    
    const triggerFileInput = () => { 
      fileInput.value?.click(); 
    }
    const takePhoto = async () => {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        triggerFileInput()
        return
      }
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' } })
        const modal = document.createElement('div')
        modal.className = 'modal d-block'
        modal.style.backgroundColor = 'rgba(0,0,0,0.8)'
        modal.innerHTML = '<div class="modal-dialog modal-dialog-centered"><div class="modal-content"><div class="modal-header"><h5 class="modal-title">Take Photo</h5><button type="button" class="btn-close" id="closeCamera"></button></div><div class="modal-body text-center"><video id="cameraPreview" autoplay playsinline style="max-width: 100%; max-height: 400px; border-radius: 50%;"></video></div><div class="modal-footer"><button class="btn btn-secondary" id="cancelCamera">Cancel</button><button class="btn btn-primary" id="capturePhoto">Capture</button></div></div></div>'
        document.body.appendChild(modal)
        const preview = modal.querySelector('#cameraPreview')
        preview.srcObject = stream
        const canvas = document.createElement('canvas')
        const ctx = canvas.getContext('2d')
        const closeCamera = () => {
          stream.getTracks().forEach(track => track.stop())
          document.body.removeChild(modal)
        }
        modal.querySelector('#closeCamera').onclick = closeCamera
        modal.querySelector('#cancelCamera').onclick = closeCamera
        modal.querySelector('#capturePhoto').onclick = () => {
          canvas.width = preview.videoWidth
          canvas.height = preview.videoHeight
          ctx.drawImage(preview, 0, 0)
          canvas.toBlob((blob) => {
            if (blob) {
              const file = new File([blob], `profile-${Date.now()}.jpg`, { type: 'image/jpeg' })
              const input = fileInput.value
              const dataTransfer = new DataTransfer()
              dataTransfer.items.add(file)
              input.files = dataTransfer.files
              input.dispatchEvent(new Event('change', { bubbles: true }))
            }
            closeCamera()
          }, 'image/jpeg', 0.9)
        }
      } catch (error) {
        console.error('Camera error:', error)
        triggerFileInput()
      }
    }
    
    const removeProfilePic = () => {
      userProfile.value.profilePic = ''
      saveProfile()
    }
    
    const handleProfilePicChange = async (event) => {
      const file = event.target.files[0]
      if (!file || !currentUser.value) return
      try {
        const fileRef = storageRef(storage, `users/${currentUser.value.uid}/profilePictures/${file.name}`)
        const snapshot = await uploadBytes(fileRef, file)
        const downloadURL = await getDownloadURL(snapshot.ref)
        userProfile.value.profilePic = downloadURL
        await saveProfile()
        event.target.value = ''
      } catch (error) { 
        console.error('Error uploading profile picture:', error)
        alert('Error uploading profile picture') 
      }
    }
    
    const handleImageError = (event) => { 
      event.target.src = defaultProfilePic 
    }
    
    const logout = async () => { 
      try { 
        await signOut(auth)
        router.push('/') 
      } catch(e) {
        console.error('Logout error:', e)
      } 
    }
    
    const deleteAccount = async () => { 
      if(deleteConfirmation.value !== 'DELETE') return
      try {
        const user = currentUser.value
        if(!user) { 
          alert('No user logged in')
          return 
        }
        await deleteUserData(user.uid)
        await deleteUser(user)
        router.push('/')
      } catch (error) { 
        console.error('Delete account error:', error)
        if(error.code === 'auth/requires-recent-login') { 
          alert('Please log in again')
          await logout()
        } else { 
          alert('Error deleting account.') 
        } 
      }
    }
    
    const deleteUserData = async (userId) => {
      try {
        await deleteDoc(doc(db, 'users', userId))
        const clothingSnapshot = await getDocs(collection(db, 'users', userId, 'clothingItems'))
        await Promise.all(clothingSnapshot.docs.map(doc => deleteDoc(doc.ref)))
        const outfitsSnapshot = await getDocs(collection(db, 'users', userId, 'outfits'))
        await Promise.all(outfitsSnapshot.docs.map(doc => deleteDoc(doc.ref)))
        try { 
          await deleteObject(storageRef(storage, `users/${userId}/profilePictures`))
        } catch(e) {
          console.log('No profile pic to delete')
        }
      } catch(e) {
        console.error('Delete user data error:', e)
        throw e
      }
    }
    
    return {
      loading,
      userProfile,
      userSettings,
      stats,
      showDeleteConfirm,
      deleteConfirmation,
      defaultProfilePic,
      headSizes,
      topSizes,
      bottomSizes,
      shoeSizes,
      dressSizes,
      jacketSizes,
      ringSizes,
      waistMeasurements,
      chestMeasurements,
      inseamMeasurements,
      fileInput,
      saveProfile,
      saveName,
      saveUsername,
      saveSettings,
      applyTheme,
      triggerFileInput,
      takePhoto,
      removeProfilePic,
      handleProfilePicChange,
      handleImageError,
      logout,
      deleteAccount
    }
  }
}
</script>

<style scoped>
.profile-pic { width:150px; height:150px; object-fit:cover; border:4px solid #6f42c1; }
.editable-name, .editable-username {
  padding: 2px 4px;
  border-radius: 4px;
}
.editable-name:hover, .editable-username:hover,
.editable-name:focus, .editable-username:focus {
  outline: 2px solid #6f42c1;
  background-color: #f8f9fa;
}
</style>