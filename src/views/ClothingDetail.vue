<template>
  <div v-if="item" class="container py-4">

    <!-- Header -->
    <div class="d-flex justify-content-between align-items-center mb-4">
      <button class="btn btn-outline-secondary" @click="$router.back()">← Back</button>

      <div class="btn-group">
        <button class="btn btn-light" @click="toggleFavorite">
          {{ item.favorite ? '❤️' : '🤍' }}
        </button>
        <button class="btn btn-light" @click="editItem">✏️</button>
        <button class="btn btn-danger" @click="confirmDelete">🗑️</button>
      </div>
    </div>

    <div class="row g-4">

      <!-- Image Section -->
      <div class="col-12 col-lg-6">
        <div class="card shadow-sm overflow-hidden">
          <img v-if="item.imageUrl" :src="item.imageUrl" :alt="item.name" class="img-fluid">

          <div v-else class="d-flex align-items-center justify-content-center bg-primary text-white fs-1" style="height: 400px;">
            {{ getCategoryIcon(item.category) }}
          </div>
        </div>
      </div>

      <!-- Info Section -->
      <div class="col-12 col-lg-6">
        <div class="card p-4 shadow-sm">
          <h2 class="fw-bold mb-2">{{ item.name }}</h2>
          <p class="text-primary">{{ getCategoryLabel(item.category) }}</p>

          <p v-if="item.description" class="text-muted">{{ item.description }}</p>
          <p v-else class="text-muted fst-italic">No description</p>

          <!-- Details Grid -->
          <div class="row g-3 mt-4">
            <div class="col-md-4" v-if="item.brand">
              <div class="border rounded p-3 bg-light">
                <div class="fw-medium text-secondary">Brand</div>
                <div class="fw-semibold">{{ item.brand }}</div>
              </div>
            </div>

            <div class="col-md-4" v-if="item.size">
              <div class="border rounded p-3 bg-light">
                <div class="fw-medium text-secondary">Size</div>
                <div class="fw-semibold">{{ item.size }}</div>
              </div>
            </div>

            <div class="col-md-4">
              <div class="border rounded p-3 bg-light">
                <div class="fw-medium text-secondary">Added</div>
                <div class="fw-semibold">{{ formatDate(item.createdAt) }}</div>
              </div>
            </div>
          </div>

          <!-- Colors -->
          <div v-if="item.colors && item.colors.length" class="mt-4">
            <h4>Colors</h4>
            <div class="d-flex flex-wrap gap-2 mt-2">
              <span 
                v-for="color in item.colors" 
                :key="color" 
                class="badge px-3 py-2"
                :style="{ 
                  backgroundColor: getColorHex(color), 
                  color: getContrastColor(color) 
                }"
              >
                {{ color }}
              </span>
            </div>
          </div>

          <!-- Seasons -->
          <div v-if="item.seasons && item.seasons.length" class="mt-4">
            <h4>Seasons</h4>
            <div class="d-flex flex-wrap gap-2 mt-2">
              <span 
                v-for="season in item.seasons" 
                :key="season" 
                class="badge px-3 py-2"
                :class="getSeasonBadgeClass(season)"
              >
                {{ season }}
              </span>
            </div>
          </div>

          <!-- Events -->
          <div v-if="item.events && item.events.length" class="mt-4">
            <h4>Events</h4>
            <div class="d-flex flex-wrap gap-2 mt-2">
              <span 
                v-for="event in item.events" 
                :key="event" 
                class="badge bg-info text-dark px-3 py-2"
              >
                {{ event }}
              </span>
            </div>
          </div>

          <!-- Tags -->
          <div v-if="item.tags && item.tags.length" class="mt-4">
            <h4>Tags</h4>
            <div class="d-flex flex-wrap gap-2 mt-2">
              <span v-for="tag in item.tags" :key="tag" class="badge bg-primary px-3 py-2">
                {{ tag }}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- Loading State -->
  <div v-else class="text-center py-5">
    <div class="spinner-border text-primary" role="status">
      <span class="visually-hidden">Loading...</span>
    </div>
    <p class="mt-3 text-muted">Loading item details...</p>
  </div>
</template>

<script>
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useDocument, useCurrentUser } from 'vuefire'
import { doc, updateDoc, deleteDoc, serverTimestamp } from 'firebase/firestore'
import { db } from '@/firebase'

export default {
  name: 'ClothingDetail',
  setup() {
    const route = useRoute()
    const router = useRouter()
    const currentUser = useCurrentUser()

    const itemRef = computed(() => {
      if (!currentUser.value) return null
      return doc(db, 'users', currentUser.value.uid, 'clothingItems', route.params.id)
    })

    const item = useDocument(itemRef)

    const getCategoryIcon = (category) => {
      const icons = { 
        head: '👒', 
        top: '👕', 
        bottom: '👖', 
        shoe: '👟', 
        accessory: '💍' , 
        dress: '👗'
      }
      return icons[category] || '👕'
    }

    const getCategoryLabel = (category) => {
      const labels = {
        head: 'Headwear',
        top: 'Top',
        bottom: 'Bottom',
        shoe: 'Shoes',
        accessory: 'Accessory', 
        dress: 'Dress'
      }
      return labels[category] || category
    }

    const getCategoryGradient = (category) => {
      const gradients = {
        head: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        top: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
        bottom: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
        shoe: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
        accessory: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)'
      }
      return gradients[category] || 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
    }

    const getColorHex = (colorName) => {
      const colorMap = {
        'Black': '#000000',
        'White': '#FFFFFF',
        'Red': '#FF0000',
        'Blue': '#0000FF',
        'Green': '#008000',
        'Yellow': '#FFFF00',
        'Purple': '#800080',
        'Pink': '#FFC0CB',
        'Orange': '#FFA500',
        'Brown': '#A52A2A',
        'Gray': '#808080',
        'Grey': '#808080',
        'Multi': '#9370DB'
      }
      return colorMap[colorName] || '#CCCCCC'
    }

    const getContrastColor = (colorName) => {
      const darkColors = ['Black', 'Blue', 'Brown', 'Gray', 'Grey', 'Purple']
      return darkColors.includes(colorName) ? '#FFFFFF' : '#000000'
    }

    const getSeasonBadgeClass = (season) => {
      const classes = {
        'Spring': 'bg-success',
        'Summer': 'bg-warning text-dark',
        'Fall': 'bg-danger',
        'Winter': 'bg-primary',
        'All Season': 'bg-secondary'
      }
      return classes[season] || 'bg-secondary'
    }

    const formatDate = (timestamp) => {
      if (!timestamp) return 'Unknown'
      const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp)
      return date.toLocaleDateString('en-US', { 
        month: 'long', 
        day: 'numeric', 
        year: 'numeric' 
      })
    }

    const toggleFavorite = async () => {
      if (!currentUser.value || !item.value) return
      try {
        await updateDoc(itemRef.value, { 
          favorite: !item.value.favorite, 
          updatedAt: serverTimestamp() 
        })
      } catch (error) {
        console.error('Error updating favorite:', error)
      }
    }

    const editItem = () => {
      router.push(`/app/clothing/${route.params.id}/edit`)
    }

    const confirmDelete = () => {
      if (confirm('Are you sure you want to delete this item? This action cannot be undone.')) {
        deleteItem()
      }
    }

    const deleteItem = async () => {
      if (!currentUser.value || !itemRef.value) return
      try {
        await deleteDoc(itemRef.value)
        router.push('/app/clothing')
      } catch (error) {
        console.error('Error deleting item:', error)
        alert('Failed to delete item')
      }
    }

    return {
      item,
      getCategoryIcon,
      getCategoryLabel,
      getCategoryGradient,
      getColorHex,
      getContrastColor,
      getSeasonBadgeClass,
      formatDate,
      toggleFavorite,
      editItem,
      confirmDelete
    }
  }
}
</script>

<style scoped>
.card img {
  object-fit: cover;
}
</style>
