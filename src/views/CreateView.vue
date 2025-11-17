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

      <div class="row g-3 mb-3">
        <div class="col-md-6">
          <label class="form-label">Category *</label>
          <select v-model="formData.category" class="form-select" required>
            <option value="">Select Category</option>
            <option v-for="category in categories" :key="category">{{ category }}</option>
          </select>
        </div>
        <div class="col-md-6">
          <label class="form-label">Season</label>
          <select v-model="formData.season" class="form-select">
            <option value="">Select Season</option>
            <option v-for="season in seasons" :key="season">{{ season }}</option>
          </select>
        </div>
      </div>

      <div class="row g-3 mb-3">
        <div class="col-md-6">
          <label class="form-label">Color</label>
          <select v-model="formData.color" class="form-select">
            <option value="">Select Color</option>
            <option v-for="color in colors" :key="color">{{ color }}</option>
          </select>
        </div>
        <div class="col-md-6">
          <label class="form-label">Event Type</label>
          <select v-model="formData.event" class="form-select">
            <option value="">Select Event</option>
            <option v-for="event in events" :key="event">{{ event }}</option>
          </select>
        </div>
      </div>

      <div v-if="currentType === 'Clothing'" class="row g-3 mb-3">
        <div class="col-md-6">
          <label class="form-label">Brand</label>
          <input v-model="formData.brand" type="text" class="form-control" placeholder="Optional">
        </div>
        <div class="col-md-6">
          <label class="form-label">Size</label>
          <input v-model="formData.size" type="text" class="form-control" placeholder="Optional">
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
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { collection, addDoc, serverTimestamp, query, where, getDocs } from 'firebase/firestore'
import { ref as storageRef, uploadBytes, getDownloadURL } from 'firebase/storage'
import { db, storage, auth } from '@/firebase'

export default {
  name: 'CreateView',
  setup() {
    const router = useRouter()
    const fileInput = ref(null)
    
    const currentType = ref('Clothing')
    const types = ['Clothing', 'Outfit']
    
    const imageUrl = ref(null)
    const imageFile = ref(null)
    const newTag = ref('')
    const saving = ref(false)
    const showItemSelector = ref(false)
    
    const formData = ref({
      title: '',
      description: '',
      category: '',
      season: '',
      color: '',
      event: '',
      brand: '',
      size: '',
      tags: []
    })

    const selectedItems = ref([])
    const availableItems = ref([])

    const categories = ['Tops', 'Bottoms', 'Shoes', 'Accessories', 'Outerwear', 'Dresses']
    const seasons = ['Spring', 'Summer', 'Fall', 'Winter', 'All Season']
    const colors = ['Black', 'White', 'Red', 'Blue', 'Green', 'Yellow', 'Purple', 'Pink', 'Orange', 'Brown', 'Gray', 'Multi']
    const events = ['Casual', 'Formal', 'Work', 'Party', 'Sports', 'Beach', 'Date', 'Travel']

    const isFormValid = computed(() => {
      const basicValid = formData.value.title.trim() !== '' && 
                        formData.value.category !== '' && 
                        imageUrl.value !== null
      
      if (currentType.value === 'Outfit') {
        return basicValid && selectedItems.value.length > 0
      }
      
      return basicValid
    })

    const loadAvailableItems = async () => {
      try {
        const user = auth.currentUser
        if (!user) return

        const clothingQuery = query(
          collection(db, 'clothing'),
          where('userId', '==', user.uid)
        )
        const querySnapshot = await getDocs(clothingQuery)
        
        availableItems.value = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }))
      } catch (error) {
        console.error('Error loading clothing items:', error)
      }
    }

    const takePhoto = () => {
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        alert('Camera functionality would be implemented here. For now, please upload an image.')
      } else {
        uploadImage()
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
      if (!isFormValid.value) return
      
      saving.value = true
      try {
        const user = auth.currentUser
        if (!user) {
          throw new Error('User not authenticated')
        }

        let imageDownloadURL = null
        
        if (imageFile.value) {
          const fileRef = storageRef(storage, `${currentType.value.toLowerCase()}s/${user.uid}/${Date.now()}-${imageFile.value.name}`)
          await uploadBytes(fileRef, imageFile.value)
          imageDownloadURL = await getDownloadURL(fileRef)
        }

        const itemData = {
          ...formData.value,
          imageUrl: imageDownloadURL,
          userId: user.uid,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
          favorite: false
        }

        if (currentType.value === 'Outfit') {
          itemData.items = selectedItems.value.map(item => item.id)
          itemData.itemDetails = selectedItems.value
        }

        const collectionName = currentType.value.toLowerCase() + 's'
        await addDoc(collection(db, collectionName), itemData)
        
        alert(`${currentType.value} saved successfully!`)
        
        if (currentType.value === 'Outfit') {
          router.push('/app/outfits')
        } else {
          router.push('/app/clothing')
        }
        
      } catch (error) {
        console.error('Error saving item:', error)
        alert('Failed to save item. Please try again.')
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
