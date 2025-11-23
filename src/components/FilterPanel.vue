<template>
  <div>
    <!-- Mobile Filter Button -->
    <button
      v-if="isMobile"
      class="btn w-100 d-flex justify-content-center align-items-center mb-3 shadow-sm mobile-filter-btn"
      @click="openMobileFilters"
    >
      <span class="me-2 fs-5 fw-semibold">🔍 Filter</span>
      <span v-if="activeFilterCount > 0" class="badge bg-primary text-white rounded-circle filter-badge">
        {{ activeFilterCount }}
      </span>
    </button>

    <!-- Desktop Filter Panel -->
    <div v-if="!isMobile" class="card shadow-sm mb-3 sticky-top p-3 desktop-filter-panel" style="top: 1rem;">
      <div class="d-flex justify-content-between align-items-center mb-3 border-bottom pb-2">
        <h5 class="mb-0">Filter</h5>
        <button
          v-if="activeFilterCount > 0"
          class="btn btn-link p-0 text-primary"
          @click="clearAllFilters"
        >
          Clear All
        </button>
      </div>
      <div>
        <FilterSection
          v-for="section in visibleFilterSections"
          :key="section.key"
          :title="section.title"
          :options="section.options"
          :selected-values="filters[section.key]"
          @update="updateFilters(section.key, $event)"
        />
      </div>
    </div>

    <!-- Mobile Offcanvas Filter -->
    <div
      v-if="isMobile && showMobileFilters"
      class="position-fixed inset-0 bg-dark bg-opacity-50 d-flex justify-content-end"
      @click="closeMobileFilters"
      style="z-index: 1040;"
    >
      <div
        class="offcanvas offcanvas-bottom show bg-white mobile-offcanvas"
        @click.stop
      >
        <div class="offcanvas-header border-bottom">
          <h5 class="offcanvas-title">Filter Items</h5>
          <button type="button" class="btn-close text-reset" @click="closeMobileFilters"></button>
        </div>
        <div class="offcanvas-body overflow-auto p-4">
          <FilterSection
            v-for="section in visibleFilterSections"
            :key="section.key"
            :title="section.title"
            :options="section.options"
            :selected-values="filters[section.key]"
            @update="updateFilters(section.key, $event)"
          />
        </div>
        <div class="d-flex gap-2 p-3 border-top">
          <button class="btn btn-outline-secondary flex-fill" @click="clearAllFilters">
            Clear All
          </button>
          <button class="btn btn-dark flex-fill" @click="closeMobileFilters">
            Apply Filters
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import FilterSection from './FilterSection.vue'

export default {
  name: 'FilterPanel',
  components: { FilterSection },
  props: {
    hideCategories: { type: Boolean, default: false }
  },
  emits: ['filter-change'],
  setup(props, { emit }) {
    const isMobile = ref(false)
    const showMobileFilters = ref(false)

    const filters = ref({
      categories: [],
      seasons: [],
      colors: [],
      events: []
    })

    const filterSections = [
      { key: 'categories', title: 'Item Category', options: ['head', 'top', 'bottom', 'shoe', 'accessory', 'dress'] },
      { key: 'seasons', title: 'Season', options: ['Spring', 'Summer', 'Fall', 'Winter', 'All Season'] },
      { key: 'colors', title: 'Color', options: ['Black', 'White', 'Red', 'Blue', 'Green', 'Yellow', 'Purple', 'Pink', 'Orange', 'Brown', 'Gray', 'Multi'] },
      { key: 'events', title: 'Event', options: ['Casual', 'Formal', 'Work', 'Party', 'Sports', 'Beach', 'Date', 'Travel'] }
    ]

    const visibleFilterSections = computed(() => {
      if (props.hideCategories) {
        return filterSections.filter(section => section.key !== 'categories')
      }
      return filterSections
    })

    const checkMobile = () => { isMobile.value = window.innerWidth < 1024 }
    onMounted(() => { checkMobile(); window.addEventListener('resize', checkMobile) })
    onUnmounted(() => { window.removeEventListener('resize', checkMobile) })

    const activeFilterCount = computed(() =>
      Object.values(filters.value).reduce((total, arr) => total + arr.length, 0)
    )

    const updateFilters = (key, values) => {
      filters.value[key] = values
      emit('filter-change', { ...filters.value })
    }

    const clearAllFilters = () => {
      Object.keys(filters.value).forEach(key => filters.value[key] = [])
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
      filters,
      filterSections,
      visibleFilterSections,
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
  background-color: #f8f9fa; 
  color: #333;             
  font-size: 1.1rem;
  font-weight: 600;
  box-shadow: 0 4px 6px rgba(0,0,0,0.1);
  transition: all 0.2s ease-in-out;
  border: 1px solid #ddd;
}

.mobile-filter-btn:hover {
  background-color: #e9ecef;
  transform: scale(1.03);
}

/* Filter count badge */
.filter-badge {
  width: 1.5rem;
  height: 1.5rem;
  font-size: 0.85rem;
}

/* Desktop panel shift slightly left */
.desktop-filter-panel {
  margin-left: -1rem;
  max-width: 280px;
}

/* Mobile offcanvas bigger for better visibility */
.mobile-offcanvas {
  height: 85vh;
  border-radius: 1.5rem 1.5rem 0 0;
}
</style>