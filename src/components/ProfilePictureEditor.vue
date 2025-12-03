<template>
  <Teleport to="body">
    <div
      v-if="show"
      class="modal fade show d-block custom-fixed-modal"
      tabindex="-1"
      style="background: rgba(0,0,0,0.8);"
    >
      <div class="modal-dialog modal-lg" @click.stop>
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">Edit Profile Picture</h5>
            <button type="button" class="btn-close" @click="cancel"></button>
          </div>
          <div class="modal-body">
            <div
              ref="editorContainer"
              class="position-relative border rounded overflow-hidden mx-auto"
              style="background: #000; min-height: 400px; max-height: 70vh; max-width: 400px; aspect-ratio: 1;"
              @mousedown="startPan"
              @mousemove="pan"
              @mouseup="endPan"
              @mouseleave="endPan"
              @wheel.prevent="handleZoom"
            >
              <img
                ref="editorImage"
                :src="imageUrl"
                alt="Edit"
                :style="{
                  position: 'absolute',
                  left: imagePosition.x + 'px',
                  top: imagePosition.y + 'px',
                  transform: `scale(${imageScale})`,
                  transformOrigin: 'top left',
                  maxWidth: 'none',
                  cursor: isPanning ? 'grabbing' : 'grab'
                }"
                @load="initImageEditor"
                draggable="false"
              >
              <div
                class="position-absolute border border-white border-2"
                :style="{
                  left: cropArea.x + 'px',
                  top: cropArea.y + 'px',
                  width: cropArea.width + 'px',
                  height: cropArea.height + 'px',
                  borderRadius: '50%',
                  pointerEvents: 'none',
                  boxShadow: '0 0 0 9999px rgba(0,0,0,0.5)'
                }"
              ></div>
            </div>
            <div class="mt-3 d-flex justify-content-center gap-2 flex-wrap">
              <button class="btn btn-sm btn-outline-secondary" @click="zoomOut">🔍- Zoom Out</button>
              <button class="btn btn-sm btn-outline-secondary" @click="resetZoom">Reset</button>
              <button class="btn btn-sm btn-outline-secondary" @click="zoomIn">🔍+ Zoom In</button>
            </div>
          </div>
          <div class="modal-footer">
            <button class="btn btn-secondary" @click="cancel">Cancel</button>
            <button class="btn btn-primary" @click="confirm">Confirm</button>
          </div>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup>
import { ref, watch, nextTick } from 'vue'

const props = defineProps({
  show: {
    type: Boolean,
    default: false
  },
  imageUrl: {
    type: String,
    default: null
  }
})

const emit = defineEmits(['update:show', 'confirm', 'cancel'])

// Image editor state
const editorContainer = ref(null)
const editorImage = ref(null)
const imageScale = ref(1)
const imagePosition = ref({ x: 0, y: 0 })
const isPanning = ref(false)
const panStart = ref({ x: 0, y: 0 })
const originalImageSize = ref({ width: 0, height: 0 })
const cropArea = ref({ x: 0, y: 0, width: 400, height: 400 })

// Get image dimensions 
const getEffectiveImageSize = () => {
  return {
    width: originalImageSize.value.width,
    height: originalImageSize.value.height
  }
}

const getVisualBounds = () => {
  const imgWidth = originalImageSize.value.width * imageScale.value
  const imgHeight = originalImageSize.value.height * imageScale.value
  
  return {
    width: imgWidth,
    height: imgHeight,
    offsetX: 0,
    offsetY: 0
  }
}

// Ensure image is scaled enough to fit crop area
const constrainImageScale = () => {
  if (!editorImage.value || !editorContainer.value || !cropArea.value.width) return
  
  const effectiveSize = getEffectiveImageSize()
  const minScaleX = cropArea.value.width / effectiveSize.width
  const minScaleY = cropArea.value.height / effectiveSize.height
  const minScale = Math.max(minScaleX, minScaleY)
  
  if (imageScale.value < minScale) {
    imageScale.value = minScale
  }
  
  const maxScale = 5
  if (imageScale.value > maxScale) {
    imageScale.value = maxScale
  }
}

// Keep circular crop area within image bounds
const constrainImagePosition = () => {
  if (!editorImage.value || !editorContainer.value || !cropArea.value.width) return
  
  constrainImageScale()
  
  // Calculate image bounds
  const imgWidth = originalImageSize.value.width * imageScale.value
  const imgHeight = originalImageSize.value.height * imageScale.value
  
  const imgLeft = imagePosition.value.x
  const imgTop = imagePosition.value.y
  const imgRight = imgLeft + imgWidth
  const imgBottom = imgTop + imgHeight
  
  // Crop area bounds 
  const cropLeft = cropArea.value.x
  const cropRight = cropArea.value.x + cropArea.value.width
  const cropTop = cropArea.value.y
  const cropBottom = cropArea.value.y + cropArea.value.height
  
  // Calculate how much the image needs to move to keep crop area within bounds
  let newX = imagePosition.value.x
  let newY = imagePosition.value.y
  
  // If crop area extends past image left edge, move image right
  if (cropLeft < imgLeft) {
    newX = cropLeft
  }
  // If crop area extends past image right edge, move image left
  else if (cropRight > imgRight) {
    newX = cropRight - imgWidth
  }
  
  // If crop area extends past image top edge, move image down
  if (cropTop < imgTop) {
    newY = cropTop
  }
  // If crop area extends past image bottom edge, move image up
  else if (cropBottom > imgBottom) {
    newY = cropBottom - imgHeight
  }
  
  imagePosition.value = {
    x: newX,
    y: newY
  }
}

// Initialize editor when image loads
const initImageEditor = async () => {
  await nextTick()
  if (!editorImage.value || !editorContainer.value) return
  
  const img = editorImage.value
  originalImageSize.value = { width: img.naturalWidth, height: img.naturalHeight }
  
  // Calculate initial scale to fit container
  const containerRect = editorContainer.value.getBoundingClientRect()
  const effectiveSize = getEffectiveImageSize()
  const containerAspect = containerRect.width / containerRect.height
  const imageAspect = effectiveSize.width / effectiveSize.height
  
  let initialScale
  if (imageAspect > containerAspect) {
    initialScale = containerRect.width / effectiveSize.width
  } else {
    initialScale = containerRect.height / effectiveSize.height
  }
  
  imageScale.value = initialScale
  
  // Set crop area to circular 
  const cropSize = Math.min(containerRect.width, containerRect.height) * 0.8
  
  cropArea.value = {
    x: (containerRect.width - cropSize) / 2,
    y: (containerRect.height - cropSize) / 2,
    width: cropSize,
    height: cropSize
  }
  
  // Center image within crop area
  const effectiveImgSize = getEffectiveImageSize()
  const scaledWidth = effectiveImgSize.width * imageScale.value
  const scaledHeight = effectiveImgSize.height * imageScale.value
  
  imagePosition.value = {
    x: cropArea.value.x + (cropSize - scaledWidth) / 2,
    y: cropArea.value.y + (cropSize - scaledHeight) / 2
  }
  
  constrainImagePosition()
}

const handleZoom = (event) => {
  event.preventDefault()
  const delta = event.deltaY > 0 ? 0.9 : 1.1
  const newScale = imageScale.value * delta
  imageScale.value = newScale
  constrainImagePosition()
}

const zoomIn = () => {
  imageScale.value = imageScale.value * 1.2
  constrainImagePosition()
}

const zoomOut = () => {
  imageScale.value = imageScale.value * 0.8
  constrainImagePosition()
}

const resetZoom = () => {
  if (!editorImage.value || !editorContainer.value) return
  const containerRect = editorContainer.value.getBoundingClientRect()
  const effectiveSize = getEffectiveImageSize()
  const containerAspect = containerRect.width / containerRect.height
  const imageAspect = effectiveSize.width / effectiveSize.height
  
  let initialScale
  if (imageAspect > containerAspect) {
    initialScale = containerRect.width / effectiveSize.width
  } else {
    initialScale = containerRect.height / effectiveSize.height
  }
  
  imageScale.value = initialScale
  const scaledWidth = effectiveSize.width * imageScale.value
  const scaledHeight = effectiveSize.height * imageScale.value
  imagePosition.value = {
    x: (containerRect.width - scaledWidth) / 2,
    y: (containerRect.height - scaledHeight) / 2
  }
  constrainImagePosition()
}

const startPan = (event) => {
  if (event.button !== 0) return
  isPanning.value = true
  panStart.value = {
    x: event.clientX - imagePosition.value.x,
    y: event.clientY - imagePosition.value.y
  }
}

const pan = (event) => {
  if (!isPanning.value) return
  
  const newX = event.clientX - panStart.value.x
  const newY = event.clientY - panStart.value.y
  
  imagePosition.value = {
    x: newX,
    y: newY
  }
  
  constrainImagePosition()
}

const endPan = () => {
  isPanning.value = false
}

// Crop and export the image based on the circular crop area
const confirm = () => {
  if (!editorImage.value || !editorContainer.value) return
  
  const img = editorImage.value
  
  // Calculate source region from crop area 
  const sourceWidth = cropArea.value.width / imageScale.value
  const sourceHeight = sourceWidth 
  
  const sourceX = (cropArea.value.x - imagePosition.value.x) / imageScale.value
  const sourceY = (cropArea.value.y - imagePosition.value.y) / imageScale.value
  
  // Clamp to image bounds
  if (sourceX < 0) sourceX = 0
  if (sourceY < 0) sourceY = 0
  if (sourceX + sourceWidth > originalImageSize.value.width) {
    sourceX = originalImageSize.value.width - sourceWidth
  }
  if (sourceY + sourceHeight > originalImageSize.value.height) {
    sourceY = originalImageSize.value.height - sourceHeight
  }
  
  // Final bounds check
  const finalSourceX = Math.max(0, Math.min(sourceX, originalImageSize.value.width - sourceWidth))
  const finalSourceY = Math.max(0, Math.min(sourceY, originalImageSize.value.height - sourceHeight))
  const finalSourceWidth = sourceWidth
  const finalSourceHeight = sourceHeight
  
  // Circular profile picture
  const outputSize = 800
  const canvas = document.createElement('canvas')
  canvas.width = outputSize
  canvas.height = outputSize
  const ctx = canvas.getContext('2d')
  
  // Draw cropped region to square canvas
  ctx.drawImage(
    img,
    finalSourceX,
    finalSourceY,
    finalSourceWidth,
    finalSourceHeight,
    0,
    0,
    outputSize,
    outputSize
  )
  
  // Apply circular mask
  ctx.globalCompositeOperation = 'destination-in'
  ctx.beginPath()
  ctx.arc(outputSize / 2, outputSize / 2, outputSize / 2, 0, Math.PI * 2)
  ctx.fill()
  
  canvas.toBlob((blob) => {
    if (blob) {
      emit('confirm', blob)
    }
    emit('update:show', false)
  }, 'image/png', 1.0)
}

const cancel = () => {
  emit('update:show', false)
  emit('cancel')
}

watch(() => props.imageUrl, (newUrl) => {
  if (newUrl && props.show) {
    nextTick(() => {
      if (editorImage.value && editorImage.value.complete) {
        initImageEditor()
      }
    })
  }
})
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

