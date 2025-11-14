<!-- views/ClothingDetailView.vue -->
<template>
  <div class="detail-view" v-if="item">
    <div class="detail-header">
      <button class="back-btn" @click="$router.back()">← Back</button>
      <div class="header-actions">
        <button class="action-btn" @click="toggleFavorite">
          {{ item.favorite ? '❤️' : '🤍' }}
        </button>
        <button class="action-btn" @click="editItem">✏️</button>
        <button class="action-btn delete" @click="confirmDelete">🗑️</button>
      </div>
    </div>
    
    <div class="detail-content">
      <div class="image-section">
        <img v-if="item.imageUrl" :src="item.imageUrl" :alt="item.name">
        <div v-else class="placeholder-image">
          {{ getCategoryIcon(item.category) }}
        </div>
      </div>
      
      <div class="info-section">
        <h1>{{ item.name }}</h1>
        <p class="category">{{ item.category }}</p>
        <p class="description" v-if="item.description">{{ item.description }}</p>
        <p class="description placeholder" v-else>No description</p>
        
        <div class="details-grid">
          <div class="detail-item" v-if="item.color">
            <span class="label">Color:</span>
            <span class="value">{{ item.color }}</span>
          </div>
          <div class="detail-item" v-if="item.season">
            <span class="label">Season:</span>
            <span class="value">{{ item.season }}</span>
          </div>
          <div class="detail-item" v-if="item.event">
            <span class="label">Event:</span>
            <span class="value">{{ item.event }}</span>
          </div>
          <div class="detail-item">
            <span class="label">Added:</span>
            <span class="value">{{ formatDate(item.createdAt) }}</span>
          </div>
        </div>
        
        <div class="tags-section" v-if="item.tags && item.tags.length > 0">
          <h3>Tags</h3>
          <div class="tags">
            <span v-for="tag in item.tags" :key="tag" class="tag">
              {{ tag }}
            </span>
          </div>
        </div>
      </div>
    </div>
  </div>
  
  <div v-else class="loading">
    <p>Loading...</p>
  </div>
</template>

<script>
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
</script>

<style scoped>
.detail-view {
  min-height: calc(100vh - 80px);
  background: #f5f5f5;
}

.detail-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  background: white;
  border-bottom: 1px solid #e0e0e0;
}

.back-btn {
  background: none;
  border: none;
  font-size: 1rem;
  cursor: pointer;
  padding: 0.5rem;
  color: #666;
}

.header-actions {
  display: flex;
  gap: 0.5rem;
}

.action-btn {
  background: none;
  border: none;
  font-size: 1.2rem;
  cursor: pointer;
  padding: 0.5rem;
  border-radius: 8px;
  transition: background 0.3s ease;
}

.action-btn:hover {
  background: #f0f0f0;
}

.action-btn.delete:hover {
  background: #fee;
}

.detail-content {
  max-width: 600px;
  margin: 0 auto;
  padding: 1.5rem;
}

.image-section {
  margin-bottom: 2rem;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 4px 20px rgba(0,0,0,0.1);
}

.image-section img {
  width: 100%;
  height: auto;
  display: block;
}

.placeholder-image {
  width: 100%;
  height: 400px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 4rem;
  color: white;
}

.info-section h1 {
  margin: 0 0 0.5rem 0;
  font-size: 2rem;
  color: #333;
}

.category {
  margin: 0 0 1rem 0;
  color: #667eea;
  font-size: 1.1rem;
  font-weight: 500;
}

.description {
  margin: 0 0 2rem 0;
  color: #666;
  line-height: 1.6;
  font-size: 1.1rem;
}

.description.placeholder {
  color: #999;
  font-style: italic;
}

.details-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
  margin-bottom: 2rem;
  padding: 1.5rem;
  background: #f8f8f8;
  border-radius: 12px;
}

.detail-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.5rem 0;
}

.detail-item .label {
  font-weight: 500;
  color: #666;
}

.detail-item .value {
  font-weight: 600;
  color: #333;
}

.tags-section h3 {
  margin: 0 0 1rem 0;
  color: #333;
  font-size: 1.1rem;
}

.tags {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.tag {
  background: #667eea;
  color: white;
  padding: 0.5rem 1rem;
  border-radius: 16px;
  font-size: 0.9rem;
}

.loading {
  display: flex;
  align-items: center;
  justify-content: center;
  height: calc(100vh - 80px);
  color: #666;
}

@media (max-width: 768px) {
  .detail-content {
    padding: 1rem;
  }
  
  .info-section h1 {
    font-size: 1.5rem;
  }
  
  .details-grid {
    grid-template-columns: 1fr;
  }
  
  .placeholder-image {
    height: 300px;
    font-size: 3rem;
  }
}
</style>