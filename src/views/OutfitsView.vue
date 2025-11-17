<template>
  <div class="outfits-view bg-light min-vh-100 py-3">
    <div class="container">

      <!-- DESKTOP LAYOUT -->
      <div v-if="!isMobile" class="row g-4">
        
        <!-- Sidebar -->
        <div class="col-lg-3">
          <div class="sticky-top" style="top: 1rem">
            <FilterPanel @filter-change="handleFilterChange" />
          </div>
        </div>

        <!-- Main content -->
        <div class="col-lg-9">
          
          <!-- Header -->
          <div class="d-flex justify-content-between align-items-center mb-3">
            <h2 class="fw-bold text-dark m-0">My Outfits</h2>
            <p class="text-muted m-0" v-if="filteredOutfits?.length">
              {{ filteredOutfits.length }} outfits
            </p>
          </div>

          <!-- Grid -->
          <div v-if="filteredOutfits?.length" class="row g-4">
            <div 
              v-for="outfit in filteredOutfits" 
              :key="outfit.id"
              class="col-md-6 col-lg-4"
            >
              <div class="card h-100 shadow-sm outfit-card" @click="$router.push(`/app/outfits/${outfit.id}`)">
                
                <!-- Image -->
                <div class="position-relative">
                  <img 
                    v-if="outfit.imageUrl" 
                    :src="outfit.imageUrl" 
                    class="card-img-top"
                  >
                  <div 
                    v-else 
                    class="d-flex justify-content-center align-items-center bg-primary text-white fs-1"
                    style="height: 200px;"
                  >
                    👕
                  </div>

                  <!-- Favorite Button -->
                  <button 
                    class="btn btn-light rounded-circle shadow position-absolute top-0 end-0 m-2"
                    @click.stop="toggleFavorite(outfit)"
                  >
                    {{ outfit.favorite ? '❤️' : '🤍' }}
                  </button>
                </div>

                <!-- Card body -->
                <div class="card-body">
                  <h5 class="card-title fw-semibold">
                    {{ outfit.title || 'Untitled Outfit' }}
                  </h5>
                  <p class="text-primary mb-1">{{ outfit.category }}</p>

                  <p class="text-muted small">
                    {{ truncateDescription(outfit.description) }}
                  </p>

                  <!-- Tags -->
                  <div class="d-flex flex-wrap gap-2 mb-2">
                    <span v-if="outfit.season" class="badge bg-light text-secondary">{{ outfit.season }}</span>
                    <span v-if="outfit.event" class="badge bg-light text-secondary">{{ outfit.event }}</span>
                  </div>

                  <p class="small text-muted fst-italic" v-if="outfit.items">
                    {{ outfit.items.length }} items
                  </p>
                </div>

              </div>
            </div>
          </div>

          <!-- Empty State -->
          <div v-else class="text-center py-5">
            <div class="fs-1 opacity-50 mb-3">👕</div>
            <h3>No outfits yet</h3>
            <p>Create your first outfit to get started!</p>
            <button class="btn btn-dark px-4" @click="$router.push('/app/create')">
              Create Outfit
            </button>
          </div>

        </div>
      </div>

      <!-- MOBILE LAYOUT -->
      <div v-else>
        
        <!-- Header -->
        <div class="d-flex justify-content-between align-items-center mb-2">
          <h2 class="fw-bold m-0">My Outfits</h2>
          <p class="text-muted m-0" v-if="filteredOutfits?.length">
            {{ filteredOutfits.length }} outfits
          </p>
        </div>

        <FilterPanel @filter-change="handleFilterChange" />

        <!-- Grid -->
        <div v-if="filteredOutfits?.length" class="row g-3 mt-2">
          <div 
            v-for="outfit in filteredOutfits" 
            :key="outfit.id"
            class="col-6"
          >
            <div class="card h-100 shadow-sm" @click="$router.push(`/app/outfits/${outfit.id}`)">
              <div class="bg-light">
                <img 
                  v-if="outfit.imageUrl" 
                  :src="outfit.imageUrl" 
                  class="img-fluid"
                >
                <div 
                  v-else 
                  class="d-flex justify-content-center align-items-center bg-primary text-white fs-1"
                  style="height: 150px;"
                >
                  👕
                </div>
              </div>
              <div class="card-body py-2">
                <h6 class="fw-semibold m-0">{{ outfit.title || 'Untitled Outfit' }}</h6>
                <p class="text-primary small mt-1">{{ outfit.category }}</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Empty State -->
        <div v-else class="text-center py-5">
          <div class="fs-1 opacity-50 mb-3">👕</div>
          <h3>No outfits yet</h3>
          <p>Create your first outfit to get started!</p>
          <button class="btn btn-dark px-4" @click="$router.push('/app/create')">
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
.outfit-card:hover {
  transform: translateY(-4px);
  transition: 0.3s ease;
}
</style>