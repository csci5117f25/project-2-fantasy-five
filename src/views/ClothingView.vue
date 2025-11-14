<template>
  <div class="clothing-view">
    <div class="view-container">
      <!-- Desktop: Sidebar + Content -->
      <div class="desktop-layout" v-if="!isMobile">
        <aside class="sidebar">
          <FilterPanel @filter-change="handleFilterChange" />
        </aside>
        
        <main class="content-main">
          <div class="view-header">
            <h2>My Clothing</h2>
            <p class="results-count" v-if="filteredClothing && filteredClothing.length > 0">
              {{ filteredClothing.length }} items
            </p>
          </div>
          
          <!-- Content Grid -->
          <div class="content-grid" v-if="filteredClothing && filteredClothing.length > 0">
            <div 
              v-for="item in filteredClothing" 
              :key="item.id"
              class="clothing-card"
              @click="navigateToItem(item.id)"
            >
              <div class="image-container">
                <img v-if="item.imageUrl" :src="item.imageUrl" :alt="item.name">
                <div v-else class="placeholder-image">{{ getCategoryIcon(item.category) }}</div>
                <div class="card-overlay">
                  <button class="quick-action-btn" @click.stop="toggleFavorite(item)">
                    {{ item.favorite ? '❤️' : '🤍' }}
                  </button>
                </div>
              </div>
              <div class="card-content">
                <h3>{{ item.name || item.title }}</h3>
                <p class="category">{{ item.category }}</p>
                <div class="tags">
                  <span v-if="item.color" class="tag">{{ item.color }}</span>
                  <span v-if="item.season" class="tag">{{ item.season }}</span>
                </div>
                <div class="meta-info">
                  <span v-if="item.brand" class="brand">{{ item.brand }}</span>
                </div>
              </div>
            </div>
          </div>
          
          <!-- Empty State -->
          <div v-else class="empty-state">
            <div class="empty-icon">👕</div>
            <h3>No clothing items yet</h3>
            <p>Add your first clothing item to get started!</p>
            <button @click="navigateToCreate" class="btn-primary">
              Add Clothing
            </button>
          </div>
        </main>
      </div>
      
      <!-- Mobile: Stacked Layout -->
      <div class="mobile-layout" v-else>
        <div class="view-header">
          <h2>My Clothing</h2>
          <p class="results-count" v-if="filteredClothing && filteredClothing.length > 0">
            {{ filteredClothing.length }} items
          </p>
        </div>
        
        <FilterPanel @filter-change="handleFilterChange" />
        
        <!-- Content Grid -->
        <div class="content-grid mobile-grid" v-if="filteredClothing && filteredClothing.length > 0">
          <div 
            v-for="item in filteredClothing" 
            :key="item.id"
            class="clothing-card"
            @click="navigateToItem(item.id)"
          >
            <div class="image-container">
              <img v-if="item.imageUrl" :src="item.imageUrl" :alt="item.name">
              <div v-else class="placeholder-image">{{ getCategoryIcon(item.category) }}</div>
              <div class="card-overlay">
                <button class="quick-action-btn" @click.stop="toggleFavorite(item)">
                  {{ item.favorite ? '❤️' : '🤍' }}
                </button>
              </div>
            </div>
            <div class="card-content">
              <h3>{{ item.name || item.title }}</h3>
              <p class="category">{{ item.category }}</p>
              <div class="tags">
                <span v-if="item.color" class="tag">{{ item.color }}</span>
              </div>
            </div>
          </div>
        </div>
        
        <!-- Empty State -->
        <div v-else class="empty-state">
          <div class="empty-icon">👕</div>
          <h3>No clothing items yet</h3>
          <p>Add your first clothing item to get started!</p>
          <button @click="navigateToCreate" class="btn-primary">
            Add Clothing
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useCollection } from 'vuefire'
import { collection, query, where, orderBy, updateDoc, doc } from 'firebase/firestore'
import { db, auth } from '@/firebase'
import FilterPanel from '@/components/FilterPanel.vue'

export default {
  name: 'ClothingView',
  components: {
    FilterPanel
  },
  setup() {
    const router = useRouter()
    const isMobile = ref(false)
    const activeFilters = ref({})
    
    // Load clothing from Firestore using VueFire
    const user = auth.currentUser
    const clothingQuery = user ? query(
      collection(db, 'clothing'),
      where('userId', '==', user.uid),
      orderBy('createdAt', 'desc')
    ) : null
    
    const clothing = useCollection(clothingQuery)

    // Check mobile layout
    const checkMobile = () => {
      isMobile.value = window.innerWidth < 1024
    }

    onMounted(() => {
      checkMobile()
      window.addEventListener('resize', checkMobile)
    })

    onUnmounted(() => {
      window.removeEventListener('resize', checkMobile)
    })

    const filteredClothing = computed(() => {
      if (!clothing.value) return []
      
      return clothing.value.filter(item => {
        const { categories, seasons, colors, events } = activeFilters.value
        
        if (categories && categories.length > 0) {
          if (!item.category || !categories.includes(item.category)) {
            return false
          }
        }
        
        if (seasons && seasons.length > 0) {
          if (!item.season || !seasons.includes(item.season)) {
            return false
          }
        }
        
        if (colors && colors.length > 0) {
          if (!item.color || !colors.includes(item.color)) {
            return false
          }
        }
        
        if (events && events.length > 0) {
          if (!item.event || !events.includes(item.event)) {
            return false
          }
        }
        
        return true
      })
    })

    const handleFilterChange = (filters) => {
      activeFilters.value = filters
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

    const toggleFavorite = async (item) => {
      try {
        const itemRef = doc(db, 'clothing', item.id)
        await updateDoc(itemRef, {
          favorite: !item.favorite,
          updatedAt: new Date()
        })
      } catch (error) {
        console.error('Error updating favorite:', error)
      }
    }

    const navigateToItem = (itemId) => {
      router.push(`/app/clothing/${itemId}`)
    }

    const navigateToCreate = () => {
      router.push('/app/create')
    }

    return {
      isMobile,
      clothing,
      filteredClothing,
      handleFilterChange,
      getCategoryIcon,
      toggleFavorite,
      navigateToItem,
      navigateToCreate
    }
  }
}
</script>

<style scoped>
/* Your existing styles remain exactly the same */
.clothing-view {
  padding: 1rem;
  min-height: calc(100vh - 80px);
  background: #f5f5f5;
}

.view-container {
  max-width: 1400px;
  margin: 0 auto;
}

.desktop-layout {
  display: grid;
  grid-template-columns: 300px 1fr;
  gap: 2rem;
  align-items: start;
}

.sidebar {
  position: sticky;
  top: 1rem;
}

.content-main {
  min-height: 100%;
}

.mobile-layout {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.view-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.view-header h2 {
  margin: 0;
  font-size: 1.8rem;
  font-weight: bold;
  color: #333;
}

.results-count {
  margin: 0;
  color: #666;
  font-size: 0.9rem;
}

.content-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 1.5rem;
}

.content-grid.mobile-grid {
  grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  gap: 1rem;
}

.clothing-card {
  background: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 12px rgba(0,0,0,0.1);
  cursor: pointer;
  transition: all 0.3s ease;
  border: 1px solid #f0f0f0;
}

.clothing-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 25px rgba(0,0,0,0.15);
}

.image-container {
  position: relative;
  width: 100%;
  height: 200px;
  overflow: hidden;
}

.image-container img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.placeholder-image {
  width: 100%;
  height: 100%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2.5rem;
  color: white;
}

.card-overlay {
  position: absolute;
  top: 0.5rem;
  right: 0.5rem;
  opacity: 0;
  transition: opacity 0.3s ease;
}

.clothing-card:hover .card-overlay {
  opacity: 1;
}

.quick-action-btn {
  background: rgba(255,255,255,0.9);
  border: none;
  border-radius: 50%;
  width: 2.5rem;
  height: 2.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  font-size: 1.2rem;
  backdrop-filter: blur(10px);
  transition: transform 0.2s ease;
}

.quick-action-btn:hover {
  transform: scale(1.1);
}

.card-content {
  padding: 1.25rem;
}

.card-content h3 {
  margin: 0 0 0.25rem 0;
  font-size: 1.1rem;
  font-weight: 600;
  color: #333;
}

.category {
  color: #667eea;
  margin: 0 0 0.5rem 0;
  font-size: 0.9rem;
  font-weight: 500;
}

.tags {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-bottom: 0.5rem;
}

.tag {
  background: #f0f0f0;
  padding: 0.25rem 0.5rem;
  border-radius: 12px;
  font-size: 0.8rem;
  color: #666;
}

.meta-info {
  margin-top: 0.5rem;
}

.brand {
  font-size: 0.8rem;
  color: #999;
  font-style: italic;
}

.empty-state {
  text-align: center;
  padding: 4rem 2rem;
  color: #666;
}

.empty-icon {
  font-size: 4rem;
  margin-bottom: 1rem;
  opacity: 0.5;
}

.empty-state h3 {
  margin: 0 0 0.5rem 0;
  color: #333;
}

.empty-state p {
  margin: 0 0 1.5rem 0;
}

.btn-primary {
  background: #000;
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 500;
  transition: background 0.3s ease;
}

.btn-primary:hover {
  background: #333;
}

@media (max-width: 1023px) {
  .clothing-view {
    padding: 0.75rem;
  }
  
  .desktop-layout {
    grid-template-columns: 1fr;
    gap: 1rem;
  }
  
  .sidebar {
    position: static;
  }
  
  .view-header h2 {
    font-size: 1.5rem;
  }
}

@media (max-width: 768px) {
  .view-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.5rem;
  }
  
  .image-container {
    height: 150px;
  }
  
  .card-content {
    padding: 1rem;
  }
  
  .card-content h3 {
    font-size: 1rem;
  }
}

@media (max-width: 480px) {
  .content-grid.mobile-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}
</style>