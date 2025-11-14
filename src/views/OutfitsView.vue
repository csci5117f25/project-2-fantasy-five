<template>
  <div class="outfits-view">
    <div class="view-container">
      <!-- Desktop: Sidebar + Content -->
      <div class="desktop-layout" v-if="!isMobile">
        <aside class="sidebar">
          <FilterPanel @filter-change="handleFilterChange" />
        </aside>
        
        <main class="content-main">
          <div class="view-header">
            <h2>My Outfits</h2>
            <p class="results-count" v-if="filteredOutfits && filteredOutfits.length > 0">
              {{ filteredOutfits.length }} outfits
            </p>
          </div>
          
          <!-- Content Grid -->
          <div class="content-grid" v-if="filteredOutfits && filteredOutfits.length > 0">
            <div 
              v-for="outfit in filteredOutfits" 
              :key="outfit.id"
              class="outfit-card"
              @click="$router.push(`/app/outfits/${outfit.id}`)"
            >
              <div class="image-container">
                <img v-if="outfit.imageUrl" :src="outfit.imageUrl" :alt="outfit.title">
                <div v-else class="placeholder-image">👕</div>
                <div class="card-overlay">
                  <button class="quick-action-btn" @click.stop="toggleFavorite(outfit)">
                    {{ outfit.favorite ? '❤️' : '🤍' }}
                  </button>
                </div>
              </div>
              <div class="card-content">
                <h3>{{ outfit.title || 'Untitled Outfit' }}</h3>
                <p class="category">{{ outfit.category }}</p>
                <p class="description">{{ truncateDescription(outfit.description) }}</p>
                <div class="tags">
                  <span v-if="outfit.season" class="tag">{{ outfit.season }}</span>
                  <span v-if="outfit.event" class="tag">{{ outfit.event }}</span>
                </div>
                <div class="item-count" v-if="outfit.items">
                  {{ outfit.items.length }} items
                </div>
              </div>
            </div>
          </div>
          
          <!-- Empty State -->
          <div v-else class="empty-state">
            <div class="empty-icon">👕</div>
            <h3>No outfits yet</h3>
            <p>Create your first outfit to get started!</p>
            <button @click="$router.push('/app/create')" class="btn-primary">
              Create Outfit
            </button>
          </div>
        </main>
      </div>
      
      <!-- Mobile: Stacked Layout -->
      <div class="mobile-layout" v-else>
        <div class="view-header">
          <h2>My Outfits</h2>
          <p class="results-count" v-if="filteredOutfits && filteredOutfits.length > 0">
            {{ filteredOutfits.length }} outfits
          </p>
        </div>
        
        <FilterPanel @filter-change="handleFilterChange" />
        
        <!-- Content Grid -->
        <div class="content-grid mobile-grid" v-if="filteredOutfits && filteredOutfits.length > 0">
          <div 
            v-for="outfit in filteredOutfits" 
            :key="outfit.id"
            class="outfit-card"
            @click="$router.push(`/app/outfits/${outfit.id}`)"
          >
            <div class="image-container">
              <img v-if="outfit.imageUrl" :src="outfit.imageUrl" :alt="outfit.title">
              <div v-else class="placeholder-image">👕</div>
            </div>
            <div class="card-content">
              <h3>{{ outfit.title || 'Untitled Outfit' }}</h3>
              <p class="category">{{ outfit.category }}</p>
            </div>
          </div>
        </div>
        
        <!-- Empty State -->
        <div v-else class="empty-state">
          <div class="empty-icon">👕</div>
          <h3>No outfits yet</h3>
          <p>Create your first outfit to get started!</p>
          <button @click="$router.push('/app/create')" class="btn-primary">
            Create Outfit
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
  name: 'OutfitsView',
  components: {
    FilterPanel
  },
  setup() {
    const router = useRouter()
    const isMobile = ref(false)
    const activeFilters = ref({})
    
    // Load outfits from Firestore using VueFire
    const user = auth.currentUser
    const outfitsQuery = user ? query(
      collection(db, 'outfits'),
      where('userId', '==', user.uid),
      orderBy('createdAt', 'desc')
    ) : null
    
    const outfits = useCollection(outfitsQuery)

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

    const filteredOutfits = computed(() => {
      if (!outfits.value) return []
      
      return outfits.value.filter(outfit => {
        const { categories, seasons, colors, events } = activeFilters.value
        
        if (categories && categories.length > 0) {
          if (!outfit.category || !categories.includes(outfit.category)) {
            return false
          }
        }
        
        if (seasons && seasons.length > 0) {
          if (!outfit.season || !seasons.includes(outfit.season)) {
            return false
          }
        }
        
        if (colors && colors.length > 0) {
          if (!outfit.color || !colors.includes(outfit.color)) {
            return false
          }
        }
        
        if (events && events.length > 0) {
          if (!outfit.event || !events.includes(outfit.event)) {
            return false
          }
        }
        
        return true
      })
    })

    const handleFilterChange = (filters) => {
      activeFilters.value = filters
    }

    const truncateDescription = (desc) => {
      if (!desc) return ''
      return desc.length > 100 ? desc.substring(0, 100) + '...' : desc
    }

    const toggleFavorite = async (outfit) => {
      try {
        const outfitRef = doc(db, 'outfits', outfit.id)
        await updateDoc(outfitRef, {
          favorite: !outfit.favorite,
          updatedAt: new Date()
        })
      } catch (error) {
        console.error('Error updating favorite:', error)
      }
    }

    const navigateToItem = (outfitId) => {
      router.push(`/app/outfits/${outfitId}`)
    }

    const navigateToCreate = () => {
      router.push('/app/create')
    }

    return {
      isMobile,
      outfits,
      filteredOutfits,
      handleFilterChange,
      truncateDescription,
      toggleFavorite,
      navigateToItem,
      navigateToCreate
    }
  }
}
</script>

<style scoped>
.outfits-view {
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

.outfit-card {
  background: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 12px rgba(0,0,0,0.1);
  cursor: pointer;
  transition: all 0.3s ease;
  border: 1px solid #f0f0f0;
}

.outfit-card:hover {
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
  font-size: 3rem;
  color: white;
}

.card-overlay {
  position: absolute;
  top: 0.5rem;
  right: 0.5rem;
  opacity: 0;
  transition: opacity 0.3s ease;
}

.outfit-card:hover .card-overlay {
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
  margin: 0 0 0.5rem 0;
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

.description {
  color: #666;
  margin-bottom: 0.75rem;
  font-size: 0.9rem;
  line-height: 1.4;
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

.item-count {
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
  .outfits-view {
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