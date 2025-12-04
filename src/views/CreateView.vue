<template>
  <div class="container py-4">
    <!-- Header -->
    <div class="d-flex justify-content-between align-items-center mb-4">
      <button class="btn btn-outline-secondary" @click="$router.back()">← Back</button>
        <h2 class="mb-0 position-absolute start-50 translate-middle-x text-center">
          Add New {{ currentType }}
        </h2>
    </div>

    <!-- Type Selector -->
    <div class="btn-group mb-4 w-100" role="group">
      <button
        v-for="type in types"
        :key="type"
        type="button"
        class="btn"
        :class="currentType === type ? 'btn-dark' : 'btn-outline-dark'"
        @click="currentType = type"
      >
        {{ type }}
      </button>
    </div>

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
        <label class="form-label">{{ currentType === 'Outfit' ? 'Outfit Title' : 'Item Name' }} *</label>
        <input v-model="formData.title" type="text" class="form-control" placeholder="Enter title" required>
      </div>

      <div class="mb-3">
        <label class="form-label">Description</label>
        <textarea v-model="formData.description" class="form-control" rows="3" placeholder="Optional"></textarea>
      </div>

      <div class="row g-3 mb-3" v-if="currentType === 'Clothing'">
        <div class="col-md-6">
          <label class="form-label">Category *</label>
          <select v-model="formData.category" class="form-select" required>
            <option value="">Select Category</option>
            <option v-for="category in categories" :key="category">{{ category }}</option>
          </select>
        </div>
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

      <div class="row g-3 mb-3" v-if="currentType === 'Outfit'">
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

      <div v-if="currentType === 'Clothing'" class="row g-3 mb-3">
        <div class="col-md-6">
          <label class="form-label">Brand</label>
          <input v-model="formData.brand" type="text" class="form-control" placeholder="Optional">
        </div>
        <div class="col-md-6">
          <label class="form-label">Size</label>
          <select v-model="formData.size" class="form-select">
            <option value="">Select Size</option>
            <option v-for="size in availableSizes" :key="size" :value="size">{{ size }}</option>
          </select>
        </div>
      </div>

      <!-- Outfit Items -->
      <div v-if="currentType === 'Outfit'" class="mb-3">
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

      <div v-if="currentType === 'Outfit'" class="form-check form-switch mb-2">
        <input class="form-check-input" type="checkbox" id="collagePreviewToggle" v-model="collagePreviewEnabled">
        <label class="form-check-label" for="collagePreviewToggle">
          Show outfit preview
        </label>
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
            style="width: 100%; height: 300px; object-fit: contain; border-radius: 4px;"
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
import { collection, addDoc, serverTimestamp, query, getDocs } from 'firebase/firestore'
import { ref as storageRef, uploadBytes, uploadString, getDownloadURL } from 'firebase/storage'
import { db, storage } from '@/firebase'
import AlertModal from '@/components/AlertModal.vue'
import ImageEditor from '@/components/ImageEditor.vue'

export default {
  name: 'CreateView',
  components: {
    AlertModal,
    ImageEditor
  },
  setup() {
    const router = useRouter()
    const route = useRoute()
    const fileInput = ref(null)
    const currentUser = useCurrentUser()

    const getTypeFromQuery = () => {
      const type = route.query.type
      if (type === 'Outfit' || type === 'outfit') return 'Outfit'
      return 'Clothing'
    }

    const currentType = ref(getTypeFromQuery())
    const types = ['Clothing', 'Outfit']

    watch(() => route.query, () => {
      currentType.value = getTypeFromQuery()
    }, { immediate: true, deep: true })

    const imageUrl = ref(null)
    const imageFile = ref(null)
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
      category: '',
      seasons: [],
      colors: [],
      events: [],
      brand: '',
      size: '',
      tags: []
    })

    const selectedItems = ref([])
    const availableItems = ref([])

    const categories = ['head', 'top', 'bottom', 'shoe', 'accessory', 'dress']
    const seasons = ['Spring', 'Summer', 'Fall', 'Winter', 'All Season']
    const colors = ['Black', 'White', 'Red', 'Blue', 'Green', 'Yellow', 'Purple', 'Pink', 'Orange', 'Brown', 'Gray', 'Multi']
    const events = ['Casual', 'Formal', 'Work', 'Party', 'Sports', 'Beach', 'Date', 'Travel']

    const collagePreviewEnabled = ref(false) 
    const collagePreviewUrl = ref(null)   

    const isFormValid = computed(() => {
      if (currentType.value === 'Outfit') {
        return formData.value.title.trim() !== ''
      }
      return formData.value.title.trim() !== '' && formData.value.category !== ''
    })

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

    onMounted(loadAvailableItems)

    function loadImage(url) {
      return new Promise((resolve, reject) => {
        const img = new Image()
        img.crossOrigin = 'anonymous' // required to draw remote images
        img.onload = () => resolve(img)
        img.onerror = () => reject(new Error(`Failed to load image: ${url}`))
        img.src = url
      })
    }

    // Draw an image into target rect but *contain* (no cropping) — centered
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

      const urls = []
      selectedItems.value.forEach(it => {
        if (it && it.imageUrl) urls.push(it.imageUrl)
      })
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
          stream.getTracks().forEach(t => t.stop())
          window.removeEventListener('resize', updateViewfinder)
          document.body.removeChild(modal)
        }
        modal.querySelector('#closeCamera').onclick = closeCamera
        modal.querySelector('#cancelCamera').onclick = closeCamera
        modal.querySelector('#capturePhoto').onclick = () => {
          // Calculate crop area based on viewfinder
          // const videoRect = preview.getBoundingClientRect()
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
      fileInput.value.value = ''
      // regenerate preview without uploaded image
      if (collagePreviewEnabled.value) regeneratePreview()
    }

    const availableSizes = computed(() => {
      const category = formData.value.category
      if (category === 'top' || category === 'head' || category === 'dress') return ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL']
      if (category === 'bottom') {
        const waistSizes = Array.from({ length: 20 }, (_, i) => (26 + i * 2).toString())
        const inseamSizes = ['28', '30', '32', '34', '36', '38']
        const sizes = [...waistSizes]
        inseamSizes.forEach(inseam => {
          waistSizes.forEach(waist => sizes.push(`${waist}x${inseam}`))
        })
        return sizes
      }
      if (category === 'shoe') return Array.from({ length: 21 }, (_, i) => (4 + i * 0.5).toFixed(1))
      if (category === 'accessory') return ['One Size', 'XS', 'S', 'M', 'L', 'XL', 'XXL']
      return []
    })

    // tag, item selection, etc (same logic you had)
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
      const classes = {'Spring': 'bg-success text-white','Summer': 'bg-warning text-dark','Fall': 'bg-danger text-white','Winter': 'bg-info text-white','All Season': 'bg-secondary text-white'}
      return classes[season] || 'bg-primary text-white'
    }

    const getColorBadgeClass = (color) => {
      const darkColors = ['Black', 'Blue', 'Purple', 'Brown']
      return darkColors.includes(color) ? 'text-white' : 'text-dark'
    }

    const getColorBadgeStyle = (color) => {
      const colorMap = {'Black': { backgroundColor: '#000000' },'White': { backgroundColor: '#FFFFFF', border: '1px solid #ccc' },'Red': { backgroundColor: '#FF0000' },'Blue': { backgroundColor: '#0000FF' },'Green': { backgroundColor: '#008000' },'Yellow': { backgroundColor: '#FFFF00' },'Purple': { backgroundColor: '#800080' },'Pink': { backgroundColor: '#FFC0CB' },'Orange': { backgroundColor: '#FFA500' },'Brown': { backgroundColor: '#A52A2A' },'Gray': { backgroundColor: '#808080' },'Multi': { background: 'linear-gradient(45deg, #ff0000, #00ff00, #0000ff)' }}
      return colorMap[color] || { backgroundColor: '#6c757d' }
    }

    const getEventBadgeClass = (event) => {
      const classes = {'Casual': 'bg-secondary text-white','Formal': 'bg-dark text-white','Work': 'bg-primary text-white','Party': 'bg-danger text-white','Sports': 'bg-success text-white','Beach': 'bg-info text-white','Date': 'bg-warning text-dark','Travel': 'bg-primary text-white'}
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

    const getCategoryIcon = (category) => {
      const icons = {
        'Tops': '👕',
        'Bottoms': '👖',
        'Shoes': '👟',
        'Accessories': '👒',
        'Outerwear': '🧥',
        'Dresses': '👗'
      }
      return icons[category] || '👕'
    }

    const toggleItemSelection = (item) => {
      const index = selectedItems.value.findIndex(s => s.id === item.id)
      if (index > -1) selectedItems.value.splice(index, 1)
      else selectedItems.value.push({ ...item })
      // immediate preview update handled by watcher
    }

    const isItemSelected = (item) => selectedItems.value.some(s => s.id === item.id)

    const removeFromOutfit = (item) => {
      selectedItems.value = selectedItems.value.filter(s => s.id !== item.id)
    }

    const confirmItemSelection = () => showItemSelector.value = false

    const saveItem = async () => {
      try {
        if (!isFormValid.value) {
          showAlertModal('Please fill in all required fields.');
          return;
        }

        if (!currentUser.value) {
          showAlertModal('You must be logged in to save items.');
          router.push('/login');
          return;
        }

        saving.value = true;

        let imageDownloadURL = null;

        // Upload explicit image if provided
        if (imageFile.value) {
          try {
            const storageFolder = currentType.value === 'Outfit' ? 'outfits' : 'clothingItems';
            const fileName = `${Date.now()}-${imageFile.value.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
            const storagePath = `users/${currentUser.value.uid}/${storageFolder}/${fileName}`;
            const sRef = storageRef(storage, storagePath);
            await uploadBytes(sRef, imageFile.value, { contentType: imageFile.value.type || 'image/jpeg' });
            imageDownloadURL = await getDownloadURL(sRef);
          } catch (uploadError) {
            console.error('Image upload error:', uploadError);
            showAlertModal('Image upload failed. Saving without uploaded image.');
            imageDownloadURL = null;
          }
        }

        // Generate collages for Outfit if no explicit image
        let uploadedCollages = [];
        if (!imageDownloadURL && currentType.value === 'Outfit' && selectedItems.value.length > 0) {
          const collageDataUrls = await generateCollagesForAllItems(selectedItems.value);
          
          // Upload each collage
          for (let i = 0; i < collageDataUrls.length; i++) {
            try {
              const dataUrl = collageDataUrls[i];
              const fileName = `${Date.now()}-collage-${i}.png`;
              const storagePath = `users/${currentUser.value.uid}/outfits/${fileName}`;
              const sRef = storageRef(storage, storagePath);
              await uploadString(sRef, dataUrl, 'data_url');
              const url = await getDownloadURL(sRef);
              uploadedCollages.push(url);
            } catch (err) {
              console.error('Collage upload failed:', err);
            }
          }
        }

        // Build item data
        const itemData = {
          name: formData.value.title,
          description: formData.value.description || '',
          seasons: formData.value.seasons || [],
          colors: formData.value.colors || [],
          events: formData.value.events || [],
          tags: formData.value.tags || [],
          imageUrl: imageDownloadURL || (uploadedCollages[0] || ''), // first collage as main image
          collages: uploadedCollages, // all collages
          userId: currentUser.value.uid,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
          favorite: false
        };

        if (currentType.value === 'Clothing') {
          itemData.category = formData.value.category;
          itemData.brand = formData.value.brand || '';
          itemData.size = formData.value.size || '';
        }

        if (currentType.value === 'Outfit') {
          itemData.clothingItemIds = selectedItems.value.map(i => i.id);
          itemData.itemDetails = selectedItems.value;
        }

        const collectionName = currentType.value === 'Outfit' ? 'outfits' : 'clothingItems';
        await addDoc(collection(db, 'users', currentUser.value.uid, collectionName), itemData);

        router.push(currentType.value === 'Outfit' ? '/app/outfits' : '/app/clothing');

      } catch (error) {
        console.error('Error saving item:', error);
        showAlertModal(`Failed to save item: ${error.message || 'Unknown error'}.`);
      } finally {
        saving.value = false;
      }
    };


    function chunkIntoGroupsOfFour(items) {
      const groups = [];
      for (let i = 0; i < items.length; i += 4) {
        groups.push(items.slice(i, i + 4));
      }
      return groups;
    }

    async function generateCollagesForAllItems(selectedItems) {
      const groups = chunkIntoGroupsOfFour(selectedItems);

      const collagePromises = groups.map(group => {
        const urls = group.map(item => item.imageUrl).filter(Boolean);
        return generateTightCollageFromUrls(urls, 1200, 1500); // each group gets its own collage
      });

      return await Promise.all(collagePromises); // returns array of collages
    }

    const collages = ref([]);

    watch(selectedItems, async (newItems) => {
      if (!currentUser.value || !newItems || newItems.length === 0) {
        collages.value = [];
        return;
      }

      collages.value = await generateCollagesForAllItems(newItems); // returns array of collages
    });


    return {
      chunkIntoGroupsOfFour, 
      generateCollagesForAllItems,

      currentType,
      types,
      imageUrl,
      imageFile,
      newTag,
      saving,
      showItemSelector,
      formData,
      selectedItems,
      availableItems,
      categories,
      seasons,
      colors,
      events,
      fileInput,
      isFormValid,
      selectedSeason,
      selectedColor,
      selectedEvent,
      availableSizes,
      collagePreviewEnabled,
      collagePreviewUrl,
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
      getCategoryIcon,
      toggleItemSelection,
      isItemSelected,
      removeFromOutfit,
      confirmItemSelection,
      saveItem,
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
