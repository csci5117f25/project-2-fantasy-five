<template>
  <div class="container py-4">
    <!-- Header -->
    <div class="d-flex justify-content-between align-items-center mb-4">
      <button class="btn btn-outline-secondary" @click="$router.back()">← Back</button>
      <h2 class="mb-0">Add New {{ currentType }}</h2>
      <button class="btn btn-primary" :disabled="!isFormValid || saving" @click="saveItem">
        {{ saving ? 'Saving...' : 'Save' }}
      </button>
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
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useCurrentUser } from 'vuefire'
import { collection, addDoc, serverTimestamp, query, getDocs } from 'firebase/firestore'
import { ref as storageRef, uploadBytes, getDownloadURL } from 'firebase/storage'
import { db, storage } from '@/firebase'

export default {
  name: 'CreateView',
  setup() {
    const router = useRouter()
    const route = useRoute()
    const fileInput = ref(null)
    const currentUser = useCurrentUser()
    
    const getTypeFromQuery = () => {
      const type = route.query.type
      if (type === 'Outfit' || type === 'outfit') {
        return 'Outfit'
      }
      return 'Clothing'
    }
    
    const currentType = ref(getTypeFromQuery())
    const types = ['Clothing', 'Outfit']
    
    // Watch for route query changes to update type
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

    const categories = ['head', 'top', 'bottom', 'shoe', 'accessory']
    const seasons = ['Spring', 'Summer', 'Fall', 'Winter', 'All Season']
    const colors = ['Black', 'White', 'Red', 'Blue', 'Green', 'Yellow', 'Purple', 'Pink', 'Orange', 'Brown', 'Gray', 'Multi']
    const events = ['Casual', 'Formal', 'Work', 'Party', 'Sports', 'Beach', 'Date', 'Travel']

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
        
        availableItems.value = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }))
      } catch (error) {
        console.error('Error loading clothing items:', error)
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
      fileInput.value.value = ''
    }

    const availableSizes = computed(() => {
      const category = formData.value.category
      if (category === 'top' || category === 'head') {
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
          if (currentType.value === 'Outfit') {
            alert('Please fill in the outfit name.')
          } else {
            alert('Please fill in all required fields (name, category) and add an image.')
          }
          return
        }
        
        saving.value = true
        
        if (!currentUser.value) {
          alert('You must be logged in to save items.')
          router.push('/login')
          return
        }

        let imageDownloadURL = null
        
        if (imageFile.value) {
          if (!currentUser.value) {
            alert('You must be logged in to upload images. Please log in again.')
            router.push('/login')
            saving.value = false
            return
          }
          
          try {
            const storageFolder = currentType.value === 'Outfit' ? 'outfits' : 'clothingItems'
            const fileName = `${Date.now()}-${imageFile.value.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`
            const storagePath = `users/${currentUser.value.uid}/${storageFolder}/${fileName}`
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
              imageDownloadURL = null
            } else if (uploadError.message?.includes('CORS') || uploadError.message?.includes('cors')) {
              alert('Image upload failed due to CORS configuration. The item will be saved without an image.')
              imageDownloadURL = null
            } else {
              alert(`Image upload failed: ${uploadError.message || uploadError.code || 'Unknown error'}. The item will be saved without an image.`)
              imageDownloadURL = null
            }
          }
        }

        const itemData = {
          name: formData.value.title,
          description: formData.value.description || '',
          seasons: Array.isArray(formData.value.seasons) ? formData.value.seasons : [],
          colors: Array.isArray(formData.value.colors) ? formData.value.colors : [],
          events: Array.isArray(formData.value.events) ? formData.value.events : [],
          tags: Array.isArray(formData.value.tags) ? formData.value.tags : [],
          imageUrl: imageDownloadURL || '',
          userId: currentUser.value.uid,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
          favorite: false
        }
        
        if (currentType.value === 'Clothing') {
          itemData.category = formData.value.category
        }

        if (currentType.value === 'Outfit') {
          itemData.clothingItemIds = selectedItems.value.length > 0 
            ? selectedItems.value.map(item => item.id) 
            : []
          itemData.itemDetails = selectedItems.value.length > 0 
            ? selectedItems.value 
            : []
        }

        const collectionName = currentType.value === 'Outfit' ? 'outfits' : 'clothingItems'
        await addDoc(collection(db, 'users', currentUser.value.uid, collectionName), itemData)
        
        alert(`${currentType.value} saved successfully!`)
        
        if (currentType.value === 'Outfit') {
          router.push('/app/outfits')
        } else {
          router.push('/app/clothing')
        }
        
      } catch (error) {
        console.error('Error saving item:', error)
        alert(`Failed to save item: ${error.message || 'Unknown error'}.`)
      } finally {
        saving.value = false
      }
    }

    onMounted(() => {
      loadAvailableItems()
    })

    return {
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
      getCategoryIcon,
      toggleItemSelection,
      isItemSelected,
      removeFromOutfit,
      confirmItemSelection,
      saveItem
    }
  }
}
</script>
