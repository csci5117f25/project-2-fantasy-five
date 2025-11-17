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
          <p class="text-primary">{{ item.category }}</p>

          <p v-if="item.description" class="text-muted">{{ item.description }}</p>
          <p v-else class="text-muted fst-italic">No description</p>

          <!-- Details Grid -->
          <div class="row g-3 mt-4">
            <div class="col-md-4" v-if="item.color">
              <div class="border rounded p-3 bg-light">
                <div class="fw-medium text-secondary">Color</div>
                <div class="fw-semibold">{{ item.color }}</div>
              </div>
            </div>

            <div class="col-md-4" v-if="item.season">
              <div class="border rounded p-3 bg-light">
                <div class="fw-medium text-secondary">Season</div>
                <div class="fw-semibold">{{ item.season }}</div>
              </div>
            </div>

            <div class="col-md-4" v-if="item.event">
              <div class="border rounded p-3 bg-light">
                <div class="fw-medium text-secondary">Event</div>
                <div class="fw-semibold">{{ item.event }}</div>
              </div>
            </div>

            <div class="col-md-4">
              <div class="border rounded p-3 bg-light">
                <div class="fw-medium text-secondary">Added</div>
                <div class="fw-semibold">{{ formatDate(item.createdAt) }}</div>
              </div>
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
    <div class="spinner-border text-primary"></div>
    <p class="mt-3 text-muted">Loading...</p>
  </div>
</template>

<!-- <script>
import { useDocument } from 'vuefire'
import { doc, updateDoc, deleteDoc } from 'firebase/firestore'
import { db } from '@/firebase'

export default {
  name: 'ClothingDetail',
  setup() {
    const itemId = this.$route.params.id
    const itemRef = doc(db, 'clothing', itemId)
    const item = useDocument(itemRef)
    
    return { item }
  },
  methods: {
    getCategoryIcon(category) {
      const icons = {
        'Tops': '👕',
        'Bottoms': '👖',
        'Shoes': '👟',
        'Accessories': '👒',
        'Outerwear': '🧥',
        'Dresses': '👗'
      }
      return icons[category] || '👕'
    },
    
    formatDate(date) {
      return new Date(date).toLocaleDateString()
    },
    
    async toggleFavorite() {
      try {
        const itemRef = doc(db, 'clothing', this.item.id)
        await updateDoc(itemRef, {
          favorite: !this.item.favorite,
          updatedAt: new Date()
        })
      } catch (error) {
        console.error('Error updating favorite:', error)
      }
    },
    
    editItem() {
      this.$router.push(`/app/create?edit=${this.item.id}`)
    },
    
    confirmDelete() {
      if (confirm('Are you sure you want to delete this item?')) {
        this.deleteItem()
      }
    },
    
    async deleteItem() {
      try {
        await deleteDoc(doc(db, 'clothing', this.item.id))
        this.$router.push('/app/clothing')
      } catch (error) {
        console.error('Error deleting item:', error)
        alert('Failed to delete item')
      }
    }
  }
}
</script> -->

<script>
export default {
  name: 'ClothingDetail',
  data() {
    return {
      // Mock data for testing
      item: {
        id: '1',
        name: 'Blue Denim Jacket',
        category: 'Outerwear',
        description: 'A stylish blue denim jacket perfect for spring and fall.',
        color: 'Blue',
        season: 'Spring/Fall',
        event: 'Casual',
        tags: ['Denim', 'Jacket', 'Casual'],
        imageUrl: '', // leave empty to see placeholder
        favorite: false,
        createdAt: new Date()
      }
    }
  },
  methods: {
    getCategoryIcon(category) {
      const icons = {
        'Tops': '👕',
        'Bottoms': '👖',
        'Shoes': '👟',
        'Accessories': '👒',
        'Outerwear': '🧥',
        'Dresses': '👗'
      }
      return icons[category] || '👕'
    },
    formatDate(date) {
      return new Date(date).toLocaleDateString()
    },
    toggleFavorite() {
      this.item.favorite = !this.item.favorite
    },
    editItem() {
      alert('Edit action (mock)')
    },
    confirmDelete() {
      if (confirm('Are you sure you want to delete this item?')) {
        this.item = null
      }
    }
  }
}
</script>

<style scoped>
.clothing-detail-view h2 {
  margin-bottom: 0.5rem;
}
.card img {
  object-fit: cover;
}
</style>