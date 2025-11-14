<template>
  <div class="create-view">
    <div class="create-header">
      <button class="back-btn" @click="$router.back()">
        ← Back
      </button>
      <h2>Add New {{ currentType }}</h2>
      <div class="header-actions">
        <button class="save-btn" @click="saveItem" :disabled="!isFormValid || saving">
          {{ saving ? 'Saving...' : 'Save' }}
        </button>
      </div>
    </div>
    
    <div class="create-container">
      <div class="type-selector">
        <button 
          v-for="type in types" 
          :key="type"
          class="type-btn"
          :class="{ active: currentType === type }"
          @click="currentType = type"
        >
          {{ type }}
        </button>
      </div>
      
      <div class="form-container">
        <div class="image-upload-section">
          <div class="upload-options">
            <button class="upload-btn" @click="takePhoto">
              <span class="upload-icon">📸</span>
              Take a Photo
            </button>
            <button class="upload-btn" @click="uploadImage">
              <span class="upload-icon">📁</span>
              Upload an Image
            </button>
          </div>
          
          <div class="image-preview" v-if="imageUrl">
            <img :src="imageUrl" alt="Preview">
            <button class="remove-image" @click="removeImage">×</button>
          </div>
          
          <div v-else class="upload-placeholder">
            <div class="placeholder-icon">📷</div>
            <p>Upload or take a photo to get started</p>
          </div>
        </div>
        
        <div class="form-section">
          <div class="form-group">
            <label for="title">{{ currentType === 'Outfit' ? 'Outfit Title' : 'Item Name' }} *</label>
            <input
              id="title"
              v-model="formData.title"
              type="text"
              :placeholder="currentType === 'Outfit' ? 'Enter outfit title' : 'Enter item name'"
              required
            >
          </div>
          
          <div class="form-group">
            <label for="description">Description</label>
            <textarea
              id="description"
              v-model="formData.description"
              rows="3"
              placeholder="Add a description (optional)..."
            ></textarea>
          </div>
          
          <div class="form-row">
            <div class="form-group">
              <label for="category">Category *</label>
              <select id="category" v-model="formData.category" required>
                <option value="">Select Category</option>
                <option v-for="category in categories" :key="category" :value="category">
                  {{ category }}
                </option>
              </select>
            </div>
            
            <div class="form-group">
              <label for="season">Season</label>
              <select id="season" v-model="formData.season">
                <option value="">Select Season</option>
                <option v-for="season in seasons" :key="season" :value="season">
                  {{ season }}
                </option>
              </select>
            </div>
          </div>
          
          <div class="form-row">
            <div class="form-group">
              <label for="color">Color</label>
              <select id="color" v-model="formData.color">
                <option value="">Select Color</option>
                <option v-for="color in colors" :key="color" :value="color">
                  {{ color }}
                </option>
              </select>
            </div>
            
            <div class="form-group">
              <label for="event">Event Type</label>
              <select id="event" v-model="formData.event">
                <option value="">Select Event</option>
                <option v-for="event in events" :key="event" :value="event">
                  {{ event }}
                </option>
              </select>
            </div>
          </div>

          <!-- Additional fields for Clothing -->
          <div v-if="currentType === 'Clothing'" class="form-row">
            <div class="form-group">
              <label for="brand">Brand</label>
              <input
                id="brand"
                v-model="formData.brand"
                type="text"
                placeholder="Brand name (optional)"
              >
            </div>
            
            <div class="form-group">
              <label for="size">Size</label>
              <input
                id="size"
                v-model="formData.size"
                type="text"
                placeholder="Size (optional)"
              >
            </div>
          </div>

          <!-- Additional fields for Outfit -->
          <div v-if="currentType === 'Outfit'" class="form-group">
            <label>Outfit Items</label>
            <div class="outfit-items">
              <div 
                v-for="item in selectedItems" 
                :key="item.id"
                class="outfit-item"
                @click="removeFromOutfit(item)"
              >
                <span>{{ item.name }}</span>
                <button class="remove-item">×</button>
              </div>
              <button class="add-item-btn" @click="showItemSelector = true">
                + Add Clothing Item
              </button>
            </div>
          </div>
          
          <div class="form-group">
            <label>Tags</label>
            <div class="tags-input">
              <input
                v-model="newTag"
                type="text"
                placeholder="Add tags..."
                @keydown.enter.prevent="addTag"
                @keydown.space.prevent="addTag"
              >
              <button @click="addTag" class="add-tag-btn">+</button>
            </div>
            <div class="tags-list">
              <span v-for="tag in formData.tags" :key="tag" class="tag">
                {{ tag }}
                <button @click="removeTag(tag)" class="remove-tag">×</button>
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Item Selector Modal for Outfits -->
    <div v-if="showItemSelector" class="modal-overlay" @click="showItemSelector = false">
      <div class="modal-content" @click.stop>
        <h3>Select Clothing Items</h3>
        <div class="item-selector">
          <div 
            v-for="item in availableItems" 
            :key="item.id"
            class="selector-item"
            :class="{ selected: isItemSelected(item) }"
            @click="toggleItemSelection(item)"
          >
            <div class="item-preview">
              <img v-if="item.imageUrl" :src="item.imageUrl" :alt="item.name">
              <div v-else class="item-placeholder">{{ getCategoryIcon(item.category) }}</div>
            </div>
            <div class="item-info">
              <h4>{{ item.name || item.title }}</h4>
              <p>{{ item.category }}</p>
            </div>
          </div>
        </div>
        <div class="modal-actions">
          <button @click="showItemSelector = false" class="btn-secondary">Cancel</button>
          <button @click="confirmItemSelection" class="btn-primary">Add Selected</button>
        </div>
      </div>
    </div>
    
    <input
      ref="fileInput"
      type="file"
      accept="image/*"
      @change="handleFileSelect"
      style="display: none"
    >
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

<style scoped>
/* Your existing styles remain the same */
.create-view {
  min-height: calc(100vh - 80px);
  background: #f5f5f5;
}

.create-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  background: white;
  border-bottom: 1px solid #e0e0e0;
  position: sticky;
  top: 0;
  z-index: 100;
}

.back-btn {
  background: none;
  border: none;
  font-size: 1rem;
  cursor: pointer;
  padding: 0.5rem;
  color: #666;
  font-weight: 500;
}

.create-header h2 {
  margin: 0;
  font-size: 1.3rem;
  color: #333;
}

.save-btn {
  background: #000;
  color: white;
  border: none;
  padding: 0.5rem 1.5rem;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 500;
}

.save-btn:disabled {
  background: #666;
  cursor: not-allowed;
}

.create-container {
  padding: 1.5rem;
  max-width: 800px;
  margin: 0 auto;
}

.type-selector {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 2rem;
  background: white;
  padding: 0.5rem;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

.type-btn {
  flex: 1;
  padding: 0.75rem 1rem;
  border: none;
  background: transparent;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.3s ease;
}

.type-btn.active {
  background: #000;
  color: white;
}

.form-container {
  background: white;
  border-radius: 16px;
  padding: 2rem;
  box-shadow: 0 4px 20px rgba(0,0,0,0.1);
}

.image-upload-section {
  margin-bottom: 2rem;
  text-align: center;
}

.upload-options {
  display: flex;
  gap: 1rem;
  justify-content: center;
  margin-bottom: 2rem;
}

.upload-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 1rem 1.5rem;
  border: 2px dashed #e0e0e0;
  background: #fafafa;
  border-radius: 12px;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.3s ease;
}

.upload-btn:hover {
  border-color: #667eea;
  background: rgba(102, 126, 234, 0.05);
}

.upload-icon {
  font-size: 1.2rem;
}

.image-preview {
  position: relative;
  max-width: 300px;
  margin: 0 auto;
  border-radius: 12px;
  overflow: hidden;
}

.image-preview img {
  width: 100%;
  height: auto;
  border-radius: 12px;
}

.remove-image {
  position: absolute;
  top: 0.5rem;
  right: 0.5rem;
  background: rgba(0,0,0,0.7);
  color: white;
  border: none;
  border-radius: 50%;
  width: 2rem;
  height: 2rem;
  cursor: pointer;
  font-size: 1.2rem;
  display: flex;
  align-items: center;
  justify-content: center;
}

.upload-placeholder {
  border: 2px dashed #e0e0e0;
  border-radius: 12px;
  padding: 3rem 2rem;
  background: #fafafa;
}

.placeholder-icon {
  font-size: 3rem;
  margin-bottom: 1rem;
  opacity: 0.5;
}

.upload-placeholder p {
  margin: 0;
  color: #666;
}

.form-section {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.form-group {
  display: flex;
  flex-direction: column;
}

.form-group label {
  margin-bottom: 0.5rem;
  font-weight: 500;
  color: #333;
}

.form-group input,
.form-group textarea,
.form-group select {
  padding: 0.75rem;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  font-size: 1rem;
  transition: border-color 0.3s ease;
  font-family: inherit;
}

.form-group input:focus,
.form-group textarea:focus,
.form-group select:focus {
  outline: none;
  border-color: #667eea;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}

.outfit-items {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.outfit-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem;
  background: #f8f8f8;
  border-radius: 8px;
  cursor: pointer;
  transition: background 0.3s ease;
}

.outfit-item:hover {
  background: #f0f0f0;
}

.remove-item {
  background: none;
  border: none;
  color: #666;
  cursor: pointer;
  font-size: 1.2rem;
  padding: 0.25rem;
}

.add-item-btn {
  padding: 0.75rem;
  border: 2px dashed #e0e0e0;
  background: #fafafa;
  border-radius: 8px;
  cursor: pointer;
  color: #666;
  transition: all 0.3s ease;
}

.add-item-btn:hover {
  border-color: #667eea;
  color: #667eea;
}

.tags-input {
  display: flex;
  gap: 0.5rem;
}

.tags-input input {
  flex: 1;
}

.add-tag-btn {
  padding: 0.75rem 1rem;
  background: #000;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-weight: bold;
}

.tags-list {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-top: 0.5rem;
}

.tag {
  background: #f0f0f0;
  padding: 0.25rem 0.75rem;
  border-radius: 16px;
  font-size: 0.9rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.remove-tag {
  background: none;
  border: none;
  cursor: pointer;
  font-size: 1.1rem;
  color: #666;
  padding: 0;
  width: 1rem;
  height: 1rem;
  display: flex;
  align-items: center;
  justify-content: center;
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;
}

.modal-content {
  background: white;
  border-radius: 16px;
  padding: 2rem;
  width: 100%;
  max-width: 500px;
  max-height: 80vh;
  overflow-y: auto;
}

.modal-content h3 {
  margin: 0 0 1.5rem 0;
  color: #333;
}

.item-selector {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.selector-item {
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  padding: 0.75rem;
  cursor: pointer;
  transition: all 0.3s ease;
  text-align: center;
}

.selector-item.selected {
  border-color: #667eea;
  background: rgba(102, 126, 234, 0.1);
}

.selector-item:hover {
  border-color: #667eea;
}

.item-preview {
  width: 60px;
  height: 60px;
  border-radius: 8px;
  overflow: hidden;
  margin: 0 auto 0.5rem;
}

.item-preview img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.item-placeholder {
  width: 100%;
  height: 100%;
  background: #f0f0f0;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
}

.item-info h4 {
  margin: 0 0 0.25rem 0;
  font-size: 0.8rem;
  font-weight: 600;
}

.item-info p {
  margin: 0;
  font-size: 0.7rem;
  color: #666;
}

.modal-actions {
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
}

.btn-primary {
  background: #000;
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 500;
}

.btn-secondary {
  background: #f0f0f0;
  color: #333;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 500;
}

@media (max-width: 768px) {
  .create-container {
    padding: 1rem;
  }
  
  .form-container {
    padding: 1.5rem;
  }
  
  .upload-options {
    flex-direction: column;
  }
  
  .form-row {
    grid-template-columns: 1fr;
  }
  
  .create-header h2 {
    font-size: 1.1rem;
  }
  
  .item-selector {
    grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
  }
}
</style>