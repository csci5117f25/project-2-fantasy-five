<template>
  <div class="outfits-view bg-light min-vh-100 py-3">
    <div class="container">

      <!-- DESKTOP LAYOUT -->
      <div v-if="!isMobile" class="row g-4">
        
        <!-- Sidebar -->
        <div class="col-lg-3">
          <div class="sticky-top" style="top: 1rem">
            <FilterPanel @filter-change="handleFilterChange" :hide-categories="true" />
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
                    {{ outfit.name || outfit.title || 'Untitled Outfit' }}
                  </h5>

                  <p class="text-muted small">
                    {{ truncateDescription(outfit.description) }}
                  </p>

                  <!-- Tags -->
                  <div class="d-flex flex-wrap gap-2 mb-2">
                    <span v-if="outfit.seasons && outfit.seasons.length" class="badge bg-light text-secondary">
                      {{ outfit.seasons[0] }}{{ outfit.seasons.length > 1 ? ' +' + (outfit.seasons.length - 1) : '' }}
                    </span>
                    <span v-if="outfit.events && outfit.events.length" class="badge bg-light text-secondary">
                      {{ outfit.events[0] }}{{ outfit.events.length > 1 ? ' +' + (outfit.events.length - 1) : '' }}
                    </span>
                  </div>

                  <p class="small text-muted fst-italic" v-if="outfit.clothingItemIds">
                    {{ outfit.clothingItemIds.length }} items
                  </p>
                </div>

              </div>
            </div>
          </div>

          <!-- Empty State -->
          <div v-else class="text-center py-5">
            <div class="fs-1 opacity-50 mb-3">👕</div>
            <h3>No Outfits yet</h3>
            <p>Use the + button to create your first outfit!</p>
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

        <FilterPanel @filter-change="handleFilterChange" :hide-categories="true" />

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
                <h6 class="fw-semibold m-0">{{ outfit.name || outfit.title || 'Untitled Outfit' }}</h6>
                <div v-if="outfit.seasons && outfit.seasons.length" class="d-flex flex-wrap gap-1 mt-1">
                  <span 
                    v-for="season in outfit.seasons.slice(0, 2)" 
                    :key="season"
                    class="badge bg-light text-secondary small"
                  >
                    {{ season }}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Empty State -->
          <div v-else class="text-center py-5">
            <div class="fs-1 opacity-50 mb-3">👕</div>
            <h3>No Outfits yet</h3>
            <p>Use the + button to create your first outfit!</p>
          </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useCollection, useCurrentUser } from 'vuefire'
import { collection, query, orderBy, updateDoc, doc, serverTimestamp } from 'firebase/firestore'
import { db } from '@/firebase'
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
    
    const currentUser = useCurrentUser()
    const outfitsQuery = computed(() => {
      if (!currentUser.value) {
        // Return a query to a non-existent collection to avoid VueFire errors
        // This will return empty results until user is authenticated
        return query(collection(db, '_placeholder'))
      }
      return query(
        collection(db, 'users', currentUser.value.uid, 'outfits'),
        orderBy('createdAt', 'desc')
      )
    })
    
    const outfits = useCollection(outfitsQuery)

    const checkMobile = () => { isMobile.value = window.innerWidth < 1024 }
    onMounted(() => { checkMobile(); window.addEventListener('resize', checkMobile) })
    onUnmounted(() => { window.removeEventListener('resize', checkMobile) })

    const filteredOutfits = computed(() => {
      if (!outfits.value) return []
      return outfits.value.filter(outfit => {
        const { seasons, colors, events } = activeFilters.value
        if (seasons?.length) {
          const outfitSeasons = Array.isArray(outfit.seasons) ? outfit.seasons : outfit.season ? [outfit.season] : []
          if (!outfitSeasons.some(s => seasons.includes(s))) return false
        }
        if (colors?.length) {
          const outfitColors = Array.isArray(outfit.colors) ? outfit.colors : outfit.color ? [outfit.color] : []
          if (!outfitColors.some(c => colors.includes(c))) return false
        }
        if (events?.length) {
          const outfitEvents = Array.isArray(outfit.events) ? outfit.events : outfit.event ? [outfit.event] : []
          if (!outfitEvents.some(e => events.includes(e))) return false
        }
        return true
      })
    })

    const handleFilterChange = (filters) => { activeFilters.value = filters }

    const truncateDescription = (desc) => {
      if (!desc) return ''
      return desc.length > 100 ? desc.substring(0, 100) + '...' : desc
    }

    const toggleFavorite = async (outfit) => {
      if (!currentUser.value) return
      try {
        const outfitRef = doc(db, 'users', currentUser.value.uid, 'outfits', outfit.id)
        await updateDoc(outfitRef, {
          favorite: !outfit.favorite,
          updatedAt: serverTimestamp()
        })
      } catch (error) {
        console.error('Error updating favorite:', error)
      }
    }

    const navigateToItem = (outfitId) => {
      router.push(`/app/outfits/${outfitId}`)
    }

    return {
      isMobile,
      outfits,
      filteredOutfits,
      handleFilterChange,
      truncateDescription,
      toggleFavorite,
      navigateToItem
    }
  }
}
</script>

<style scoped>
.outfit-card {
  transition: transform 0.2s ease, box-shadow 0.2s ease;
  cursor: pointer;
}

.outfit-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 0.5rem 1rem rgba(0, 0, 0, 0.15) !important;
}

.bg-gradient {
  background-size: cover;
}
</style>