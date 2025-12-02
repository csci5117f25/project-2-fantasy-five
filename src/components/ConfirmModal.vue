<template>
  <Teleport to="body">
    <div 
      v-if="show" 
      class="modal fade show d-block custom-fixed-modal" 
      tabindex="-1" 
      @click="handleCancel"
      style="background: rgba(0,0,0,0.45);"
    >
      <div class="modal-dialog" @click.stop>
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">{{ title }}</h5>
            <button type="button" class="btn-close" @click="handleCancel"></button>
          </div>
          <div class="modal-body">
            <p>{{ message }}</p>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" @click="handleCancel">Cancel</button>
            <button type="button" class="btn btn-danger" @click="handleConfirm">Confirm</button>
          </div>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script>
export default {
  name: 'ConfirmModal',
  props: {
    show: {
      type: Boolean,
      required: true
    },
    message: {
      type: String,
      required: true
    },
    title: {
      type: String,
      default: 'Confirm'
    }
  },
  emits: ['update:show', 'confirm', 'cancel'],
  methods: {
    handleConfirm() {
      this.$emit('update:show', false)
      this.$emit('confirm')
    },
    handleCancel() {
      this.$emit('update:show', false)
      this.$emit('cancel')
    }
  }
}
</script>

<style scoped>
.custom-fixed-modal {
  position: fixed !important;
  inset: 0 !important;
  display: flex !important;
  justify-content: center !important;
  align-items: center !important;
  z-index: 9999 !important;
}

.custom-fixed-modal .modal-dialog {
  margin: 0 !important; 
  max-height: 90vh;
}

.custom-fixed-modal .modal-content {
  max-height: 90vh;
  overflow-y: auto;
}
</style>

