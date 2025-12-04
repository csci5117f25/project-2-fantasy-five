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
            <h5 class="modal-title">Edit Image</h5>
            <button type="button" class="btn-close" @click="cancel"></button>
          </div>
          <div class="modal-body">
            <div
              ref="editorContainer"
              class="position-relative border rounded overflow-hidden mx-auto"
              style="background: #000; min-height: 400px; max-height: 70vh; max-width: 800px;"
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
                  transform: `scale(${imageScale}) rotate(${rotation}deg)`,
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
                  pointerEvents: 'none',
                  boxShadow: '0 0 0 9999px rgba(0,0,0,0.5)'
                }"
              ></div>
            </div>
            <div class="mt-3 d-flex justify-content-center gap-2 flex-wrap">
              <button class="btn btn-sm btn-outline-secondary" @click="rotateLeft">↺ Rotate Left</button>
              <button class="btn btn-sm btn-outline-secondary" @click="rotateRight">↻ Rotate Right</button>
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
const cropArea = ref({ x: 0, y: 0, width: 800, height: 1000 })
const rotation = ref(0)

// Get image dimensions accounting for rotation 
const getEffectiveImageSize = () => {
  const isRotated = rotation.value === 90 || rotation.value === 270
  return {
    width: isRotated ? originalImageSize.value.height : originalImageSize.value.width,
    height: isRotated ? originalImageSize.value.width : originalImageSize.value.height
  }
}

const getVisualBounds = () => {
  const imgWidth = originalImageSize.value.width * imageScale.value
  const imgHeight = originalImageSize.value.height * imageScale.value
  const rad = (rotation.value * Math.PI) / 180
  
  const cos = Math.abs(Math.cos(rad))
  const sin = Math.abs(Math.sin(rad))
  const boundingWidth = imgWidth * cos + imgHeight * sin
  const boundingHeight = imgWidth * sin + imgHeight * cos
  
  let offsetX = 0
  let offsetY = 0
  
  if (rotation.value === 90) {
    offsetX = -imgHeight
  } else if (rotation.value === 180) {
    offsetX = -imgWidth
    offsetY = -imgHeight
  } else if (rotation.value === 270) {
    offsetY = -imgWidth
  }
  
  return {
    width: boundingWidth,
    height: boundingHeight,
    offsetX,
    offsetY
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

// Keep crop area within rotated image bounds
const constrainImagePosition = () => {
  if (!editorImage.value || !editorContainer.value || !cropArea.value.width) return
  
  constrainImageScale()
  
  // Calculate bounding box of rotated image
  const imgWidth = originalImageSize.value.width * imageScale.value
  const imgHeight = originalImageSize.value.height * imageScale.value
  const rad = (rotation.value * Math.PI) / 180
  const cos = Math.abs(Math.cos(rad))
  const sin = Math.abs(Math.sin(rad))
  const boundingWidth = imgWidth * cos + imgHeight * sin
  const boundingHeight = imgWidth * sin + imgHeight * cos
  
  // Find top left corner of bounding box
  let minX = imagePosition.value.x
  let minY = imagePosition.value.y
  
  if (rotation.value === 90) {
    minX = imagePosition.value.x - imgHeight
  } else if (rotation.value === 180) {
    minX = imagePosition.value.x - imgWidth
    minY = imagePosition.value.y - imgHeight
  } else if (rotation.value === 270) {
    minY = imagePosition.value.y - imgWidth
  }
  
  const maxX = minX + boundingWidth
  const maxY = minY + boundingHeight
  
  // Constrain to keep crop area within bounds
  const cropLeft = cropArea.value.x
  const cropRight = cropArea.value.x + cropArea.value.width
  const cropTop = cropArea.value.y
  const cropBottom = cropArea.value.y + cropArea.value.height
  
  let constrainedMinX = minX
  let constrainedMinY = minY
  
  if (cropLeft < constrainedMinX) {
    constrainedMinX = cropLeft
  } else if (cropRight > maxX) {
    constrainedMinX = cropRight - boundingWidth
  }
  
  if (cropTop < constrainedMinY) {
    constrainedMinY = cropTop
  } else if (cropBottom > maxY) {
    constrainedMinY = cropBottom - boundingHeight
  }
  
  // Convert back to image position
  let newX = constrainedMinX
  let newY = constrainedMinY
  
  if (rotation.value === 90) {
    newX = constrainedMinX + imgHeight
  } else if (rotation.value === 180) {
    newX = constrainedMinX + imgWidth
    newY = constrainedMinY + imgHeight
  } else if (rotation.value === 270) {
    newY = constrainedMinY + imgWidth
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
  rotation.value = 0
  
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
  
  // Set crop area to exactly 800x1000 aspect ratio
  const targetAspect = 800 / 1000
  let cropWidth, cropHeight
  
  // Calculate crop size to fit container while maintaining exact aspect ratio
  const maxWidth = containerRect.width * 0.8
  const maxHeight = containerRect.height * 0.8
  
  if (maxWidth / maxHeight > targetAspect) {
    // Container is wider, fit to height
    cropHeight = maxHeight
    cropWidth = cropHeight * targetAspect
  } else {
    // Container is taller, fit to width
    cropWidth = maxWidth
    cropHeight = cropWidth / targetAspect
  }
  
  // Ensure exact aspect ratio
  cropHeight = cropWidth / targetAspect
  
  cropArea.value = {
    x: (containerRect.width - cropWidth) / 2,
    y: (containerRect.height - cropHeight) / 2,
    width: cropWidth,
    height: cropHeight
  }
  
  // Center image within crop area
  const effectiveImgSize = getEffectiveImageSize()
  const scaledWidth = effectiveImgSize.width * imageScale.value
  const scaledHeight = effectiveImgSize.height * imageScale.value
  
  imagePosition.value = {
    x: cropArea.value.x + (cropWidth - scaledWidth) / 2,
    y: cropArea.value.y + (cropHeight - scaledHeight) / 2
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

const rotateLeft = () => {
  rotation.value = (rotation.value - 90 + 360) % 360
  constrainImagePosition()
}

const rotateRight = () => {
  rotation.value = (rotation.value + 90) % 360
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

// Crop and export the image based on the crop area
const confirm = () => {
  if (!editorImage.value || !editorContainer.value) return
  
  const img = editorImage.value
  const targetAspect = 800 / 1000
  
  // Calculate source region from crop area
  const sourceWidth = cropArea.value.width / imageScale.value
  const sourceHeight = sourceWidth / targetAspect 
  
  let sourceX, sourceY
  
  // Rotational mapping
  if (rotation.value === 0) {
    sourceX = (cropArea.value.x - imagePosition.value.x) / imageScale.value
    sourceY = (cropArea.value.y - imagePosition.value.y) / imageScale.value
  } else {
    const visualBounds = getVisualBounds()
    
    // Crop area coordinates relative to the visual bounding box
    const cropRelX = cropArea.value.x - imagePosition.value.x - visualBounds.offsetX
    const cropRelY = cropArea.value.y - imagePosition.value.y - visualBounds.offsetY
    
    // Convert to rotated canvas coordinates
    sourceX = cropRelX / imageScale.value
    sourceY = cropRelY / imageScale.value
  }
  
  // Clamp to image bounds while maintaining aspect ratio
  if (sourceX < 0) {
    sourceX = 0
  }
  if (sourceY < 0) {
    sourceY = 0
  }
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
  
  const canvas = document.createElement('canvas')
  canvas.width = 800
  canvas.height = 1000
  const ctx = canvas.getContext('2d')
  
  if (rotation.value === 0) {
    ctx.drawImage(
      img,
      finalSourceX,
      finalSourceY,
      finalSourceWidth,
      finalSourceHeight,
      0,
      0,
      800,
      1000
    )
  } else {
    // rotate the whole image first, then crop from rotated canvas
    const effectiveSize = getEffectiveImageSize()
    const tempCanvas = document.createElement('canvas')
    tempCanvas.width = effectiveSize.width
    tempCanvas.height = effectiveSize.height
    const tempCtx = tempCanvas.getContext('2d')
    
    // Draw rotated image to temp canvas
    tempCtx.save()
    tempCtx.translate(tempCanvas.width / 2, tempCanvas.height / 2)
    tempCtx.rotate((rotation.value * Math.PI) / 180)
    tempCtx.translate(-originalImageSize.value.width / 2, -originalImageSize.value.height / 2)
    tempCtx.drawImage(img, 0, 0, originalImageSize.value.width, originalImageSize.value.height)
    tempCtx.restore()
    
    // Calculate crop area in rotated canvas coordinates
    const visualBounds = getVisualBounds()
    const cropRelX = cropArea.value.x - imagePosition.value.x - visualBounds.offsetX
    const cropRelY = cropArea.value.y - imagePosition.value.y - visualBounds.offsetY
    
    // Convert to rotated canvas coordinates
    const rotatedCropX = cropRelX / imageScale.value
    const rotatedCropY = cropRelY / imageScale.value
    const rotatedCropWidth = cropArea.value.width / imageScale.value
    const rotatedCropHeight = rotatedCropWidth / targetAspect 
    
    // Clamp to rotated canvas bounds
    const clampedX = Math.max(0, Math.min(rotatedCropX, tempCanvas.width - rotatedCropWidth))
    const clampedY = Math.max(0, Math.min(rotatedCropY, tempCanvas.height - rotatedCropHeight))
    
    // Draw cropped region to output canvas
    ctx.drawImage(
      tempCanvas,
      clampedX,
      clampedY,
      rotatedCropWidth,
      rotatedCropHeight,
      0,
      0,
      800,
      1000
    )
  }
  
  canvas.toBlob((blob) => {
    if (blob) {
      emit('confirm', blob)
    }
    emit('update:show', false)
  }, 'image/jpeg', 0.9)
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

