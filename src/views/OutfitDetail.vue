<!-- views/OutfitDetailView.vue -->
<template>
  <div class="detail-view" v-if="outfit">
    <div class="detail-header">
      <button class="back-btn" @click="$router.back()">← Back</button>
      <div class="header-actions">
        <button class="action-btn" @click="toggleFavorite">
          {{ outfit.favorite ? '❤️' : '🤍' }}
        </button>
        <button class="action-btn" @click="editOutfit">✏️</button>
        <button class="action-btn delete" @click="confirmDelete">🗑️</button>
      </div>
    </div>
    
    <div class="detail-content">
      <div class="image-section">
        <img v-if="outfit.imageUrl" :src="outfit.imageUrl" :alt="outfit.title">
        <div v-else class="outfit-composition">
          <div 
            v-for="item in outfit.itemDetails" 
            :key="item.id"
            class="outfit-item-preview"
          >
            <img v-if="item.imageUrl" :src="item.imageUrl" :alt="item.name">
            <div v-else class="item-placeholder">
              {{ getCategoryIcon(item.category) }}
            </div>
          </div>
        </div>
      </div>
      
      <div class="info-section">
        <h1>{{ outfit.title }}</h1>
        <p class="description" v-if="outfit.description">{{ outfit.description }}</p>
        <p class="description placeholder" v-else>No description</p>
        
        <div class="outfit-items">
          <h3>Items in this outfit</h3>
          <div class="items-list">
            <div 
              v-for="item in outfit.itemDetails" 
              :key="item.id"
              class="outfit-item"
              @click="$router.push(`/app/clothing/${item.id}`)"
            >
              <div class="item-image">
                <img v-if="item.imageUrl" :src="item.imageUrl" :alt="item.name">
                <div v-else class="item-placeholder small">
                  {{ getCategoryIcon(item.category) }}
                </div>
              </div>
              <div class="item-info">
                <h4>{{ item.name }}</h4>
                <p class="item-category">{{ item.category }}</p>
                <p class="item-color" v-if="item.color">{{ item.color }}</p>
              </div>
            </div>
          </div>
        </div>
        
        <div class="details-grid">
          <div class="detail-item" v-if="outfit.season">
            <span class="label">Season:</span>
            <span class="value">{{ outfit.season }}</span>
          </div>
          <div class="detail-item" v-if="outfit.event">
            <span class="label">Event:</span>
            <span class="value">{{ outfit.event }}</span>
          </div>
          <div class="detail-item">
            <span class="label">Created:</span>
            <span class="value">{{ formatDate(outfit.createdAt) }}</span>
          </div>
        </div>
        
        <div class="tags-section" v-if="outfit.tags && outfit.tags.length > 0">
          <h3>Tags</h3>
          <div class="tags">
            <span v-for="tag in outfit.tags" :key="tag" class="tag">
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
  name: 'OutfitDetail',
  setup() {
    const outfitId = this.$route.params.id
    const outfitRef = doc(db, 'outfits', outfitId)
    const outfit = useDocument(outfitRef)
    
    return { outfit }
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
        const outfitRef = doc(db, 'outfits', this.outfit.id)
        await updateDoc(outfitRef, {
          favorite: !this.outfit.favorite,
          updatedAt: new Date()
        })
      } catch (error) {
        console.error('Error updating favorite:', error)
      }
    },
    
    editOutfit() {
      this.$router.push(`/app/create?edit=${this.outfit.id}`)
    },
    
    confirmDelete() {
      if (confirm('Are you sure you want to delete this outfit?')) {
        this.deleteOutfit()
      }
    },
    
    async deleteOutfit() {
      try {
        await deleteDoc(doc(db, 'outfits', this.outfit.id))
        this.$router.push('/app/outfits')
      } catch (error) {
        console.error('Error deleting outfit:', error)
        alert('Failed to delete outfit')
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

.outfit-composition {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1rem;
  padding: 2rem;
  background: white;
  min-height: 400px;
}

.outfit-item-preview {
  border-radius: 12px;
  overflow: hidden;
  background: #f8f8f8;
  display: flex;
  align-items: center;
  justify-content: center;
}

.outfit-item-preview img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.item-placeholder {
  width: 100%;
  height: 100%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2rem;
  color: white;
}

.item-placeholder.small {
  font-size: 1.5rem;
  min-height: 80px;
}

.info-section h1 {
  margin: 0 0 0.5rem 0;
  font-size: 2rem;
  color: #333;
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

.outfit-items {
  margin-bottom: 2rem;
}

.outfit-items h3 {
  margin: 0 0 1rem 0;
  color: #333;
  font-size: 1.2rem;
}

.items-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.outfit-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  background: #f8f8f8;
  border-radius: 12px;
  cursor: pointer;
  transition: background 0.3s ease;
}

.outfit-item:hover {
  background: #f0f0f0;
}

.item-image {
  width: 60px;
  height: 60px;
  border-radius: 8px;
  overflow: hidden;
  flex-shrink: 0;
}

.item-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.item-info {
  flex: 1;
}

.item-info h4 {
  margin: 0 0 0.25rem 0;
  font-size: 1rem;
  color: #333;
}

.item-category {
  margin: 0 0 0.25rem 0;
  color: #667eea;
  font-size: 0.9rem;
  font-weight: 500;
}

.item-color {
  margin: 0;
  color: #666;
  font-size: 0.8rem;
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
  
  .outfit-composition {
    grid-template-columns: 1fr;
    padding: 1rem;
    min-height: 300px;
  }
  
  .details-grid {
    grid-template-columns: 1fr;
  }
}
</style>