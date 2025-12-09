<template>
  <div class="container py-4">
    <!-- Header -->
    <div class="d-flex justify-content-between align-items-center mb-4">
      <button class="btn btn-outline-secondary" @click="$router.back()">← Back</button>
      <h2 class="mb-0 position-absolute start-50 translate-middle-x text-center">
          Edit Clothing Item
      </h2>
    </div>

    <div v-if="loading" class="text-center py-5">
      <div class="spinner-border text-primary" role="status">
        <span class="visually-hidden">Loading...</span>
      </div>
      <p class="mt-2">Loading item...</p>
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
          <label class="form-label">Item Name *</label>
          <input v-model="formData.title" type="text" class="form-control" placeholder="Enter title" required>
        </div>

        <div class="mb-3">
          <label class="form-label">Description</label>
          <textarea v-model="formData.description" class="form-control" rows="3" placeholder="Optional"></textarea>
        </div>

      <div class="row g-3 mb-3">
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
            <span 
              v-for="season in formData.seasons" 
              :key="season" 
              :class="`badge ${getSeasonBadgeClass(season)}`">
              {{ season }}
              <button 
                type="button-season" 
                class="btn-sm ms-1" 
                style="background: none; border: none; padding: 0; cursor: pointer; font-weight: bold;" 
                :style="{ color: season === 'Summer' ? '#000' : '#fff' }" 
                @click="removeSelection('seasons', season)">
                ×
              </button>
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
            <span 
              v-for="color in formData.colors" 
              :key="color" 
              :class="`badge ${getColorBadgeClass(color)}`" 
              :style="getColorBadgeStyle(color)">
              {{ color }}
              <button 
                type="button-color" 
                class="btn-sm ms-1" 
                style="background: none; border: none; padding: 0; cursor: pointer; font-weight: bold;" 
                :style="{ color: ['White', 'Yellow', 'Pink', 'Orange'].includes(color) ? '#000' : '#fff' }" 
                @click="removeSelection('colors', color)">
                ×
              </button>
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
            <span 
              v-for="event in formData.events" 
              :key="event" 
              :class="`badge ${getEventBadgeClass(event)}`">
              {{ event }}
              <button 
                type="button-event" 
                class="btn-sm ms-1" 
                style="background: none; border: none; padding: 0; cursor: pointer; font-weight: bold;" 
                :style="{ color: event === 'Date' ? '#000' : '#fff' }" 
                @click="removeSelection('events', event)">
                ×
              </button>
            </span>
          </div>
        </div>
      </div>

      <div class="row g-3 mb-3">
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
          <span 
            v-for="tag in formData.tags" 
            :key="tag" 
            class="tag-outline">
            {{ tag }}
            <button 
              type="button-tag" 
              class="btn-sm ms-1" 
              style="background: none; border: none; padding: 0; cursor: pointer; font-weight: bold; color: white" 
              @click="removeTag(tag)">
              ×
            </button>
          </span>
        </div>
      </div>
    </form>
    </div>

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
import { ref, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useCurrentUser } from 'vuefire'
import { doc, getDoc, updateDoc, serverTimestamp } from 'firebase/firestore'
import { ref as storageRef, uploadBytes, getDownloadURL } from 'firebase/storage'
import { db, storage } from '@/firebase'
import { deleteImageFromStorage } from '@/utils/imageCleanup'
import AlertModal from '@/components/AlertModal.vue'
import ImageEditor from '@/components/ImageEditor.vue'

export default {
  name: 'EditClothingView',
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

    const categories = ['head', 'top', 'bottom', 'shoe', 'accessory', 'dress']
    const seasons = ['Spring', 'Summer', 'Fall', 'Winter', 'All Season']
    const colors = ['Black', 'White', 'Red', 'Blue', 'Green', 'Yellow', 'Purple', 'Pink', 'Orange', 'Brown', 'Gray', 'Multi']
    const events = ['Casual', 'Formal', 'Work', 'Party', 'Sports', 'Beach', 'Date', 'Travel']

    const isFormValid = computed(() => {
      return formData.value.title.trim() !== '' && formData.value.category !== ''
    })

    const loadItem = async () => {
      try {
        if (!currentUser.value) {
          router.push('/login')
          return
        }

        const itemId = route.params.id
        const itemRef = doc(db, 'users', currentUser.value.uid, 'clothingItems', itemId)
        const itemDoc = await getDoc(itemRef)
        
        if (!itemDoc.exists()) {
          showAlertModal('Item not found')
          router.push('/app/clothing')
          return
        }

        const item = itemDoc.data()
        
        formData.value.title = item.name || ''
        formData.value.description = item.description || ''
        formData.value.category = item.category || ''
        formData.value.seasons = Array.isArray(item.seasons) ? [...item.seasons] : []
        formData.value.colors = Array.isArray(item.colors) ? [...item.colors] : []
        formData.value.events = Array.isArray(item.events) ? [...item.events] : []
        formData.value.brand = item.brand || ''
        formData.value.size = item.size || ''
        formData.value.tags = Array.isArray(item.tags) ? [...item.tags] : []
        
        existingImageUrl.value = item.imageUrl || null
        imageUrl.value = item.imageUrl || null
        
        loading.value = false
      } catch (error) {
        console.error('Error loading item:', error)
        showAlertModal('Failed to load item. Please try again.')
        router.push('/app/clothing')
      }
    }

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
        
        // Standard clothing product photo size: 800x1000 
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

    const uploadImage = () => {
      fileInput.value.click()
    }

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
    }

    const availableSizes = computed(() => {
      const category = formData.value.category
      if (category === 'top' || category === 'head' || category === 'dress') {
        return ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL']
      } else if (category === 'bottom') {
        const waistSizes = Array.from({length: 20}, (_, i) => (26 + i*2).toString())
        const inseamSizes = ['28', '30', '32', '34', '36', '38']
        const sizes = [...waistSizes]
        inseamSizes.forEach(inseam => {
          waistSizes.forEach(waist => {
            sizes.push(`${waist}x${inseam}`)
          })
        })
        return sizes
      } else if (category === 'shoe') {
        return Array.from({length: 21}, (_, i) => (4 + i*0.5).toFixed(1))
      } else if (category === 'accessory') {
        return ['One Size', 'XS', 'S', 'M', 'L', 'XL', 'XXL']
      }
      return []
    })

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
      const darkColors = ['Black', 'Blue', 'Purple', 'Brown', 'Green', 'Red', 'Multi', 'Gray']
      return darkColors.includes(color) ? 'text-white' : 'text-dark'
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

    const saveItem = async () => {
      try {
        if (!isFormValid.value) {
          showAlertModal('Please fill in all required fields (name, category).')
          return
        }
        
        saving.value = true
        
        if (!currentUser.value) {
          showAlertModal('You must be logged in to save items.')
          router.push('/login')
          return
        }

        const itemId = route.params.id
        let imageDownloadURL = existingImageUrl.value
        const oldImageUrl = existingImageUrl.value
        
        if (imageFile.value) {
          try {
            const fileName = `${Date.now()}-${imageFile.value.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`
            const storagePath = `users/${currentUser.value.uid}/clothingItems/${fileName}`
            const fileRef = storageRef(storage, storagePath)
            
            await currentUser.value.getIdToken(true)
            
            await uploadBytes(fileRef, imageFile.value, {
              contentType: imageFile.value.type || 'image/jpeg'
            })
            imageDownloadURL = await getDownloadURL(fileRef)
            
            // Delete old image if it exists and is different from the new one
            if (oldImageUrl && oldImageUrl !== imageDownloadURL) {
              await deleteImageFromStorage(oldImageUrl)
            }
          } catch (uploadError) {
            if (uploadError.code === 'storage/unauthorized') {
              showAlertModal('Permission denied: You may not be logged in or your session expired. Please log in again.')
              router.push('/login')
              saving.value = false
              return
            } else if (uploadError.code === 'storage/canceled') {
              // Keep existing image
            } else if (uploadError.message?.includes('CORS') || uploadError.message?.includes('cors')) {
              showAlertModal('Image upload failed due to CORS configuration. The item will be saved with the existing image.')
            } else {
              showAlertModal(`Image upload failed: ${uploadError.message || uploadError.code || 'Unknown error'}. The item will be saved with the existing image.`)
            }
          }
        }

        const itemRef = doc(db, 'users', currentUser.value.uid, 'clothingItems', itemId)
        await updateDoc(itemRef, {
          name: formData.value.title,
          description: formData.value.description || '',
          category: formData.value.category,
          seasons: Array.isArray(formData.value.seasons) ? formData.value.seasons : [],
          colors: Array.isArray(formData.value.colors) ? formData.value.colors : [],
          events: Array.isArray(formData.value.events) ? formData.value.events : [],
          tags: Array.isArray(formData.value.tags) ? formData.value.tags : [],
          brand: formData.value.brand || '',
          size: formData.value.size || '',
          imageUrl: imageDownloadURL || '',
          updatedAt: serverTimestamp()
        })
        
        // alert('Clothing item updated successfully!')
        router.push(`/app/clothing/${itemId}`)
        
      } catch (error) {
        console.error('Error updating item:', error)
        showAlertModal(`Failed to update item: ${error.message || 'Unknown error'}.`)
      } finally {
        saving.value = false
      }
    }

    onMounted(() => {
      loadItem()
    })

    return {
      loading,
      imageUrl,
      imageFile,
      newTag,
      saving,
      formData,
      categories,
      seasons,
      colors,
      events,
      fileInput,
      isFormValid,
      availableSizes,
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
      saveItem,
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
.tag-outline {
  border-radius: 0.5rem;             
  background-color: #7392b0;         
  color: white;                   
  font-size: 0.85rem;
  font-weight: 700;
  display: inline-block;
  transition: 0.2s ease;
  padding: 0.25rem 0.5rem;
}

button[type="button-color"], 
button[type="button-season"], 
button[type="button-event"], 
button[type="button-tag"] {
  border-radius: 0.5rem;
  font-size: 0.85rem;
  font-weight: 700;
  padding: 0.5rem 0.5rem;
  cursor: pointer;
  transition: 0.2s ease;
}
</style>