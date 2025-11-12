<!-- components/FilterPanel.vue -->
<template>
  <div>
    <!-- Mobile Filter Button -->
    <button 
      v-if="isMobile && showFilterButton" 
      class="mobile-filter-btn"
      @click="openMobileFilters"
    >
      <span>🔍 Filter</span>
      <span class="filter-count" v-if="activeFilterCount > 0">
        {{ activeFilterCount }}
      </span>
    </button>

    <!-- Desktop Filter Panel (Always Visible) -->
    <div v-if="!isMobile && showFilterPanel" class="filter-panel desktop">
      <div class="filter-header">
        <h3>Filter</h3>
        <button 
          v-if="activeFilterCount > 0" 
          class="clear-all-btn"
          @click="clearAllFilters"
        >
          Clear All
        </button>
      </div>
      
      <div class="filter-content">
        <FilterSection 
          v-for="section in filterSections"
          :key="section.key"
          :title="section.title"
          :options="section.options"
          :selected-values="filters[section.key]"
          @update="updateFilters(section.key, $event)"
        />
      </div>
    </div>

    <!-- Mobile Offcanvas Filter Panel -->
    <div 
      v-if="isMobile && showMobileFilters" 
      class="mobile-filter-overlay"
      @click="closeMobileFilters"
    >
      <div class="mobile-filter-panel" @click.stop>
        <div class="mobile-filter-header">
          <h3>Filter Items</h3>
          <button class="close-btn" @click="closeMobileFilters">
            ✕
          </button>
        </div>
        
        <div class="mobile-filter-content">
          <FilterSection 
            v-for="section in filterSections"
            :key="section.key"
            :title="section.title"
            :options="section.options"
            :selected-values="filters[section.key]"
            @update="updateFilters(section.key, $event)"
          />
        </div>
        
        <div class="mobile-filter-actions">
          <button class="action-btn clear" @click="clearAllFilters">
            Clear All
          </button>
          <button class="action-btn apply" @click="closeMobileFilters">
            Apply Filters
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRoute } from 'vue-router'
import FilterSection from './FilterSection.vue'

export default {
  name: 'FilterPanel',
  components: {
    FilterSection
  },
  emits: ['filter-change'],
  setup(props, { emit }) {
    const route = useRoute()
    const isMobile = ref(false)
    const showMobileFilters = ref(false)
    
    const filters = ref({
      categories: [],
      seasons: [],
      colors: [],
      events: []
    })

    const filterSections = [
      {
        key: 'categories',
        title: 'Item Category',
        options: ['Tops', 'Bottoms', 'Shoes', 'Accessories', 'Outerwear', 'Dresses']
      },
      {
        key: 'seasons',
        title: 'Season',
        options: ['Spring', 'Summer', 'Fall', 'Winter', 'All Season']
      },
      {
        key: 'colors',
        title: 'Color',
        options: ['Black', 'White', 'Red', 'Blue', 'Green', 'Yellow', 'Purple', 'Pink', 'Orange', 'Brown', 'Gray', 'Multi']
      },
      {
        key: 'events',
        title: 'Event',
        options: ['Casual', 'Formal', 'Work', 'Party', 'Sports', 'Beach', 'Date', 'Travel']
      }
    ]

    // Don't show filter on profile page
    const showFilterPanel = computed(() => {
      return route.name !== 'Profile'
    })

    const showFilterButton = computed(() => {
      return route.name !== 'Profile'
    })

    // Check if mobile on mount and on resize
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

    const activeFilterCount = computed(() => {
      return Object.values(filters.value).reduce((total, current) => total + current.length, 0)
    })

    const updateFilters = (filterKey, selectedValues) => {
      filters.value[filterKey] = selectedValues
      emit('filter-change', { ...filters.value })
    }

    const clearAllFilters = () => {
      Object.keys(filters.value).forEach(key => {
        filters.value[key] = []
      })
      emit('filter-change', { ...filters.value })
    }

    const openMobileFilters = () => {
      showMobileFilters.value = true
      document.body.style.overflow = 'hidden'
    }

    const closeMobileFilters = () => {
      showMobileFilters.value = false
      document.body.style.overflow = ''
    }

    return {
      isMobile,
      showMobileFilters,
      showFilterPanel,
      showFilterButton,
      filters,
      filterSections,
      activeFilterCount,
      updateFilters,
      clearAllFilters,
      openMobileFilters,
      closeMobileFilters
    }
  }
}
</script>

<style scoped>
/* Mobile Filter Button */
.mobile-filter-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1rem;
  background: white;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  font-weight: 500;
  cursor: pointer;
  margin-bottom: 1rem;
  width: 100%;
  justify-content: center;
  transition: all 0.3s ease;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.mobile-filter-btn:hover {
  border-color: #667eea;
  background: #f8f9ff;
}

.filter-count {
  background: #667eea;
  color: white;
  border-radius: 50%;
  width: 1.25rem;
  height: 1.25rem;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.75rem;
  font-weight: bold;
}

/* Desktop Filter Panel */
.filter-panel.desktop {
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  height: fit-content;
  position: sticky;
  top: 1rem;
}

.filter-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid #f0f0f0;
}

.filter-header h3 {
  margin: 0;
  font-size: 1.1rem;
  color: #333;
}

.clear-all-btn {
  background: none;
  border: none;
  color: #667eea;
  font-size: 0.9rem;
  cursor: pointer;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  transition: background 0.3s ease;
}

.clear-all-btn:hover {
  background: #f0f0f0;
}

/* Mobile Offcanvas Overlay */
.mobile-filter-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 1000;
  display: flex;
  align-items: flex-end;
}

.mobile-filter-panel {
  background: white;
  border-radius: 20px 20px 0 0;
  width: 100%;
  max-height: 80vh;
  display: flex;
  flex-direction: column;
  animation: slideUp 0.3s ease;
}

@keyframes slideUp {
  from {
    transform: translateY(100%);
  }
  to {
    transform: translateY(0);
  }
}

.mobile-filter-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem;
  border-bottom: 1px solid #f0f0f0;
  position: sticky;
  top: 0;
  background: white;
  border-radius: 20px 20px 0 0;
}

.mobile-filter-header h3 {
  margin: 0;
  font-size: 1.2rem;
  color: #333;
}

.close-btn {
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  padding: 0.5rem;
  color: #666;
}

.mobile-filter-content {
  flex: 1;
  overflow-y: auto;
  padding: 0 1.5rem;
  max-height: 60vh;
}

.mobile-filter-actions {
  display: flex;
  gap: 1rem;
  padding: 1.5rem;
  border-top: 1px solid #f0f0f0;
  background: white;
  position: sticky;
  bottom: 0;
}

.action-btn {
  flex: 1;
  padding: 1rem;
  border: none;
  border-radius: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.action-btn.clear {
  background: #f8f8f8;
  color: #666;
}

.action-btn.clear:hover {
  background: #f0f0f0;
}

.action-btn.apply {
  background: #000;
  color: white;
}

.action-btn.apply:hover {
  background: #333;
}

/* Hide desktop filter on mobile */
@media (max-width: 1023px) {
  .filter-panel.desktop {
    display: none;
  }
}

/* Show mobile filter button only on mobile */
@media (min-width: 1024px) {
  .mobile-filter-btn {
    display: none;
  }
}
</style>