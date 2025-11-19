<template>
  <div class="container py-4">
    <!-- Header -->
    <div class="d-flex justify-content-between align-items-center mb-4">
      <button class="btn btn-outline-secondary" @click="$router.back()">← Back</button>
      <h2 class="mb-0">Edit Outfit</h2>
      <button class="btn btn-primary" :disabled="!isFormValid || saving || loading" @click="saveItem">
        {{ saving ? 'Saving...' : 'Save Changes' }}
      </button>
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

        <div v-if="imageUrl" class="position-relative d-inline-block">
          <img :src="imageUrl" alt="Preview" class="img-fluid rounded mb-2">
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

    <!-- Item Selector Modal -->
    <div v-if="showItemSelector" class="modal d-block" tabindex="-1" @click="showItemSelector = false">
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
                <img v-if="item.imageUrl" :src="item.imageUrl" class="img-fluid rounded mb-1" alt="">
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

    <!-- Hidden file input -->
    <input ref="fileInput" type="file" accept="image/*" @change="handleFileSelect" style="display: none">
  </div>
</template>


<script>
import { ref, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useCurrentUser } from 'vuefire'
import { doc, getDoc, updateDoc, serverTimestamp, collection, query, getDocs } from 'firebase/firestore'
import { ref as storageRef, uploadBytes, getDownloadURL } from 'firebase/storage'
import { db, storage, auth } from '@/firebase'

export default {
  name: 'EditOutfitView',
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

    const isFormValid = computed(() => {
      return formData.value.title.trim() !== ''
    })

    const loadAvailableItems = async () => {
      try {
        if (!currentUser.value) return

        const clothingQuery = query(collection(db, 'users', currentUser.value.uid, 'clothingItems'))
        const querySnapshot = await getDocs(clothingQuery)
        
        availableItems.value = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }))
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
          alert('Outfit not found')
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
        
        // Load selected items from itemDetails if available
        if (Array.isArray(outfit.itemDetails) && outfit.itemDetails.length > 0) {
          selectedItems.value = outfit.itemDetails.map(item => ({ ...item }))
        } else if (Array.isArray(outfit.clothingItemIds) && outfit.clothingItemIds.length > 0) {
          // Fallback: load items by IDs if itemDetails not available
          const items = []
          for (const itemId of outfit.clothingItemIds) {
            try {
              const itemRef = doc(db, 'users', currentUser.value.uid, 'clothingItems', itemId)
              const itemDoc = await getDoc(itemRef)
              if (itemDoc.exists()) {
                items.push({ id: itemDoc.id, ...itemDoc.data() })
              }
            } catch (error) {
              console.error(`Error loading item ${itemId}:`, error)
            }
          }
          selectedItems.value = items
        }
        
        loading.value = false
      } catch (error) {
        console.error('Error loading outfit:', error)
        alert('Failed to load outfit. Please try again.')
        router.push('/app/outfits')
      }
    }

    const takePhoto = async () => {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        alert('Camera not available. Please upload an image instead.')
        return
      }
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } })
        const modal = document.createElement('div')
        modal.className = 'modal d-block'
        modal.style.backgroundColor = 'rgba(0,0,0,0.8)'
        modal.innerHTML = '<div class="modal-dialog modal-dialog-centered"><div class="modal-content"><div class="modal-header"><h5 class="modal-title">Take Photo</h5><button type="button" class="btn-close" id="closeCamera"></button></div><div class="modal-body text-center"><video id="cameraPreview" autoplay playsinline style="max-width: 100%; max-height: 400px;"></video></div><div class="modal-footer"><button class="btn btn-secondary" id="cancelCamera">Cancel</button><button class="btn btn-primary" id="capturePhoto">Capture</button></div></div></div>'
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
              imageFile.value = new File([blob], `photo-${Date.now()}.jpg`, { type: 'image/jpeg' })
              imageUrl.value = URL.createObjectURL(blob)
            }
            closeCamera()
          }, 'image/jpeg', 0.9)
        }
      } catch (error) {
        console.error('Camera error:', error)
        alert('Could not access camera. Please upload an image instead.')
      }
    }

    const uploadImage = () => {
      fileInput.value.click()
    }

    const handleFileSelect = (event) => {
      const file = event.target.files[0]
      if (file) {
        imageFile.value = file
        imageUrl.value = URL.createObjectURL(file)
      }
    }

    const removeImage = () => {
      imageUrl.value = null
      imageFile.value = null
      existingImageUrl.value = null
      fileInput.value.value = ''
    }

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

    const saveItem = async () => {
      try {
        if (!isFormValid.value) {
          alert('Please fill in the outfit name.')
          return
        }
        
        saving.value = true
        
        if (!currentUser.value) {
          alert('You must be logged in to save items.')
          router.push('/login')
          return
        }

        const outfitId = route.params.id
        let imageDownloadURL = existingImageUrl.value
        
        if (imageFile.value) {
          try {
            const fileName = `${Date.now()}-${imageFile.value.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`
            const storagePath = `users/${currentUser.value.uid}/outfits/${fileName}`
            const fileRef = storageRef(storage, storagePath)
            
            await currentUser.value.getIdToken(true)
            
            await uploadBytes(fileRef, imageFile.value, {
              contentType: imageFile.value.type || 'image/jpeg'
            })
            imageDownloadURL = await getDownloadURL(fileRef)
          } catch (uploadError) {
            if (uploadError.code === 'storage/unauthorized') {
              alert('Permission denied: You may not be logged in or your session expired. Please log in again.')
              router.push('/login')
              saving.value = false
              return
            } else if (uploadError.code === 'storage/canceled') {
              // Keep existing image
            } else if (uploadError.message?.includes('CORS') || uploadError.message?.includes('cors')) {
              alert('Image upload failed due to CORS configuration. The outfit will be saved with the existing image.')
            } else {
              alert(`Image upload failed: ${uploadError.message || uploadError.code || 'Unknown error'}. The outfit will be saved with the existing image.`)
            }
          }
        }

        const outfitRef = doc(db, 'users', currentUser.value.uid, 'outfits', outfitId)
        await updateDoc(outfitRef, {
          name: formData.value.title,
          description: formData.value.description || '',
          seasons: Array.isArray(formData.value.seasons) ? formData.value.seasons : [],
          colors: Array.isArray(formData.value.colors) ? formData.value.colors : [],
          events: Array.isArray(formData.value.events) ? formData.value.events : [],
          tags: Array.isArray(formData.value.tags) ? formData.value.tags : [],
          clothingItemIds: selectedItems.value.length > 0 
            ? selectedItems.value.map(item => item.id) 
            : [],
          itemDetails: selectedItems.value.length > 0 
            ? selectedItems.value 
            : [],
          imageUrl: imageDownloadURL || '',
          updatedAt: serverTimestamp()
        })
        
        alert('Outfit updated successfully!')
        router.push(`/app/outfits/${outfitId}`)
        
      } catch (error) {
        console.error('Error updating outfit:', error)
        alert(`Failed to update outfit: ${error.message || 'Unknown error'}.`)
      } finally {
        saving.value = false
      }
    }

    onMounted(async () => {
      await loadAvailableItems()
      await loadOutfit()
    })

    return {
      loading,
      imageUrl,
      imageFile,
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
      saveItem
    }
  }
}
</script>

