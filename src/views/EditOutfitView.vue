<template>
  <div class="container py-4">
    <!-- Header -->
    <div class="d-flex justify-content-between align-items-center mb-4">
      <button class="btn btn-outline-secondary" @click="$router.back()">← Back</button>
      <h2 class="mb-0 position-absolute start-50 translate-middle-x text-center">
          Edit Outfit
       </h2>
      <!-- <button class="btn btn-primary" :disabled="!isFormValid || saving || loading" @click="saveItem">
        {{ saving ? 'Saving...' : 'Save Changes' }}
      </button> -->
    </div>

    <div v-if="loading" class="text-center py-5">
      <div class="spinner-border text-primary" role="status">
        <span class="visually-hidden">Loading...</span>
      </div>
      <p class="mt-2">Loading outfit...</p>
    </div>

    <div v-else>
      <!-- Image Upload Section -->
      <div class="mb-4 text-center">
        <div class="mb-2">
          <button class="btn btn-outline-secondary me-2" @click="takePhoto">📸 Take Photo</button>
          <button class="btn btn-outline-secondary" @click="uploadImage">📁 Upload Image</button>
        </div>

        <div v-if="imageUrl" class="position-relative d-inline-block image-container" style="max-width: 400px; width: 100%;">
          <img :src="imageUrl" alt="Preview" class="rounded mb-2" style="width: 100%; height: 100%; object-fit: cover;">
          <button @click="removeImage" class="btn-close position-absolute top-0 end-0"></button>
        </div>
        <div v-else class="border border-secondary rounded py-5 px-3">
          <div class="fs-1 mb-2">📷</div>
          <p class="mb-0 text-muted">Upload or take a photo to get started</p>
        </div>
      </div>

      <!-- Form -->
      <form>
        <div class="mb-3">
          <label class="form-label">Outfit Title *</label>
          <input v-model="formData.title" type="text" class="form-control" placeholder="Enter title" required>
        </div>

        <div class="mb-3">
          <label class="form-label">Description</label>
          <textarea v-model="formData.description" class="form-control" rows="3" placeholder="Optional"></textarea>
        </div>

      <div class="row g-3 mb-3">
        <div class="col-md-6">
          <label class="form-label">Seasons</label>
          <div class="input-group mb-2">
            <select v-model="selectedSeason" class="form-select" @change="addSeason">
              <option value="">Select Season</option>
              <option v-for="season in seasons" :key="season" :value="season" :disabled="formData.seasons.includes(season)">
                {{ season }}
              </option>
            </select>
          </div>
          <div v-if="formData.seasons.length > 0" class="d-flex flex-wrap gap-2">
            <span v-for="season in formData.seasons" :key="season" :class="`badge ${getSeasonBadgeClass(season)}`">
              {{ season }}
              <button type="button" class="btn-close btn-close-white btn-sm ms-1" @click="removeSelection('seasons', season)"></button>
            </span>
          </div>
        </div>
      </div>

      <div class="row g-3 mb-3">
        <div class="col-md-6">
          <label class="form-label">Colors</label>
          <div class="input-group mb-2">
            <select v-model="selectedColor" class="form-select" @change="addColor">
              <option value="">Select Color</option>
              <option v-for="color in colors" :key="color" :value="color" :disabled="formData.colors.includes(color)">
                {{ color }}
              </option>
            </select>
          </div>
          <div v-if="formData.colors.length > 0" class="d-flex flex-wrap gap-2">
            <span v-for="color in formData.colors" :key="color" :class="`badge ${getColorBadgeClass(color)}`" :style="getColorBadgeStyle(color)">
              {{ color }}
              <button type="button" class="btn-close btn-close-white btn-sm ms-1" @click="removeSelection('colors', color)"></button>
            </span>
          </div>
        </div>
        <div class="col-md-6">
          <label class="form-label">Event Types</label>
          <div class="input-group mb-2">
            <select v-model="selectedEvent" class="form-select" @change="addEvent">
              <option value="">Select Event</option>
              <option v-for="event in events" :key="event" :value="event" :disabled="formData.events.includes(event)">
                {{ event }}
              </option>
            </select>
          </div>
          <div v-if="formData.events.length > 0" class="d-flex flex-wrap gap-2">
            <span v-for="event in formData.events" :key="event" :class="`badge ${getEventBadgeClass(event)}`">
              {{ event }}
              <button type="button" class="btn-close btn-close-white btn-sm ms-1" @click="removeSelection('events', event)"></button>
            </span>
          </div>
        </div>
      </div>

      <!-- Outfit Items -->
      <div class="mb-3">
        <label class="form-label">Outfit Items</label>
        <div class="d-flex flex-wrap gap-2">
          <div
            v-for="item in selectedItems"
            :key="item.id"
            class="badge bg-secondary d-flex align-items-center gap-1"
          >
            {{ item.name }}
            <button type="button" class="btn-close btn-close-white btn-sm" @click="removeFromOutfit(item)"></button>
          </div>
          <button type="button" class="btn btn-outline-secondary btn-sm" @click="showItemSelector = true">
            + Add Clothing Item
          </button>
        </div>
      </div>

      <div class="form-check form-switch mb-2">
        <input class="form-check-input" type="checkbox" id="collagePreviewToggle" v-model="collagePreviewEnabled">
        <label class="form-check-label" for="collagePreviewToggle">Show collage preview</label>
      </div>

      <div v-if="collagePreviewEnabled && selectedItems.length > 0" class="mb-3 text-center">
        <div 
          class="d-grid gap-2 border rounded p-2 justify-items-center align-items-center"
          :style="{
            gridTemplateColumns: `repeat(${Math.ceil(Math.sqrt(selectedItems.length))}, 1fr)`,
            gridAutoRows: '1fr'
          }"
        >
          <img 
            v-for="item in selectedItems" 
            :key="item.id" 
            :src="item.imageUrl" 
            alt="Item preview" 
            style="width: 100%; height: 100px; object-fit: contain; border-radius: 4px;"
          >
        </div>
        <div class="small text-muted mt-1">Preview updates as you add/remove items.</div>
      </div>


      <!-- Tags -->
      <div class="mb-3">
        <label class="form-label">Tags</label>
        <div class="input-group mb-2">
          <input
            v-model="newTag"
            type="text"
            class="form-control"
            placeholder="Add tags..."
            @keydown.enter.prevent="addTag"
            @keydown.space.prevent="addTag"
          >
          <button class="btn btn-outline-secondary" type="button" @click="addTag">+</button>
        </div>
        <div class="d-flex flex-wrap gap-2">
          <span v-for="tag in formData.tags" :key="tag" class="badge bg-info text-dark">
            {{ tag }}
            <button type="button" class="btn-close btn-close-white btn-sm ms-1" @click="removeTag(tag)"></button>
          </span>
        </div>
      </div>
    </form>
    </div>

    <Teleport to="body">
      <!-- Item Selector Modal -->
      <div 
        v-if="showItemSelector" 
        class="modal fade show d-block custom-fixed-modal" 
        tabindex="-1" 
        @click="showItemSelector = false"
        style="background: rgba(0,0,0,0.45);"
      >
        <div class="modal-dialog modal-dialog-scrollable" @click.stop>
          <div class="modal-content">
            <div class="modal-header">
              <h5 class="modal-title">Select Clothing Items</h5>
              <button type="button" class="btn-close" @click="showItemSelector = false"></button>
            </div>
            <div class="modal-body">
              <div class="row g-2">
                <div
                  v-for="item in availableItems"
                  :key="item.id"
                  class="col-4 text-center border p-2 rounded"
                  :class="{ 'border-primary': isItemSelected(item) }"
                  @click="toggleItemSelection(item)"
                  style="cursor:pointer"
                >
                  <img v-if="item.imageUrl" :src="item.imageUrl" class="img-fluid rounded mb-1">
                  <div v-else class="fs-3 mb-1">👕</div>
                  <div class="small">{{ item.name || item.title }}</div>
                </div>
              </div>
            </div>
            <div class="modal-footer">
              <button type="button" class="btn btn-secondary" @click="showItemSelector = false">Cancel</button>
              <button type="button" class="btn btn-primary" @click="confirmItemSelection">Add Selected</button>
            </div>
          </div>
        </div>
      </div>
    </Teleport>

    <div>
      <button class="btn btn-primary float-end" :disabled="!isFormValid || saving" @click="saveItem">
        {{ saving ? 'Saving...' : 'Save' }}
      </button>
    </div>

    <!-- Hidden file input -->
    <input ref="fileInput" type="file" accept="image/*" @change="handleFileSelect" style="display: none">

    <!-- Alert Modal -->
    <AlertModal v-model:show="showAlert" :message="alertMessage" />

    <!-- Image Editor Modal -->
    <ImageEditor
      v-model:show="showImageEditor"
      :imageUrl="editingImageUrl"
      @confirm="handleImageEditConfirm"
      @cancel="handleImageEditCancel"
    />
  </div>
</template>


<script>
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useCurrentUser } from 'vuefire'
import { doc, getDoc, updateDoc, serverTimestamp, collection, query, getDocs } from 'firebase/firestore'
import { ref as storageRef, uploadBytes, uploadString, getDownloadURL } from 'firebase/storage'
import { db, storage } from '@/firebase'
import { deleteImageFromStorage } from '@/utils/imageCleanup'
import AlertModal from '@/components/AlertModal.vue'
import ImageEditor from '@/components/ImageEditor.vue'

export default {
  name: 'EditOutfitView',
  components: {
    AlertModal,
    ImageEditor
  },
  setup() {
    const router = useRouter()
    const route = useRoute()
    const fileInput = ref(null)
    const currentUser = useCurrentUser()
    const loading = ref(true)

    const imageUrl = ref(null)            
    const imageFile = ref(null)           
    const existingImageUrl = ref(null)    
    const newTag = ref('')
    const saving = ref(false)
    const showItemSelector = ref(false)
    const selectedSeason = ref('')
    const selectedColor = ref('')
    const selectedEvent = ref('')
    const showAlert = ref(false)
    const alertMessage = ref('')
    
    const showAlertModal = (message) => {
      alertMessage.value = message
      showAlert.value = true
    }

    // Image editor state
    const showImageEditor = ref(false)
    const editingImageUrl = ref(null)

    const formData = ref({
      title: '',
      description: '',
      seasons: [],
      colors: [],
      events: [],
      tags: []
    })

    const selectedItems = ref([])
    const availableItems = ref([])

    const seasons = ['Spring', 'Summer', 'Fall', 'Winter', 'All Season']
    const colors = ['Black', 'White', 'Red', 'Blue', 'Green', 'Yellow', 'Purple', 'Pink', 'Orange', 'Brown', 'Gray', 'Multi']
    const events = ['Casual', 'Formal', 'Work', 'Party', 'Sports', 'Beach', 'Date', 'Travel']

    const isFormValid = computed(() => formData.value.title.trim() !== '')

    const collagePreviewEnabled = ref(false)
    const collagePreviewUrl = ref(null)

    const loadAvailableItems = async () => {
      try {
        if (!currentUser.value) return
        const clothingQuery = query(collection(db, 'users', currentUser.value.uid, 'clothingItems'))
        const querySnapshot = await getDocs(clothingQuery)
        availableItems.value = querySnapshot.docs.map(d => ({ id: d.id, ...d.data() }))
      } catch (error) {
        console.error('Error loading clothing items:', error)
      }
    }

    const loadOutfit = async () => {
      try {
        if (!currentUser.value) {
          router.push('/login')
          return
        }
        const outfitId = route.params.id
        const outfitRef = doc(db, 'users', currentUser.value.uid, 'outfits', outfitId)
        const outfitDoc = await getDoc(outfitRef)
        if (!outfitDoc.exists()) {
          showAlertModal('Outfit not found')
          router.push('/app/outfits')
          return
        }
        const outfit = outfitDoc.data()
        formData.value.title = outfit.name || ''
        formData.value.description = outfit.description || ''
        formData.value.seasons = Array.isArray(outfit.seasons) ? [...outfit.seasons] : []
        formData.value.colors = Array.isArray(outfit.colors) ? [...outfit.colors] : []
        formData.value.events = Array.isArray(outfit.events) ? [...outfit.events] : []
        formData.value.tags = Array.isArray(outfit.tags) ? [...outfit.tags] : []

        existingImageUrl.value = outfit.imageUrl || null
        imageUrl.value = outfit.imageUrl || null

        if (Array.isArray(outfit.itemDetails) && outfit.itemDetails.length > 0) {
          selectedItems.value = outfit.itemDetails.map(i => ({ ...i }))
        } else if (Array.isArray(outfit.clothingItemIds) && outfit.clothingItemIds.length > 0) {
          const items = []
          for (const id of outfit.clothingItemIds) {
            try {
              const itRef = doc(db, 'users', currentUser.value.uid, 'clothingItems', id)
              const itDoc = await getDoc(itRef)
              if (itDoc.exists()) items.push({ id: itDoc.id, ...itDoc.data() })
            } catch (err) {
              console.error(`Error loading item ${id}`, err)
            }
          }
          selectedItems.value = items
        }

        loading.value = false
      } catch (error) {
        console.error('Error loading outfit:', error)
        showAlertModal('Failed to load outfit. Please try again.')
        router.push('/app/outfits')
      }
    }

    onMounted(async () => {
      await loadAvailableItems()
      await loadOutfit()
    })

    /* -------------- collage utils --------------- */
    function loadImage(url) {
      return new Promise((resolve, reject) => {
        const img = new Image()
        img.crossOrigin = 'anonymous'
        img.onload = () => resolve(img)
        img.onerror = () => reject(new Error(`Failed to load image: ${url}`))
        img.src = url
      })
    }

    function drawImageContain(ctx, img, dx, dy, dWidth, dHeight) {
      const iw = img.width
      const ih = img.height
      const scale = Math.min(dWidth / iw, dHeight / ih)
      const sw = iw * scale
      const sh = ih * scale
      const sx = dx + (dWidth - sw) / 2
      const sy = dy + (dHeight - sh) / 2
      ctx.drawImage(img, 0, 0, iw, ih, sx, sy, sw, sh)
    }

    function drawImageFill(ctx, img, dx, dy, dWidth, dHeight, anchorLeft = false, anchorTop = false) {
      const iw = img.width
      const ih = img.height
      const imgAspect = iw / ih
      const cellAspect = dWidth / dHeight
      
      let sw, sh, sx, sy
      
      if (imgAspect > cellAspect) {
        sw = dWidth
        sh = dWidth / imgAspect
        sx = dx
        sy = anchorTop ? dy : dy + dHeight - sh
      } else {
        sh = dHeight
        sw = dHeight * imgAspect
        sx = anchorLeft ? dx : dx + dWidth - sw
        sy = dy
      }
      
      ctx.drawImage(img, 0, 0, iw, ih, sx, sy, sw, sh)
    }

    async function generateCollageFromUrls(urls = [], size = 800) {
      const imagesToUse = urls.slice(0, 6)
      if (imagesToUse.length === 0) return null

      const canvas = document.createElement('canvas')
      canvas.width = size
      canvas.height = size
      const ctx = canvas.getContext('2d')

      ctx.fillStyle = '#ffffff'
      ctx.fillRect(0, 0, size, size)

      const imgs = await Promise.all(imagesToUse.map(u => loadImage(u)))

      if (imgs.length === 1) {
        drawImageContain(ctx, imgs[0], 0, 0, size, size)
      } else if (imgs.length === 2) {
        const w = Math.floor(size / 2)
        drawImageContain(ctx, imgs[0], 0, 0, w, size)
        drawImageContain(ctx, imgs[1], w, 0, size - w, size)
      } else if (imgs.length === 3) {
        const half = Math.floor(size / 2)
        drawImageContain(ctx, imgs[0], 0, 0, half, half)
        drawImageContain(ctx, imgs[1], half, 0, size - half, half)
        drawImageContain(ctx, imgs[2], 0, half, size, size - half)
      } else if (imgs.length === 4) {
        const half = Math.floor(size / 2)
        drawImageContain(ctx, imgs[0], 0, 0, half, half)
        drawImageContain(ctx, imgs[1], half, 0, size - half, half)
        drawImageContain(ctx, imgs[2], 0, half, half, size - half)
        drawImageContain(ctx, imgs[3], half, half, size - half, size - half)
      } else if (imgs.length === 5) {
        const third = Math.floor(size / 3)
        const half = Math.floor(size / 2)
        drawImageContain(ctx, imgs[0], 0, 0, half, half)
        drawImageContain(ctx, imgs[1], half, 0, size - half, half)
        drawImageContain(ctx, imgs[2], 0, half, third, size - half)
        drawImageContain(ctx, imgs[3], third, half, third, size - half)
        drawImageContain(ctx, imgs[4], 2*third, half, size - 2*third, size - half)
      } else if (imgs.length === 6) {
        const third = Math.floor(size / 3)
        const half = Math.floor(size / 2)
        drawImageContain(ctx, imgs[0], 0, 0, half, half)
        drawImageContain(ctx, imgs[1], half, 0, size - half, half)
        drawImageContain(ctx, imgs[2], 0, half, third, size - half)
        drawImageContain(ctx, imgs[3], third, half, third, size - half)
        drawImageContain(ctx, imgs[4], 2*third, half, third, size - half)
        drawImageContain(ctx, imgs[5], 0, size - half, size, half)
      }

      return canvas.toDataURL('image/png')
    }

    async function generateTightCollageFromUrls(urls = [], width = 800, height = 1000) {
      const imagesToUse = urls.slice(0, 4)
      if (imagesToUse.length === 0) return null

      const canvas = document.createElement('canvas')
      canvas.width = width
      canvas.height = height
      const ctx = canvas.getContext('2d')
      ctx.fillStyle = '#ffffff'
      ctx.fillRect(0, 0, width, height)

      const imgs = await Promise.all(imagesToUse.map(u => loadImage(u).catch(() => null))).then(results => results.filter(Boolean))
      
      if (imgs.length === 0) return null

      const halfWidth = width / 2
      const halfHeight = height / 2

      if (imgs.length === 1) {
        drawImageFill(ctx, imgs[0], 0, 0, width, height, true, true)
      } else if (imgs.length === 2) {
        drawImageFill(ctx, imgs[0], 0, 0, halfWidth, height, true, true)
        drawImageFill(ctx, imgs[1], halfWidth, 0, halfWidth, height, false, true)
      } else if (imgs.length === 3) {
        drawImageFill(ctx, imgs[0], 0, 0, halfWidth, halfHeight, true, true)
        drawImageFill(ctx, imgs[1], halfWidth, 0, halfWidth, halfHeight, false, true)
        drawImageFill(ctx, imgs[2], 0, halfHeight, width, halfHeight, true, false)
      } else {
        drawImageFill(ctx, imgs[0], 0, 0, halfWidth, halfHeight, true, true)
        drawImageFill(ctx, imgs[1], halfWidth, 0, halfWidth, halfHeight, false, true)
        drawImageFill(ctx, imgs[2], 0, halfHeight, halfWidth, halfHeight, true, false)
        drawImageFill(ctx, imgs[3], halfWidth, halfHeight, halfWidth, halfHeight, false, false)
      }

      return canvas.toDataURL('image/png')
    }

    const regeneratePreview = async () => {
      if (!collagePreviewEnabled.value) {
        collagePreviewUrl.value = null
        return
      }

      const urls = selectedItems.value.map(it => it.imageUrl).filter(Boolean)
      if (urls.length === 0 && imageUrl.value) urls.push(imageUrl.value)
      if (urls.length === 0) {
        collagePreviewUrl.value = null
        return
      }

      try {
        collagePreviewUrl.value = await generateCollageFromUrls(urls, 800)
      } catch (err) {
        console.error('Failed to generate collage preview', err)
        collagePreviewUrl.value = null
      }
    }

    watch(selectedItems, () => {
      if (collagePreviewEnabled.value) regeneratePreview()
    }, { deep: true })

    watch(imageUrl, () => {
      if (collagePreviewEnabled.value) regeneratePreview()
    })

    /* ---------------- image upload & file handling ---------------- */
    const takePhoto = async () => {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        showAlertModal('Camera not available. Please upload an image instead.')
        return
      }
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } })
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
        
        // Standard clothing product photo size: 800x1000 (portrait)
        const targetWidth = 800
        const targetHeight = 1000
        const aspectRatio = targetWidth / targetHeight
        
        // Create viewfinder overlay
        const maskId = `viewfinderMask-${Date.now()}`
        const updateViewfinder = () => {
          const videoRect = preview.getBoundingClientRect()
          const videoAspect = preview.videoWidth / preview.videoHeight
          
          let viewfinderWidth, viewfinderHeight, viewfinderLeft, viewfinderTop
          
          if (videoAspect > aspectRatio) {
            // Video is wider than target, fit to height
            viewfinderHeight = videoRect.height
            viewfinderWidth = viewfinderHeight * aspectRatio
            viewfinderLeft = (videoRect.width - viewfinderWidth) / 2
            viewfinderTop = 0
          } else {
            // Video is taller than target, fit to width
            viewfinderWidth = videoRect.width
            viewfinderHeight = viewfinderWidth / aspectRatio
            viewfinderLeft = 0
            viewfinderTop = (videoRect.height - viewfinderHeight) / 2
          }
          
          // Create SVG overlay with darkened areas
          overlay.innerHTML = `
            <svg width="100%" height="100%" style="position: absolute; top: 0; left: 0;">
              <defs>
                <mask id="${maskId}">
                  <rect width="100%" height="100%" fill="white"/>
                  <rect x="${viewfinderLeft}" y="${viewfinderTop}" width="${viewfinderWidth}" height="${viewfinderHeight}" fill="black"/>
                </mask>
              </defs>
              <rect width="100%" height="100%" fill="rgba(0,0,0,0.6)" mask="url(#${maskId})"/>
              <rect x="${viewfinderLeft}" y="${viewfinderTop}" width="${viewfinderWidth}" height="${viewfinderHeight}" 
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
          stream.getTracks().forEach(track => track.stop())
          window.removeEventListener('resize', updateViewfinder)
          document.body.removeChild(modal)
        }
        modal.querySelector('#closeCamera').onclick = closeCamera
        modal.querySelector('#cancelCamera').onclick = closeCamera
        modal.querySelector('#capturePhoto').onclick = () => {
          // Calculate crop area based on viewfinder
          const videoAspect = preview.videoWidth / preview.videoHeight
          
          let cropWidth, cropHeight, cropX, cropY
          
          if (videoAspect > aspectRatio) {
            // Video is wider, crop width
            cropHeight = preview.videoHeight
            cropWidth = cropHeight * aspectRatio
            cropX = (preview.videoWidth - cropWidth) / 2
            cropY = 0
          } else {
            // Video is taller, crop height
            cropWidth = preview.videoWidth
            cropHeight = cropWidth / aspectRatio
            cropX = 0
            cropY = (preview.videoHeight - cropHeight) / 2
          }
          
          // Draw cropped area to canvas at target size
          canvas.width = targetWidth
          canvas.height = targetHeight
          ctx.drawImage(preview, cropX, cropY, cropWidth, cropHeight, 0, 0, targetWidth, targetHeight)
          
          canvas.toBlob((blob) => {
            if (blob) {
              imageFile.value = new File([blob], `photo-${Date.now()}.jpg`, { type: 'image/jpeg' })
              imageUrl.value = URL.createObjectURL(blob)
            }
            closeCamera()
          }, 'image/jpeg', 0.9)
        }
      } catch (error) {
        console.error('Camera error:', error)
        showAlertModal('Could not access camera. Please upload an image instead.')
      }
    }

    const uploadImage = () => fileInput.value.click()
    const handleFileSelect = (event) => {
      const file = event.target.files[0]
      if (file) {
        const objectUrl = URL.createObjectURL(file)
        editingImageUrl.value = objectUrl
        showImageEditor.value = true
      }
    }

    const handleImageEditConfirm = (blob) => {
      if (blob) {
        imageFile.value = new File([blob], `edited-${Date.now()}.jpg`, { type: 'image/jpeg' })
        imageUrl.value = URL.createObjectURL(blob)
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
      fileInput.value.value = ''
    }
    const removeImage = () => {
      imageUrl.value = null
      imageFile.value = null
      existingImageUrl.value = null
      fileInput.value.value = ''
      if (collagePreviewEnabled.value) regeneratePreview()
    }

    /* ---------------- Selection handlers ---------------- */
    const addSeason = () => {
      if (selectedSeason.value && !formData.value.seasons.includes(selectedSeason.value)) {
        formData.value.seasons.push(selectedSeason.value)
        selectedSeason.value = ''
      }
    }

    const addColor = () => {
      if (selectedColor.value && !formData.value.colors.includes(selectedColor.value)) {
        formData.value.colors.push(selectedColor.value)
        selectedColor.value = ''
      }
    }

    const addEvent = () => {
      if (selectedEvent.value && !formData.value.events.includes(selectedEvent.value)) {
        formData.value.events.push(selectedEvent.value)
        selectedEvent.value = ''
      }
    }

    const removeSelection = (field, value) => {
      formData.value[field] = formData.value[field].filter(item => item !== value)
    }

    const getSeasonBadgeClass = (season) => {
      const classes = {
        'Spring': 'bg-success text-white',
        'Summer': 'bg-warning text-dark',
        'Fall': 'bg-danger text-white',
        'Winter': 'bg-info text-white',
        'All Season': 'bg-secondary text-white'
      }
      return classes[season] || 'bg-primary text-white'
    }

    const getColorBadgeClass = (color) => {
      const darkColors = ['Black', 'Blue', 'Purple', 'Brown']
      if (darkColors.includes(color)) {
        return 'text-white'
      }
      return 'text-dark'
    }

    const getColorBadgeStyle = (color) => {
      const colorMap = {
        'Black': { backgroundColor: '#000000' },
        'White': { backgroundColor: '#FFFFFF', border: '1px solid #ccc' },
        'Red': { backgroundColor: '#FF0000' },
        'Blue': { backgroundColor: '#0000FF' },
        'Green': { backgroundColor: '#008000' },
        'Yellow': { backgroundColor: '#FFFF00' },
        'Purple': { backgroundColor: '#800080' },
        'Pink': { backgroundColor: '#FFC0CB' },
        'Orange': { backgroundColor: '#FFA500' },
        'Brown': { backgroundColor: '#A52A2A' },
        'Gray': { backgroundColor: '#808080' },
        'Multi': { background: 'linear-gradient(45deg, #ff0000, #00ff00, #0000ff)' }
      }
      return colorMap[color] || { backgroundColor: '#6c757d' }
    }

    const getEventBadgeClass = (event) => {
      const classes = {
        'Casual': 'bg-secondary text-white',
        'Formal': 'bg-dark text-white',
        'Work': 'bg-primary text-white',
        'Party': 'bg-danger text-white',
        'Sports': 'bg-success text-white',
        'Beach': 'bg-info text-white',
        'Date': 'bg-warning text-dark',
        'Travel': 'bg-primary text-white'
      }
      return classes[event] || 'bg-secondary text-white'
    }

    const addTag = () => {
      const tag = newTag.value.trim()
      if (tag && !formData.value.tags.includes(tag)) {
        formData.value.tags.push(tag)
        newTag.value = ''
      }
    }

    const removeTag = (tag) => {
      formData.value.tags = formData.value.tags.filter(t => t !== tag)
    }

    const toggleItemSelection = (item) => {
      const index = selectedItems.value.findIndex(selected => selected.id === item.id)
      if (index > -1) {
        selectedItems.value.splice(index, 1)
      } else {
        selectedItems.value.push({...item})
      }
    }

    const isItemSelected = (item) => {
      return selectedItems.value.some(selected => selected.id === item.id)
    }

    const removeFromOutfit = (item) => {
      selectedItems.value = selectedItems.value.filter(selected => selected.id !== item.id)
    }

    const confirmItemSelection = () => {
      showItemSelector.value = false
    }

    /* ---------------- Save outfit ---------------- */
    const saveItem = async () => {
      try {
        if (!isFormValid.value) { showAlertModal('Please fill in the outfit name.'); return }
        saving.value = true
        if (!currentUser.value) { showAlertModal('You must be logged in to save items.'); router.push('/login'); saving.value=false; return }

        const outfitId = route.params.id
        let imageDownloadURL = null
        const oldImageUrl = existingImageUrl.value

        if(imageFile.value){
          try{
            const fileName=`${Date.now()}-${imageFile.value.name.replace(/[^a-zA-Z0-9.-]/g,'_')}`
            const storagePath=`users/${currentUser.value.uid}/outfits/${fileName}`
            const fRef = storageRef(storage, storagePath)
            await currentUser.value.getIdToken(true)
            await uploadBytes(fRef, imageFile.value, {contentType:imageFile.value.type||'image/jpeg'})
            imageDownloadURL = await getDownloadURL(fRef)
            
            // Delete old image if it exists and is different from the new one
            if (oldImageUrl && oldImageUrl !== imageDownloadURL) {
              await deleteImageFromStorage(oldImageUrl)
            }
          }catch(err){ console.error('Image upload failed', err) }
        }

        if(!imageDownloadURL && selectedItems.value.length>0){
          try{
            const urls=selectedItems.value.map(it=>it.imageUrl).filter(Boolean)
            const dataUrl = await generateTightCollageFromUrls(urls, 1200, 1500)
            if(dataUrl){
              const fileName=`${Date.now()}-collage.png`
              const storagePath=`users/${currentUser.value.uid}/outfits/${fileName}`
              const fRef=storageRef(storage, storagePath)
              await currentUser.value.getIdToken(true)
              await uploadString(fRef,dataUrl,'data_url')
              imageDownloadURL=await getDownloadURL(fRef)
              
              // Delete old image if it exists and is different from the new one
              if (oldImageUrl && oldImageUrl !== imageDownloadURL) {
                await deleteImageFromStorage(oldImageUrl)
              }
            }
          }catch(err){ console.error('Collage generation/upload failed',err) }
        }

        if(!imageDownloadURL) imageDownloadURL=existingImageUrl.value||null

        const outfitRef = doc(db, 'users', currentUser.value.uid, 'outfits', outfitId)
        await updateDoc(outfitRef,{
          name: formData.value.title,
          description: formData.value.description||'',
          seasons: Array.isArray(formData.value.seasons)?formData.value.seasons:[],
          colors: Array.isArray(formData.value.colors)?formData.value.colors:[],
          events: Array.isArray(formData.value.events)?formData.value.events:[],
          tags: Array.isArray(formData.value.tags)?formData.value.tags:[],
          clothingItemIds:selectedItems.value.length>0?selectedItems.value.map(item=>item.id):[],
          itemDetails:selectedItems.value.length>0?selectedItems.value:[],
          imageUrl:imageDownloadURL||'',
          updatedAt: serverTimestamp()
        })

        // alert('Outfit updated successfully!')
        router.push(`/app/outfits/${outfitId}`)
      } catch(error){
        console.error('Error updating outfit:',error)
        showAlertModal(`Failed to update outfit: ${error.message||'Unknown error'}.`)
      } finally{
        saving.value=false
      }
    }

    return {
      loading,
      imageUrl,
      imageFile,
      existingImageUrl,
      newTag,
      saving,
      showItemSelector,
      formData,
      selectedItems,
      availableItems,
      seasons,
      colors,
      events,
      fileInput,
      isFormValid,
      selectedSeason,
      selectedColor,
      selectedEvent,
      addSeason,
      addColor,
      addEvent,
      removeSelection,
      getSeasonBadgeClass,
      getColorBadgeClass,
      getColorBadgeStyle,
      getEventBadgeClass,
      takePhoto,
      uploadImage,
      handleFileSelect,
      removeImage,
      addTag,
      removeTag,
      toggleItemSelection,
      isItemSelected,
      removeFromOutfit,
      confirmItemSelection,
      saveItem,
      collagePreviewEnabled,
      collagePreviewUrl,
      regeneratePreview,
      showAlert,
      alertMessage,
      showAlertModal,
      showImageEditor,
      editingImageUrl,
      handleImageEditConfirm,
      handleImageEditCancel
    }
  }
}
</script>

<style scoped> 
.custom-fixed-modal {
  position: fixed !important;
  inset: 0 !important;

  display: flex !important;
  justify-content: center !important;
  align-items: center !important;

  z-index: 9999 !important;
}

.custom-fixed-modal .modal-dialog {
  margin: 0 !important; 
  max-height: 90vh;
}

.custom-fixed-modal .modal-content {
  max-height: 90vh;
  overflow-y: auto;
}
</style>