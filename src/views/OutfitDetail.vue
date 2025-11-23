<template>
  <div v-if="outfit" class="container py-4">

    <!-- Header -->
    <div class="d-flex justify-content-between align-items-center mb-4">
      <button class="btn btn-outline-secondary" @click="$router.back()">
        ← Back
      </button>

      <div class="btn-group">
        <button class="btn btn-light" @click="toggleFavorite">
          {{ outfit.favorite ? '❤️' : '🤍' }}
        </button>

        <button class="btn btn-light" @click="editOutfit">✏️</button>

        <button class="btn btn-danger" @click="confirmDelete">🗑️</button>
      </div>
    </div>

    <div class="row g-4">

      <!-- Image Section -->
      <div class="col-12">
        <div class="card shadow-sm overflow-hidden">
          <img
            v-if="outfit.imageUrl"
            :src="outfit.imageUrl"
            :alt="outfit.name"
            class="img-fluid"
          />

          <!-- Composition Grid -->
          <div
            v-else-if="outfit.itemDetails && outfit.itemDetails.length"
            class="row row-cols-2 p-4 g-3 bg-white"
          >
            <div
              v-for="item in outfit.itemDetails"
              :key="item.id"
              class="col"
            >
              <div class="card h-100 d-flex align-items-center justify-content-center bg-light">
                <img
                  v-if="item.imageUrl"
                  :src="item.imageUrl"
                  class="img-fluid"
                />
                <div v-else class="display-5 text-white bg-primary w-100 py-4 text-center">
                  {{ getCategoryIcon(item.category) }}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Info Section -->
      <div class="col-12">
        <div class="card p-4 shadow-sm">
          <h2 class="fw-bold mb-2">{{ outfit.name || outfit.title }}</h2>

          <p v-if="outfit.description" class="text-muted">
            {{ outfit.description }}
          </p>
          <p v-else class="text-muted fst-italic">No description</p>

          <!-- Outfits items -->
          <h4 class="mt-4">Items in this outfit</h4>

          <div class="list-group my-3">
            <div
              v-for="item in outfit.itemDetails"
              :key="item.id"
              class="list-group-item list-group-item-action d-flex align-items-center"
              @click="navigateToClothingItem(item.id)"
            >
              <img
                v-if="item.imageUrl"
                class="rounded me-3"
                width="60"
                height="60"
                :src="item.imageUrl"
              />

              <div v-else class="rounded bg-primary text-white d-flex align-items-center justify-content-center me-3"
                style="width: 60px; height: 60px;">
                {{ getCategoryIcon(item.category) }}
              </div>

              <div>
                <div class="fw-semibold">{{ item.name }}</div>
                <div class="text-primary small">{{ getCategoryLabel(item.category) }}</div>
                <div class="text-muted small" v-if="item.colors && item.colors.length">
                  {{ item.colors.join(', ') }}
                </div>
              </div>
            </div>
          </div>

          <!-- Details Grid -->
          <div class="row g-3 mt-4">
            <div class="col-md-4" v-if="outfit.seasons && outfit.seasons.length">
              <div class="border rounded p-3 bg-light">
                <div class="fw-medium text-secondary">Seasons</div>
                <div class="fw-semibold">{{ outfit.seasons.join(', ') }}</div>
              </div>
            </div>

            <div class="col-md-4" v-if="outfit.events && outfit.events.length">
              <div class="border rounded p-3 bg-light">
                <div class="fw-medium text-secondary">Events</div>
                <div class="fw-semibold">{{ outfit.events.join(', ') }}</div>
              </div>
            </div>

            <div class="col-md-4">
              <div class="border rounded p-3 bg-light">
                <div class="fw-medium text-secondary">Created</div>
                <div class="fw-semibold">{{ formatDate(outfit.createdAt) }}</div>
              </div>
            </div>
          </div>

          <!-- Colors -->
          <div v-if="outfit.colors && outfit.colors.length" class="mt-4">
            <h4>Colors</h4>
            <div class="d-flex flex-wrap gap-2 mt-2">
              <span 
                v-for="color in outfit.colors" 
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

          <!-- Tags -->
          <div v-if="outfit.tags && outfit.tags.length" class="mt-4">
            <h4>Tags</h4>
            <div class="d-flex flex-wrap gap-2 mt-2">
              <span v-for="tag in outfit.tags" :key="tag" class="badge bg-primary px-3 py-2">
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
    <p class="mt-3 text-muted">Loading outfit details...</p>
  </div>
</template>

<script>
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useDocument, useCurrentUser } from 'vuefire'
import { doc, updateDoc, deleteDoc, serverTimestamp } from 'firebase/firestore'
import { db } from '@/firebase'

export default {
  name: 'OutfitDetail',
  setup() {
    const route = useRoute()
    const router = useRouter()
    const currentUser = useCurrentUser()

    const outfitRef = computed(() => {
      if (!currentUser.value) return null
      return doc(db, 'users', currentUser.value.uid, 'outfits', route.params.id)
    })

    const outfit = useDocument(outfitRef)

    const getCategoryIcon = (category) => {
      const icons = { 
        head: '👒', 
        top: '👕', 
        bottom: '👖', 
        shoe: '👟', 
        accessory: '💍', 
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

    const navigateToClothingItem = (itemId) => {
      router.push(`/app/clothing/${itemId}`)
    }

    const toggleFavorite = async () => {
      if (!currentUser.value || !outfit.value) return
      try {
        await updateDoc(outfitRef.value, {
          favorite: !outfit.value.favorite,
          updatedAt: serverTimestamp()
        })
      } catch (error) {
        console.error('Error updating favorite:', error)
        alert('Failed to update favorite. Please try again.')
      }
    }

    const editOutfit = () => {
      router.push(`/app/outfits/${route.params.id}/edit`)
    }

    const confirmDelete = () => {
      if (confirm('Are you sure you want to delete this outfit? This action cannot be undone.')) {
        deleteOutfit()
      }
    }

    const deleteOutfit = async () => {
      if (!currentUser.value || !outfitRef.value) return
      try {
        await deleteDoc(outfitRef.value)
        router.push('/app/outfits')
      } catch (error) {
        console.error('Error deleting outfit:', error)
        alert('Failed to delete outfit. Please try again.')
      }
    }

    return {
      outfit,
      getCategoryIcon,
      getCategoryLabel,
      getCategoryGradient,
      getColorHex,
      getContrastColor,
      getSeasonBadgeClass,
      formatDate,
      navigateToClothingItem,
      toggleFavorite,
      editOutfit,
      confirmDelete
    }
  }
}
</script>

<style scoped>
.list-group-item:hover {
  background-color: #f8f9fa;
  transform: translateX(4px);
  transition: all 0.2s ease;
}
</style>