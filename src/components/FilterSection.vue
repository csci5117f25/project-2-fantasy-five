<template>
  <div class="filter-section mb-3 border rounded">
    <!-- Header -->
    <div
      class="section-header d-flex justify-content-between align-items-center p-3 bg-light"
      @click="toggleExpanded"
      style="cursor: pointer;"
    >
      <h4 class="m-0 text-uppercase small fw-semibold">{{ title }}</h4>
      <span class="expand-icon fs-5 fw-bold text-secondary">{{ isExpanded ? '−' : '+' }}</span>
    </div>

    <!-- Collapsible Content -->
    <div v-if="isExpanded" class="section-content p-3 bg-white">
      <div class="form-check" v-for="option in options" :key="option">
        <input
          class="form-check-input"
          type="checkbox"
          :id="optionId(option)"
          :value="option"
          :checked="selectedValues.includes(option)"
          @change="handleCheckboxChange(option, $event.target.checked)"
        />
        <label class="form-check-label" :for="optionId(option)">
          {{ getDisplayLabel(option) }}
        </label>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, watch } from 'vue'

export default {
  name: 'FilterSection',
  props: {
    title: { type: String, required: true },
    options: { type: Array, required: true },
    selectedValues: { type: Array, default: () => [] }
  },
  emits: ['update'],
  setup(props, { emit }) {
    const isExpanded = ref(true)
    const localSelected = ref([...props.selectedValues])

    const toggleExpanded = () => {
      isExpanded.value = !isExpanded.value
    }

    const handleCheckboxChange = (option, isChecked) => {
      if (isChecked) {
        localSelected.value.push(option)
      } else {
        localSelected.value = localSelected.value.filter(item => item !== option)
      }
      emit('update', [...localSelected.value])
    }

    const optionId = (option) => `filter-${option.replace(/\s+/g, '-')}`

    const getDisplayLabel = (option) => {
      const categoryLabels = {
        'head': 'Headwear',
        'top': 'Top',
        'bottom': 'Bottom',
        'shoe': 'Shoes',
        'accessory': 'Accessory'
      }
      return categoryLabels[option] || option
    }

    watch(() => props.selectedValues, (newValues) => {
      localSelected.value = [...newValues]
    })

    return {
      isExpanded,
      toggleExpanded,
      handleCheckboxChange,
      optionId,
      getDisplayLabel
    }
  }
}
</script>

<style scoped>
.expand-icon {
  user-select: none;
}
</style>