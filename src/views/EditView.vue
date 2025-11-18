<template>
  <div class="container py-4">
    <!-- Header -->
    <div class="d-flex justify-content-between align-items-center mb-4">
      <button class="btn btn-outline-secondary" @click="$router.back()">← Back</button>
      <h2 class="mb-0">Edit {{ currentType }}</h2>
      <button class="btn btn-primary" :disabled="!isFormValid || saving" @click="saveItem">
        {{ saving ? 'Saving...' : 'Save' }}
      </button>
    </div>

    <!-- Type Display -->
    <div class="mb-4">
      <span class="badge bg-secondary fs-6">{{ currentType }}</span>
    </div>

    <!-- Image Section -->
    <div class="mb-4 text-center">
      <div v-if="imageUrl" class="position-relative d-inline-block">
        <img :src="imageUrl" alt="Preview" class="img-fluid rounded mb-2">
        <button @click="removeImage" class="btn-close position-absolute top-0 end-0"></button>
      </div>
      <div v-else class="border border-secondary rounded py-5 px-3">
        <div class="fs-1 mb-2">📷</div>
        <p class="mb-0 text-muted">Upload or take a photo to get started</p>
      </div>
      <div class="mt-2">
        <button class="btn btn-outline-secondary me-2" @click="takePhoto">📸 Take Photo</button>
        <button class="btn btn-outline-secondary" @click="uploadImage">📁 Upload Image</button>
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
        <!-- Category -->
        <div class="col-md-6">
          <label class="form-label">Category *</label>
          <select v-model="formData.category" class="form-select" required>
            <option value="">Select Category</option>
            <option v-for="category in categories" :key="category">{{ category }}</option>
          </select>
        </div>

        <!-- Season -->
        <div class="col-md-6">
          <label class="form-label">Season</label>
          <select v-model="formData.season" class="form-select">
            <option value="">Select Season</option>
            <option v-for="season in seasons" :key="season">{{ season }}</option>
          </select>
        </div>
      </div>

      <div class="row g-3 mb-3">
        <!-- Color -->
        <div class="col-md-6">
          <label class="form-label">Color</label>
          <div class="input-group">
            <select v-model="formData.color" class="form-select">
              <option value="">Select Color</option>
              <option v-for="color in colors" :key="color">{{ color }}</option>
            </select>
            <input
              v-model="newColor"
              type="text"
              class="form-control"
              placeholder="Add color"
              @keydown.enter.prevent="addColor"
            >
            <button class="btn btn-outline-secondary" type="button" @click="addColor">+</button>
          </div>
        </div>

        <!-- Event -->
        <div class="col-md-6">
          <label class="form-label">Event Type</label>
          <div class="input-group">
            <select v-model="formData.event" class="form-select">
              <option value="">Select Event</option>
              <option v-for="event in events" :key="event">{{ event }}</option>
            </select>
            <input
              v-model="newEvent"
              type="text"
              class="form-control"
              placeholder="Add event"
              @keydown.enter.prevent="addEvent"
            >
            <button class="btn btn-outline-secondary" type="button" @click="addEvent">+</button>
          </div>
        </div>
      </div>

      <!-- Clothing-specific -->
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

    <input ref="fileInput" type="file" accept="image/*" @change="handleFileSelect" style="display: none">
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue'

export default {
  name: 'EditView',
  setup() {
    const currentType = ref('Outfit') 
    const formData = ref({
      title: '', description: '', category: '', season: '', color: '', event: '',
      brand: '', size: '', tags: []
    })

    const imageUrl = ref(null)
    const imageFile = ref(null)
    const newTag = ref('')
    const newColor = ref('')
    const newEvent = ref('')
    const saving = ref(false)

    const selectedItems = ref([])
    const availableItems = ref([])
    const showItemSelector = ref(false)

    const categories = ['Tops','Bottoms','Shoes','Accessories','Outerwear','Dresses']
    const seasons = ['Spring','Summer','Fall','Winter','All Season']
    const colors = ['Black','White','Red','Blue','Green','Yellow','Purple','Pink','Orange','Brown','Gray','Multi']
    const events = ['Casual','Formal','Work','Party','Sports','Beach','Date','Travel']

    const isFormValid = computed(() => {
      const basicValid = formData.value.title.trim() && formData.value.category && imageUrl.value
      return currentType.value === 'Outfit' ? basicValid && selectedItems.value.length : basicValid
    })

    const loadMockData = () => {
      if (currentType.value === 'Outfit') {
        formData.value = {
          title: 'Winter Casual Outfit', description: 'Chilly days outfit', category: 'Outfit',
          season: 'Winter', color: '', event: 'Casual', brand: '', size: '', tags: ['warm','cozy']
        }
        imageUrl.value = 'https://images.unsplash.com/photo-1543076447-215ad9ba6923?auto=format&fit=crop&w=500&q=60'
        selectedItems.value = [
          { id:'item1', name:'Beige Knit Sweater', category:'Tops', color:'Cream', imageUrl:'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=400&q=60' },
          { id:'item2', name:'Black Winter Leggings', category:'Bottoms', color:'Black', imageUrl:'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&w=400&q=60' },
        ]
        availableItems.value = [...selectedItems.value]
      }
    }

    const addTag = () => {
      const tag = newTag.value.trim()
      if(tag && !formData.value.tags.includes(tag)) { formData.value.tags.push(tag); newTag.value = '' }
    }
    const removeTag = (tag) => { formData.value.tags = formData.value.tags.filter(t => t !== tag) }

    const addColor = () => {
      const color = newColor.value.trim()
      if(color && !colors.includes(color)) { colors.push(color); formData.value.color = color }
      newColor.value = ''
    }

    const addEvent = () => {
      const event = newEvent.value.trim()
      if(event && !events.includes(event)) { events.push(event); formData.value.event = event }
      newEvent.value = ''
    }

    const toggleItemSelection = (item) => {
      const index = selectedItems.value.findIndex(i => i.id === item.id)
      index > -1 ? selectedItems.value.splice(index,1) : selectedItems.value.push({...item})
    }

    const isItemSelected = (item) => selectedItems.value.some(i => i.id===item.id)
    const removeFromOutfit = (item) => { selectedItems.value = selectedItems.value.filter(i => i.id!==item.id) }
    const confirmItemSelection = () => showItemSelector.value = false
    const takePhoto = () => alert('Camera placeholder')
    const uploadImage = () => alert('Upload placeholder')
    const removeImage = () => { imageUrl.value = null; imageFile.value = null }

    onMounted(()=>{ loadMockData() })

    return {
      currentType, formData, imageUrl, imageFile, newTag, newColor, newEvent, saving,
      selectedItems, availableItems, showItemSelector, categories, seasons, colors, events,
      isFormValid, takePhoto, uploadImage, removeImage,
      addTag, removeTag, addColor, addEvent, toggleItemSelection, isItemSelected, removeFromOutfit, confirmItemSelection
    }
  }
}
</script>
