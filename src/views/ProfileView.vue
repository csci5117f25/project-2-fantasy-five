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
                  <div class="position-relative d-inline-block profile-pic-container">
                    <div class="image-container" style="width: 150px; height: 150px; border-radius: 50%; overflow: hidden;">
                      <img 
                        v-if="userProfile.profilePic" 
                        :src="userProfile.profilePic" 
                        alt="Profile Picture"
                        class="profile-pic-img"
                        @error="handleImageError"
                      >
                      <div 
                        v-else
                        class="placeholder-image"
                        style="border-radius: 50%;"
                      >
                        👤
                      </div>
                    </div>
                    <button 
                      v-if="userProfile.profilePic"
                      @click="removeProfilePic"
                      class="btn btn-outline-danger custom-btn-close btn-sm position-absolute top-0 end-0 m-1"
                    >X</button>
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
                  >{{ userProfile.username || 'username' }}</span>
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
              <div class="card-header">
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
                    <select class="form-select" v-model="userSettings.theme" @change="onThemeChange">
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

  <!-- Alert Modal -->
  <AlertModal v-model:show="showAlert" :message="alertMessage" />

  <!-- Profile Picture Editor Modal -->
  <ProfilePictureEditor
    v-model:show="showImageEditor"
    :imageUrl="editingImageUrl"
    @confirm="handleImageEditConfirm"
    @cancel="handleImageEditCancel"
  />
</template>

<script>
import { ref, watch, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useCurrentUser } from 'vuefire'
import { doc, getDoc, setDoc, collection, getDocs, deleteDoc } from 'firebase/firestore';
import { ref as storageRef, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { signOut, deleteUser, onAuthStateChanged } from 'firebase/auth';
import { db, storage, auth } from '../firebase.js';
import { deleteImageFromStorage, deleteImagesFromStorage } from '@/utils/imageCleanup'

import AlertModal from '@/components/AlertModal.vue'
import ProfilePictureEditor from '@/components/ProfilePictureEditor.vue'

import { applyTheme as applyThemeFn, getStoredTheme } from '@/utils/useTheme'

export default {
  name: 'ProfileView',
  components: {
    AlertModal,
    ProfilePictureEditor
  },
  setup() {
    const router = useRouter()
    const currentUser = useCurrentUser()
    const loading = ref(true)
    const showAlert = ref(false)
    const alertMessage = ref('')

    const applyTheme = applyThemeFn
    
    const showAlertModal = (message) => {
      alertMessage.value = message
      showAlert.value = true
    }
    
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

    const storedTheme = getStoredTheme()
    
    const userSettings = ref({
      theme: storedTheme,
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
    
    // Image editor state
    const showImageEditor = ref(false)
    const editingImageUrl = ref(null)
    
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
        const localTheme = getStoredTheme(); // "light", "dark", "auto"

        if (userDoc.exists()) {
          const data = userDoc.data();

          userSettings.value.theme =
            localTheme || data.userSettings?.theme || 'light';
        } else {
          // No user doc yet, so use local/browser theme
          userSettings.value.theme = localTheme || 'light';
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

    const onThemeChange = () => {
      applyThemeFn(userSettings.value.theme);
      saveSettings();
    };
    
    const loadData = async () => {
      if (currentUser.value) {
        loading.value = true
        await loadUserProfile();
        await loadUserStats();
        await loadUserSettings();
        generateSizeOptions();
        loading.value = false
      }
    }
    
    watch(currentUser, async (user) => {
      if (user) {
        await loadData()
      }
    })
    
    onMounted(async () => {
      generateSizeOptions();
      await new Promise(resolve => setTimeout(resolve, 100));
      
      if (currentUser.value) {
        await loadData();
      } else {
        await new Promise(resolve => {
          const unsubscribe = onAuthStateChanged(auth, (user) => {
            unsubscribe();
            resolve();
            if (user) {
              loadData();
            } else {
              router.push('/login');
            }
          });
        });
      }
    });

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
            theme: userSettings.value.theme || 'light',
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
            theme: userSettings.value.theme || 'light'
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
        showAlertModal('Camera not available. Please upload an image instead.')
        return
      }
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' } })
        const modal = document.createElement('div')
        modal.className = 'modal d-block'
        modal.style.backgroundColor = 'rgba(0,0,0,0.8)'
        modal.innerHTML = `
          <div class="modal-dialog modal-dialog-centered">
            <div class="modal-content">
              <div class="modal-header">
                <h5 class="modal-title">Take Photo</h5>
                <button type="button" class="btn-close" id="closeCamera"></button>
              </div>
              <div class="modal-body text-center p-0 position-relative" style="background: #000;">
                <video id="cameraPreview" autoplay playsinline style="width: 100%; max-height: 70vh; display: block;"></video>
                <div id="viewfinderOverlay" style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; pointer-events: none;"></div>
              </div>
              <div class="modal-footer">
                <button class="btn btn-secondary" id="cancelCamera">Cancel</button>
                <button class="btn btn-primary" id="capturePhoto">Capture</button>
              </div>
            </div>
          </div>`
        document.body.appendChild(modal)
        const preview = modal.querySelector('#cameraPreview')
        const overlay = modal.querySelector('#viewfinderOverlay')
        preview.srcObject = stream
        
        const targetSize = 800
        const aspectRatio = 1 
        
        const maskId = `viewfinderMask-${Date.now()}`
        const updateViewfinder = () => {
          const videoRect = preview.getBoundingClientRect()
          const videoAspect = preview.videoWidth / preview.videoHeight
          
          let viewfinderWidth, viewfinderHeight, viewfinderLeft, viewfinderTop
          
          if (videoAspect > aspectRatio) {
            viewfinderHeight = videoRect.height
            viewfinderWidth = viewfinderHeight * aspectRatio
            viewfinderLeft = (videoRect.width - viewfinderWidth) / 2
            viewfinderTop = 0
          } else {
            viewfinderWidth = videoRect.width
            viewfinderHeight = viewfinderWidth / aspectRatio
            viewfinderLeft = 0
            viewfinderTop = (videoRect.height - viewfinderHeight) / 2
          }
          
          overlay.innerHTML = `
            <svg width="100%" height="100%" style="position: absolute; top: 0; left: 0;">
              <defs>
                <mask id="${maskId}">
                  <rect width="100%" height="100%" fill="white"/>
                  <circle cx="${viewfinderLeft + viewfinderWidth / 2}" cy="${viewfinderTop + viewfinderHeight / 2}" 
                          r="${Math.min(viewfinderWidth, viewfinderHeight) / 2}" fill="black"/>
                </mask>
              </defs>
              <rect width="100%" height="100%" fill="rgba(0,0,0,0.6)" mask="url(#${maskId})"/>
              <circle cx="${viewfinderLeft + viewfinderWidth / 2}" cy="${viewfinderTop + viewfinderHeight / 2}" 
                      r="${Math.min(viewfinderWidth, viewfinderHeight) / 2}" 
                      fill="none" stroke="white" stroke-width="3" stroke-dasharray="10,5"/>
            </svg>
          `
        }
        
        preview.addEventListener('loadedmetadata', () => {
          updateViewfinder()
        })
        
        window.addEventListener('resize', updateViewfinder)
        
        const canvas = document.createElement('canvas')
        const ctx = canvas.getContext('2d')
        const closeCamera = () => {
          stream.getTracks().forEach(t => t.stop())
          window.removeEventListener('resize', updateViewfinder)
          document.body.removeChild(modal)
        }
        modal.querySelector('#closeCamera').onclick = closeCamera
        modal.querySelector('#cancelCamera').onclick = closeCamera
        modal.querySelector('#capturePhoto').onclick = () => {
          const videoRect = preview.getBoundingClientRect()
          const videoAspect = preview.videoWidth / preview.videoHeight
          
          let cropWidth, cropHeight, cropX, cropY
          
          if (videoAspect > aspectRatio) {
            cropHeight = preview.videoHeight
            cropWidth = cropHeight * aspectRatio
            cropX = (preview.videoWidth - cropWidth) / 2
            cropY = 0
          } else {
            cropWidth = preview.videoWidth
            cropHeight = cropWidth / aspectRatio
            cropX = 0
            cropY = (preview.videoHeight - cropHeight) / 2
          }
          
          const outputSize = 800
          canvas.width = outputSize
          canvas.height = outputSize
          ctx.drawImage(preview, cropX, cropY, cropWidth, cropHeight, 0, 0, outputSize, outputSize)
          
          ctx.globalCompositeOperation = 'destination-in'
          ctx.beginPath()
          ctx.arc(outputSize / 2, outputSize / 2, outputSize / 2, 0, Math.PI * 2)
          ctx.fill()
          
          canvas.toBlob(async (blob) => {
            if (blob) {
              await uploadProfilePicture(blob)
            }
            closeCamera()
          }, 'image/jpeg', 0.9)
        }
      } catch (error) {
        console.error('Camera error:', error)
        showAlertModal('Could not access camera. Please upload an image instead.')
      }
    }
    
    const removeProfilePic = async () => {
      const oldProfilePic = userProfile.value.profilePic
      userProfile.value.profilePic = ''
      await saveProfile()
      
      if (oldProfilePic) {
        await deleteImageFromStorage(oldProfilePic)
      }
    }
    
    const handleProfilePicChange = async (event) => {
      const file = event.target.files[0]
      if (!file || !currentUser.value) return
      
      const objectUrl = URL.createObjectURL(file)
      editingImageUrl.value = objectUrl
      showImageEditor.value = true
      event.target.value = ''
    }
    
    const handleImageEditConfirm = async (blob) => {
      if (blob) {
        await uploadProfilePicture(blob)
      }
      if (editingImageUrl.value) {
        URL.revokeObjectURL(editingImageUrl.value)
      }
      editingImageUrl.value = null
    }
    
    const handleImageEditCancel = () => {
      if (editingImageUrl.value) {
        URL.revokeObjectURL(editingImageUrl.value)
        editingImageUrl.value = null
      }
    }
    
    const uploadProfilePicture = async (blob) => {
      if (!currentUser.value) return
      try {
        const oldProfilePic = userProfile.value.profilePic
        const fileName = `profile-${Date.now()}.jpg`
        const fileRef = storageRef(storage, `users/${currentUser.value.uid}/profilePictures/${fileName}`)
        const snapshot = await uploadBytes(fileRef, blob)
        const downloadURL = await getDownloadURL(snapshot.ref)
        userProfile.value.profilePic = downloadURL
        await saveProfile()
        
        if (oldProfilePic && oldProfilePic !== downloadURL) {
          await deleteImageFromStorage(oldProfilePic)
        }
      } catch (error) { 
        console.error('Error uploading profile picture:', error)
        showAlertModal('Error uploading profile picture') 
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
          showAlertModal('No user logged in')
          return 
        }
        await deleteUserData(user.uid)
        await deleteUser(user)
        router.push('/')
      } catch (error) { 
        console.error('Delete account error:', error)
        if(error.code === 'auth/requires-recent-login') { 
          showAlertModal('Please log in again')
          await logout()
        } else { 
          showAlertModal('Error deleting account.') 
        } 
      }
    }
    
    const deleteUserData = async (userId) => {
      try {
        const imageUrls = []
        
        const userDoc = await getDoc(doc(db, 'users', userId))
        if (userDoc.exists()) {
          const profilePicUrl = userDoc.data()?.userSettings?.profilePictureUrl
          if (profilePicUrl) imageUrls.push(profilePicUrl)
        }
        
        const clothingSnapshot = await getDocs(collection(db, 'users', userId, 'clothingItems'))
        clothingSnapshot.docs.forEach(doc => {
          const imageUrl = doc.data()?.imageUrl
          if (imageUrl) imageUrls.push(imageUrl)
        })
        
        const outfitsSnapshot = await getDocs(collection(db, 'users', userId, 'outfits'))
        outfitsSnapshot.docs.forEach(doc => {
          const imageUrl = doc.data()?.imageUrl
          if (imageUrl) imageUrls.push(imageUrl)
        })
        
        await deleteImagesFromStorage(imageUrls)
        
        await deleteDoc(doc(db, 'users', userId))
        await Promise.all(clothingSnapshot.docs.map(doc => deleteDoc(doc.ref)))
        await Promise.all(outfitsSnapshot.docs.map(doc => deleteDoc(doc.ref)))
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
      onThemeChange,
      triggerFileInput,
      takePhoto,
      removeProfilePic,
      handleProfilePicChange,
      handleImageEditConfirm,
      handleImageEditCancel,
      handleImageError,
      logout,
      deleteAccount,
      showAlert,
      alertMessage,
      showAlertModal,
      showImageEditor,
      editingImageUrl
    }
  }
}
</script>

<style scoped>
.profile-pic-container {
  width: 150px;
  height: 150px;
}

.profile-pic-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.editable-name, .editable-username {
  padding: 2px 4px;
  border-radius: 4px;
}
.editable-name:hover, .editable-username:hover,
.editable-name:focus, .editable-username:focus {
  outline: 2px solid #6f42c1;
  background-color: #f8f9fa;
}

:global(html[data-bs-theme]),
:global(body[data-bs-theme]) {
  transition: background-color 0.25s ease, color 0.25s ease;
}

:global(body[data-bs-theme="light"]) {
  background-color: var(--bs-body-bg);
  color: var(--bs-body-color);
}

:global(body[data-bs-theme="dark"]) {
  background-color: var(--bs-body-bg);
  color: var(--bs-body-color);
}

:global(body[data-bs-theme] .card),
:global(body[data-bs-theme] .modal-content) {
  background-color: var(--bs-body-bg);
  color: var(--bs-body-color);
  border-color: var(--bs-border-color);
}

:global(body[data-bs-theme] .form-control),
:global(body[data-bs-theme] .form-select),
:global(body[data-bs-theme] textarea) {
  background-color: var(--bs-body-bg);
  color: var(--bs-body-color);
  border-color: var(--bs-border-color);
}

:global(body[data-bs-theme="dark"] .border-end) {
  border-color: var(--bs-border-color) !important;
}

.editable-name:hover,
.editable-username:hover,
.editable-name:focus,
.editable-username:focus {
  outline: 2px solid #6f42c1;
  background-color: var(--bs-secondary-bg);
}

.custom-btn-close {
  border-radius: 40%;
}

:global(body[data-bs-theme="dark"] .custom-btn-close){
  background-color: var(--bs-body-bg);
  border-color: var(--bs-border-color);
  color: white;
}

:global(body[data-bs-theme="light"] .custom-btn-close){
  background-color: var(--bs-body-bg);
  border-color: var(--bs-border-color);
  color: black;
}

.custom-btn-close:hover {
  background-color: red;
  border-color: red;
  color: white;
}
</style>