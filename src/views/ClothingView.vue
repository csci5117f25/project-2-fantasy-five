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
                  <p class="text-primary mb-1">{{ item.category }}</p>

                  <!-- Tags -->
                  <div class="d-flex flex-wrap gap-2 mb-2">
                    <span v-if="item.color" class="badge bg-light text-secondary">{{ item.color }}</span>
                    <span v-if="item.season" class="badge bg-light text-secondary">{{ item.season }}</span>
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
            <p>Add your first clothing item to get started!</p>
            <button class="btn btn-dark px-4" @click="$router.push('/app/create')">
              Add Clothing
            </button>
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
                <p class="text-primary small mt-1">{{ item.category }}</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Empty State -->
        <div v-else class="text-center py-5">
          <div class="fs-1 opacity-50 mb-3">👕</div>
          <h3>No clothing items yet</h3>
          <p>Add your first clothing item to get started!</p>
          <button class="btn btn-dark px-4" @click="$router.push('/app/create')">
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
  components: { FilterPanel },
  setup() {
    const router = useRouter()
    const isMobile = ref(false)
    const activeFilters = ref({})

    const user = auth.currentUser
    const clothingQuery = user ? query(
      collection(db, 'clothing'),
      where('userId', '==', user.uid),
      orderBy('createdAt', 'desc')
    ) : null

    const clothing = useCollection(clothingQuery)

    const checkMobile = () => { isMobile.value = window.innerWidth < 1024 }
    onMounted(() => { checkMobile(); window.addEventListener('resize', checkMobile) })
    onUnmounted(() => { window.removeEventListener('resize', checkMobile) })

    const filteredClothing = computed(() => {
      if (!clothing.value) return []
      return clothing.value.filter(item => {
        const { categories, seasons, colors, events } = activeFilters.value
        if (categories?.length && !categories.includes(item.category)) return false
        if (seasons?.length && !seasons.includes(item.season)) return false
        if (colors?.length && !colors.includes(item.color)) return false
        if (events?.length && !events.includes(item.event)) return false
        return true
      })
    })

    const handleFilterChange = (filters) => { activeFilters.value = filters }

    const getCategoryIcon = (category) => {
      const icons = { Tops:'👕', Bottoms:'👖', Shoes:'👟', Accessories:'👒', Outerwear:'🧥', Dresses:'👗' }
      return icons[category] || '👕'
    }

    const toggleFavorite = async (item) => {
      try {
        const itemRef = doc(db, 'clothing', item.id)
        await updateDoc(itemRef, { favorite: !item.favorite, updatedAt: new Date() })
      } catch (error) { console.error(error) }
    }

    const navigateToItem = (itemId) => { router.push(`/app/clothing/${itemId}`) }
    const navigateToCreate = () => { router.push('/app/create') }

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
.clothing-card:hover {
  transform: translateY(-4px);
  transition: 0.3s ease;
  cursor: pointer;
}
</style>
