<template>
  <div class="clothing-view bg-light min-vh-100 py-3">
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
            <h2 class="fw-bold text-dark m-0">My Clothing</h2>
            <p class="text-muted m-0" v-if="filteredClothing?.length">
              {{ filteredClothing.length }} items
            </p>
          </div>

          <!-- Grid -->
          <div v-if="filteredClothing?.length" class="row g-4">
            <div 
              v-for="item in filteredClothing" 
              :key="item.id"
              class="col-md-6 col-lg-4"
            >
              <div class="card h-100 shadow-sm clothing-card" @click="$router.push(`/app/clothing/${item.id}`)">
                
                <!-- Image -->
                <div class="position-relative">
                  <img 
                    v-if="item.imageUrl" 
                    :src="item.imageUrl" 
                    class="card-img-top"
                  >
                  <div 
                    v-else 
                    class="d-flex justify-content-center align-items-center bg-primary text-white fs-1"
                    style="height: 200px;"
                  >
                    {{ getCategoryIcon(item.category) }}
                  </div>

                  <!-- Favorite Button -->
                  <button 
                    class="btn btn-light rounded-circle shadow position-absolute top-0 end-0 m-2"
                    @click.stop="toggleFavorite(item)"
                  >
                    {{ item.favorite ? '❤️' : '🤍' }}
                  </button>
                </div>

                <!-- Card body -->
                <div class="card-body">
                  <h5 class="card-title fw-semibold">
                    {{ item.name || item.title }}
                  </h5>
                  <p class="text-primary mb-1">{{ getCategoryLabel(item.category) }}</p>

                  <!-- Tags -->
                  <div class="d-flex flex-wrap gap-2 mb-2">
                    <span v-if="item.colors && item.colors.length" class="badge bg-light text-secondary">
                      {{ item.colors[0] }}{{ item.colors.length > 1 ? ' +' + (item.colors.length - 1) : '' }}
                    </span>
                    <span v-if="item.seasons && item.seasons.length" class="badge bg-light text-secondary">
                      {{ item.seasons[0] }}{{ item.seasons.length > 1 ? ' +' + (item.seasons.length - 1) : '' }}
                    </span>
                  </div>

                  <p class="small text-muted fst-italic" v-if="item.brand">
                    {{ item.brand }}
                  </p>
                </div>

              </div>
            </div>
          </div>

          <!-- Empty State -->
          <div v-else class="text-center py-5">
            <div class="fs-1 opacity-50 mb-3">👕</div>
            <h3>No clothing items yet</h3>
            <p>Use the + button to create your first clothing item!</p>
          </div>

        </div>
      </div>

      <!-- MOBILE LAYOUT -->
      <div v-else>
        
        <!-- Header -->
        <div class="d-flex justify-content-between align-items-center mb-2">
          <h2 class="fw-bold m-0">My Clothing</h2>
          <p class="text-muted m-0" v-if="filteredClothing?.length">
            {{ filteredClothing.length }} items
          </p>
        </div>

        <FilterPanel @filter-change="handleFilterChange" />

        <!-- Grid -->
        <div v-if="filteredClothing?.length" class="row g-3 mt-2">
          <div 
            v-for="item in filteredClothing" 
            :key="item.id"
            class="col-6"
          >
            <div class="card h-100 shadow-sm" @click="$router.push(`/app/clothing/${item.id}`)">
              <div class="bg-light">
                <img 
                  v-if="item.imageUrl" 
                  :src="item.imageUrl" 
                  class="img-fluid"
                >
                <div 
                  v-else 
                  class="d-flex justify-content-center align-items-center bg-primary text-white fs-1"
                  style="height: 150px;"
                >
                  {{ getCategoryIcon(item.category) }}
                </div>
              </div>
              <div class="card-body py-2">
                <h6 class="fw-semibold m-0">{{ item.name || item.title }}</h6>
                <p class="text-primary small mt-1">{{ getCategoryLabel(item.category) }}</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Empty State -->
        <div v-else class="text-center py-5">
          <div class="fs-1 opacity-50 mb-3">👕</div>
          <h3>No clothing items yet</h3>
          <p>Use the + button to create your first clothing item!</p>
        </div>

      </div>
    </div>
  </div>

  <!-- Alert Modal -->
  <AlertModal v-model:show="showAlert" :message="alertMessage" />
</template>

<script>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useCollection, useCurrentUser } from 'vuefire'
import { collection, query, orderBy, updateDoc, doc, serverTimestamp } from 'firebase/firestore'
import { db } from '@/firebase'
import FilterPanel from '@/components/FilterPanel.vue'
import AlertModal from '@/components/AlertModal.vue'

export default {
  name: 'ClothingView',
  components: { FilterPanel, AlertModal },
  setup() {
    const router = useRouter()
    const isMobile = ref(false)
    const activeFilters = ref({})

    const currentUser = useCurrentUser()
    const showAlert = ref(false)
    const alertMessage = ref('')
    
    const showAlertModal = (message) => {
      alertMessage.value = message
      showAlert.value = true
    }
    
    const clothingQuery = computed(() => {
      if (!currentUser.value) {
        // Return a query to a non-existent collection to avoid VueFire errors
        // This will return empty results until user is authenticated
        return query(collection(db, '_placeholder'))
      }
      return query(
        collection(db, 'users', currentUser.value.uid, 'clothingItems'),
        orderBy('createdAt', 'desc')
      )
    })

    const clothing = useCollection(clothingQuery)

    const checkMobile = () => { isMobile.value = window.innerWidth < 1024 }
    onMounted(() => { checkMobile(); window.addEventListener('resize', checkMobile) })
    onUnmounted(() => { window.removeEventListener('resize', checkMobile) })

    const filteredClothing = computed(() => {
      if (!clothing.value) return []
      return clothing.value.filter(item => {
        const { categories, seasons, colors, events } = activeFilters.value
        if (categories?.length && !categories.includes(item.category)) return false
        if (seasons?.length) {
          const itemSeasons = Array.isArray(item.seasons) ? item.seasons : item.season ? [item.season] : []
          if (!itemSeasons.some(s => seasons.includes(s))) return false
        }
        if (colors?.length) {
          const itemColors = Array.isArray(item.colors) ? item.colors : item.color ? [item.color] : []
          if (!itemColors.some(c => colors.includes(c))) return false
        }
        if (events?.length) {
          const itemEvents = Array.isArray(item.events) ? item.events : item.event ? [item.event] : []
          if (!itemEvents.some(e => events.includes(e))) return false
        }
        return true
      })
    })

    const handleFilterChange = (filters) => { activeFilters.value = filters }

    const getCategoryIcon = (category) => {
      const icons = { head: '👒', top: '👕', bottom: '👖', shoe: '👟', accessory: '👒', dress: '👗'}
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

    const toggleFavorite = async (item) => {
      if (!currentUser.value) return
      try {
        const itemRef = doc(db, 'users', currentUser.value.uid, 'clothingItems', item.id)
        await updateDoc(itemRef, { 
          favorite: !item.favorite, 
          updatedAt: serverTimestamp() 
        })
      } catch (error) { 
        console.error('Error toggling favorite:', error)
        showAlertModal('Failed to update favorite. Please try again.')
      }
    }

    const navigateToItem = (itemId) => { 
      router.push(`/app/clothing/${itemId}`) 
    }

    const navigateToCreate = () => { 
      router.push('/app/create?type=Clothing') 
    }

    return {
      isMobile,
      clothing,
      filteredClothing,
      handleFilterChange,
      getCategoryIcon,
      getCategoryLabel,
      toggleFavorite,
      navigateToItem,
      navigateToCreate,
      showAlert,
      alertMessage,
      showAlertModal
    }
  }
}
</script>

<style scoped>
.clothing-card {
  transition: transform 0.2s ease, box-shadow 0.2s ease;
  cursor: pointer;
}

.clothing-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 0.5rem 1rem rgba(0, 0, 0, 0.15) !important;
}

.bg-gradient {
  background-size: cover;
}
</style>