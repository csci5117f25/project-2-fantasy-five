<!-- components/FilterSection.vue -->
<template>
  <div class="filter-section">
    <div class="section-header" @click="toggleExpanded">
      <h4>{{ title }}</h4>
      <span class="expand-icon">{{ isExpanded ? '−' : '+' }}</span>
    </div>
    
    <div v-if="isExpanded" class="section-content">
      <div class="checkbox-group">
        <label 
          v-for="option in options" 
          :key="option"
          class="checkbox-label"
        >
          <input 
            type="checkbox" 
            :value="option"
            :checked="selectedValues.includes(option)"
            @change="handleCheckboxChange(option, $event.target.checked)"
          >
          <span class="checkmark"></span>
          {{ option }}
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
    title: {
      type: String,
      required: true
    },
    options: {
      type: Array,
      required: true
    },
    selectedValues: {
      type: Array,
      default: () => []
    }
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

    // Watch for external changes to selectedValues
    watch(() => props.selectedValues, (newValues) => {
      localSelected.value = [...newValues]
    })

    return {
      isExpanded,
      toggleExpanded,
      handleCheckboxChange
    }
  }
}
</script>

<style scoped>
.filter-section {
  margin-bottom: 1.5rem;
  border: 1px solid #f0f0f0;
  border-radius: 8px;
  overflow: hidden;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  background: #f8f8f8;
  cursor: pointer;
  transition: background 0.3s ease;
}

.section-header:hover {
  background: #f0f0f0;
}

.section-header h4 {
  margin: 0;
  font-size: 0.9rem;
  font-weight: 600;
  color: #333;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.expand-icon {
  font-size: 1.1rem;
  font-weight: bold;
  color: #666;
}

.section-content {
  padding: 1rem;
  background: white;
}

.checkbox-group {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.checkbox-label {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  cursor: pointer;
  font-size: 0.9rem;
  color: #666;
  position: relative;
  padding-left: 2rem;
}

.checkbox-label input {
  position: absolute;
  opacity: 0;
  cursor: pointer;
}

.checkmark {
  position: absolute;
  left: 0;
  top: 0;
  height: 1.25rem;
  width: 1.25rem;
  background-color: #f8f8f8;
  border: 2px solid #e0e0e0;
  border-radius: 4px;
  transition: all 0.3s ease;
}

.checkbox-label:hover input ~ .checkmark {
  border-color: #667eea;
}

.checkbox-label input:checked ~ .checkmark {
  background-color: #667eea;
  border-color: #667eea;
}

.checkmark:after {
  content: "";
  position: absolute;
  display: none;
  left: 6px;
  top: 2px;
  width: 4px;
  height: 8px;
  border: solid white;
  border-width: 0 2px 2px 0;
  transform: rotate(45deg);
}

.checkbox-label input:checked ~ .checkmark:after {
  display: block;
}
</style>