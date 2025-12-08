<script setup>   
    import 'vue3-carousel/carousel.css'
    import { Carousel, Slide, Navigation } from 'vue3-carousel';
    import { db, storage } from '@/firebase';
    import { useCollection, useCurrentUser } from 'vuefire';
    import { collection, query, addDoc, doc, serverTimestamp, where, or } from 'firebase/firestore';
    import { ref, computed, onMounted, onUnmounted } from 'vue';
    import { ref as storageRef, uploadString, getDownloadURL } from 'firebase/storage';
    import AlertModal from '@/components/AlertModal.vue';
   
    const user = useCurrentUser()
    const extra = ref(0) 
    const currentTop = computed(() => tops.value?.[randomTop.value])
    const isTop = computed(() => currentTop.value?.category === 'top')
    const isMobile = ref(false)
    const randomTop = ref(0)
    const randomBottom = ref(0)
    const randomShoe = ref(0)
    const randomHat = ref(0)
    const randomAccessories = ref([])
    const accessoryIdx = ref([])
    const addHeadware = ref(false)
    const showAlert = ref(false)
    const alertMessage = ref('')
    const isEnoughItems = computed(() => (tops.value.length > 1 && bottoms.value.length > 1 && shoes.value.length > 1))
    const saving = ref(false)
    

    const showAlertModal = (message) => {
        alertMessage.value = message
        showAlert.value = true
    }

    const checkMobile = () => { isMobile.value = window.innerWidth < 1024 }
    onMounted(() => { 
        checkMobile(); 
        window.addEventListener('resize', checkMobile);
    })
    onUnmounted(() => { window.removeEventListener('resize', checkMobile) })

    const config = {
        height: 200,
        itemsToShow: 1,
        wrapAround: true
    }

    const headware = useCollection(() => {
        if(!user.value) return null
        return query(collection(doc(db, 'users', user.value.uid), 'clothingItems'), 
                    where('category', '==', 'head'))
    })

    const tops = useCollection(() => {
        if(!user.value) return null
        return query(collection(doc(db, 'users', user.value.uid), 'clothingItems'), 
                    or(
                        where('category', '==', 'top'),
                        where('category', '==', 'dress')
                    ))
    })

    const bottoms = useCollection(() => {
        if(!user.value) return null
        return query(collection(doc(db, 'users', user.value.uid), 'clothingItems'), 
                    where('category', '==', 'bottom'))
    })

    const shoes = useCollection(() => {
        if(!user.value) return null
        return query(collection(doc(db, 'users', user.value.uid), 'clothingItems'), 
                    where('category', '==', 'shoe'))
    })

    const accessories = useCollection(() => {
        if(!user.value) return null
        return query(collection(doc(db, 'users', user.value.uid), 'clothingItems'), 
                    where('category', '==', 'accessory'))
    })

    const carousels = ref([
        { items: tops, model: randomTop, condition: true },
        { items: bottoms, model: randomBottom, condition: isTop },
        { items: shoes, model: randomShoe, condition: true }])

    const randomize = () => {
        if(tops.value?.length) {
            randomTop.value = Math.floor(Math.random() * tops.value.length)
        }
        if(bottoms.value?.length) {
            randomBottom.value = Math.floor(Math.random() * bottoms.value.length)
        }
        if(shoes.value?.length) {
            randomShoe.value = Math.floor(Math.random() * shoes.value.length)
        }
        if(headware.value?.length) {
            randomHat.value = Math.floor(Math.random() * headware.value.length)
        }

        randomAccessories.value = []
        if(accessories.value?.length) {
            for(let i = 0; i < extra.value; i++)
            {
                randomAccessories.value.push(Math.floor(Math.random() * accessories.value.length))
            }
        }
    }

    function chunkIntoGroupsOfFour(items) {
        const groups = [];
        for (let i = 0; i < items.length; i += 4) {
            groups.push(items.slice(0 + i, i + 4));
        }
        return groups;
    }

    function getCurrentOutfitDetails() {
        const outfitDetails = []

        if(tops.value?.length) outfitDetails.push({
            id: tops.value[randomTop.value]?.id,
            name: tops.value[randomTop.value]?.name || 'Top',
            category: tops.value[randomTop.value]?.category || 'top',
            imageUrl: tops.value[randomTop.value]?.imageUrl || '',
            colors: tops.value[randomTop.value]?.colors || []
        })
        
        if(bottoms.value?.length && isTop.value) outfitDetails.push({
            id: bottoms.value[randomBottom.value]?.id,
            name: bottoms.value[randomBottom.value]?.name || 'Bottom',
            category: bottoms.value[randomBottom.value]?.category || 'bottom',
            imageUrl: bottoms.value[randomBottom.value]?.imageUrl || '',
            colors: bottoms.value[randomBottom.value]?.colors || []
        })
        
        if(shoes.value?.length) outfitDetails.push({
            id: shoes.value[randomShoe.value]?.id,
            name: shoes.value[randomShoe.value]?.name || 'Shoes',
            category: shoes.value[randomShoe.value]?.category || 'shoe',
            imageUrl: shoes.value[randomShoe.value]?.imageUrl || '',
            colors: shoes.value[randomShoe.value]?.colors || []
        })
        
        if(headware.value?.length && addHeadware.value) outfitDetails.push({
            id: headware.value[randomHat.value]?.id,
            name: headware.value[randomHat.value]?.name || 'Headwear',
            category: headware.value[randomHat.value]?.category || 'head',
            imageUrl: headware.value[randomHat.value]?.imageUrl || '',
            colors: headware.value[randomHat.value]?.colors || []
        })
        
        if(extra.value > 0 && accessories.value?.length) {
            for(let i = 0; i < extra.value; i++) {
                const idx = randomAccessories.value[i]
                if(idx != undefined && accessories.value[idx]) {
                    outfitDetails.push({
                        id: accessories.value[idx]?.id,
                        name: accessories.value[idx]?.name || 'Accessory',
                        category: accessories.value[idx]?.category || 'accessory',
                        imageUrl: accessories.value[idx]?.imageUrl || '',
                        colors: accessories.value[idx]?.colors || []
                    })
                }
            }
        }

        return outfitDetails
    }

    async function loadImage(url) {
        return new Promise((resolve, reject) => {
            const img = new Image()
            img.crossOrigin = 'anonymous'
            img.onload = () => resolve(img)
            img.onerror = () => reject(new Error(`Failed to load image: ${url}`))
            img.src = url
        })
    }

    function drawImageFill(ctx, img, dx, dy, dWidth, dHeight, anchorLeft = false, anchorTop = false) {
        const iw = img.width
        const ih = img.height
        const imgAspect = iw / ih
        const cellAspect = dWidth / dHeight
        
        let sw, sh, sx, sy
        
        if (imgAspect > cellAspect) {
            sw = dWidth
            sh = dWidth / imgAspect
            sx = dx
            if (anchorTop) {
                sy = dy
            } else {
                sy = dy + dHeight - sh
            }
        } else {
            sh = dHeight
            sw = dHeight * imgAspect
            if (anchorLeft) {
                sx = dx
            } else {
                sx = dx + dWidth - sw
            }
            sy = dy
        }
        
        ctx.drawImage(img, 0, 0, iw, ih, sx, sy, sw, sh)
    }

    async function generateTightCollageFromUrls(urls = [], width = 800, height = 1000) {
        const imagesToUse = urls.slice(0, 4)
        if (imagesToUse.length === 0) return null

        try {
            const canvas = document.createElement('canvas')
            canvas.width = width
            canvas.height = height
            const ctx = canvas.getContext('2d')
            ctx.fillStyle = '#ffffff'
            ctx.fillRect(0, 0, width, height)

            const imgs = await Promise.all(imagesToUse.map(u => loadImage(u).catch(() => null))).then(results => results.filter(Boolean))
            
            if (imgs.length === 0) return null

            const halfWidth = width / 2
            const halfHeight = height / 2

            if (imgs.length === 1) {
                drawImageFill(ctx, imgs[0], 0, 0, width, height, true, true)
            } else if (imgs.length === 2) {
                drawImageFill(ctx, imgs[0], 0, 0, halfWidth, height, true, true)
                drawImageFill(ctx, imgs[1], halfWidth, 0, halfWidth, height, false, true)
            } else if (imgs.length === 3) {
                drawImageFill(ctx, imgs[0], 0, 0, halfWidth, halfHeight, true, true)
                drawImageFill(ctx, imgs[1], halfWidth, 0, halfWidth, halfHeight, false, true)
                drawImageFill(ctx, imgs[2], 0, halfHeight, width, halfHeight, true, false)
            } else {
                drawImageFill(ctx, imgs[0], 0, 0, halfWidth, halfHeight, true, true)
                drawImageFill(ctx, imgs[1], halfWidth, 0, halfWidth, halfHeight, false, true)
                drawImageFill(ctx, imgs[2], 0, halfHeight, halfWidth, halfHeight, true, false)
                drawImageFill(ctx, imgs[3], halfWidth, halfHeight, halfWidth, halfHeight, false, false)
            }

            return canvas.toDataURL('image/png')
        } catch (error) {
            console.error('Error generating tight collage:', error)
            return null
        }
    }

    async function generateCollagesForAllItems(selectedItems) {
        const groups = chunkIntoGroupsOfFour(selectedItems);
        const collagePromises = groups.map(group => {
            const urls = group.map(item => item.imageUrl).filter(Boolean);
            if (urls.length === 0) return Promise.resolve(null);
            return generateTightCollageFromUrls(urls, 1200, 1500);
        });
        return await Promise.all(collagePromises);
    }

    const saveOutfit = async () => {
        if (!user.value) {
            showAlertModal("You must be logged in.")
            return
        }

        saving.value = true

        try {
            const outfitDetails = getCurrentOutfitDetails()

            if (outfitDetails.length === 0) {
                showAlertModal("No items selected to save.")
                saving.value = false
                return
            }

            const imageUrls = outfitDetails.map(item => item.imageUrl).filter(Boolean)
            let uploadedCollages = []
            let mainImageUrl = ''

            if (imageUrls.length >= 4) {
                const collageDataUrls = await generateCollagesForAllItems(outfitDetails)
                const validCollages = collageDataUrls.filter(Boolean)

                for (let i = 0; i < validCollages.length; i++) {
                    const dataUrl = validCollages[i]
                    const fileName = `${Date.now()}-collage-${i}.png`
                    const storagePath = `users/${user.value.uid}/outfits/${fileName}`
                    const fRef = storageRef(storage, storagePath)
                    await uploadString(fRef, dataUrl, 'data_url')
                    const url = await getDownloadURL(fRef)
                    uploadedCollages.push(url)

                    if (i === 0 && !mainImageUrl) mainImageUrl = url
                }
            } else if (imageUrls.length > 0) {
                const singleCollageDataUrl = await generateTightCollageFromUrls(imageUrls, 1200, 1500)
                if (singleCollageDataUrl) {
                    const fileName = `${Date.now()}-collage-0.png`
                    const storagePath = `users/${user.value.uid}/outfits/${fileName}`
                    const fRef = storageRef(storage, storagePath)
                    await uploadString(fRef, singleCollageDataUrl, 'data_url')
                    const url = await getDownloadURL(fRef)
                    uploadedCollages.push(url)
                    mainImageUrl = url
                } else {
                    mainImageUrl = imageUrls[0]
                }
            }

            const outfitsRef = collection(doc(db, 'users', user.value.uid), 'outfits')
            await addDoc(outfitsRef, {
                name: 'New Outfit',
                description: '',
                itemDetails: outfitDetails.map(item => ({
                    id: item.id,
                    name: item.name || '',
                    category: item.category,
                    imageUrl: item.imageUrl || '',
                    colors: item.colors || []
                })),
                imageUrl: mainImageUrl || '',
                collages: uploadedCollages,
                createdAt: serverTimestamp(),
            })

            showAlertModal("Outfit saved successfully!")

        } catch (err) {
            console.error("Error Saving Outfit:", err)
            showAlertModal("Failed to save outfit")
        } finally {
            saving.value = false
        }
    }

    const toggleHead = () => {
        if (headware.value.length === 0) {
            showAlertModal("Add a headware item to your clothing to use Add Headware feature")
        }
        else {
            addHeadware.value = !addHeadware.value
        }
    }

    const removeAddOn = (index) => {
        if (extra.value > 0) {
            extra.value--
            accessoryIdx.value.splice(index, 1)
            randomAccessories.value.splice(index, 1)
        }
    }

    const addAddOn = () => {
        if (accessories.value.length === 0) {
            showAlertModal("Add an accessory to your clothing to use Add On feature")
        }
        else {
            extra.value++
            randomAccessories.value.push(0)
            accessoryIdx.value.push(Math.random().toString(36).substring(2, 10))
        }
    }
</script>

<template>
  <div
    v-if="isEnoughItems"
    class="container-fluid p-4 d-flex flex-column align-items-center bg-body min-vh-100"
  >
    <!-- ACTION BUTTONS mobile -->
    <div class="action-buttons d-flex flex-column gap-2 mb-3" v-if="isMobile">
      <button class="btn btn-lg btn-dark" @click="randomize">🌀 Random</button>
      <button class="btn btn-lg btn-success" @click="addAddOn">✨ Add On</button>
      <button class="btn btn-lg btn-success" v-show="addHeadware === false" @click="toggleHead">
        🎩 Add Headware
      </button>
      <button class="btn btn-lg btn-primary" @click="saveOutfit">Save</button>
    </div>

    <div
      class="carousel-layout d-flex flex-column flex-lg-row align-items-center justify-content-center gap-4 w-100"
    >
      <div class="main-carousel-column d-flex flex-column align-items-center gap-3">
        <!-- HEADWEAR -->
        <div
          v-if="addHeadware"
          class="carousel-wrapper"
          style="margin-bottom: 15px; position: relative; max-width: 320px;"
        >
          <div class="remove-btn" @click="toggleHead">
            <span class="remove-x">×</span>
          </div>

          <Carousel v-bind="config" class="carousel-outline" v-model="randomHat">
            <Slide v-for="image in headware" :key="image.id">
              <div class="image-container">
                <img :src="image.imageUrl" class="carousel-img" />
              </div>
            </Slide>
            <template #addons>
              <Navigation class="carousel-nav" />
            </template>
          </Carousel>
        </div>

        <!-- MAIN CAROUSELS -->
        <div class="main-carousel-wrapper d-flex flex-column align-items-center gap-3">
          <div
            v-for="(carouselData, index) in carousels"
            :key="index"
            v-show="carouselData.condition"
            class="carousel-wrapper"
          >
            <Carousel v-bind="config" class="carousel-outline" v-model="carouselData.model">
              <Slide v-for="image in carouselData.items" :key="image.id">
                <div class="image-container">
                  <img :src="image.imageUrl" class="carousel-img" />
                </div>
              </Slide>
              <template #addons>
                <Navigation class="carousel-nav" />
              </template>
            </Carousel>
          </div>
        </div>
      </div>
      
      <!-- ACCESSORIES -->
      <div
        class="accessories-wrapper d-flex flex-wrap justify-content-start gap-3 mt-3 mt-lg-0"
        v-if="extra > 0"
      >
        <div
          v-for="(id, index) in accessoryIdx"
          :key="id"
          class="carousel-container accessory-item"
        >
          <div class="remove-btn" @click="removeAddOn(index)">
            <span class="remove-x">×</span>
          </div>
          <Carousel v-bind="config" class="carousel-outline" v-model="randomAccessories[index]">
            <Slide v-for="image in accessories" :key="image.id">
              <div class="image-container">
                <img :src="image.imageUrl" class="carousel-img" />
              </div>
            </Slide>
            <template #addons>
              <Navigation class="carousel-nav" />
            </template>
          </Carousel>
        </div>
      </div>
    </div>

    <!-- DESKTOP BUTTONS -->
    <div class="action-buttons d-flex flex-column gap-2 desktop-buttons" v-if="!isMobile">
      <button class="btn btn-lg btn-dark" @click="randomize">🌀 Random</button>
      <button class="btn btn-lg btn-success" @click="addAddOn">✨ Add On</button>
      <button class="btn btn-lg btn-success" v-show="addHeadware === false" @click="toggleHead">
        🎩 Add Headware
      </button>
      <button class="btn btn-lg btn-primary" @click="saveOutfit">Save</button>
    </div>
  </div>

  <div
    v-else
    class="container-fluid p-4 d-flex flex-column align-items-center bg-body min-vh-100"
  >
    <div class="action-buttons d-flex flex-column gap-2 mb-3" v-if="isMobile">
      <button class="btn btn-lg btn-dark" disabled>🌀 Random</button>
      <button class="btn btn-lg btn-success" disabled>✨ Add On</button>
      <button class="btn btn-lg btn-success" disabled>🎩 Add Headware</button>
      <button class="btn btn-lg btn-primary" disabled>Save</button>
    </div>

    <div
      class="carousel-layout d-flex flex-column flex-lg-row align-items-center justify-content-center gap-4 w-100"
    >
      <div class="main-carousel-column d-flex flex-column align-items-center gap-3 text-center">
        <div class="fs-1 opacity-50 mb-3">👕</div>
        <h3 class="text-body">No clothing items yet</h3>
        <p class="text-muted">
          Navigate to Clothing and add at least two tops or dresses, bottoms, and shoes to use Try On!
        </p>
      </div>
    </div>
    
    <div class="action-buttons d-flex flex-column gap-2 desktop-buttons" v-if="!isMobile">
      <button class="btn btn-lg btn-dark" disabled>🌀 Random</button>
      <button class="btn btn-lg btn-success" disabled>✨ Add On</button>
      <button class="btn btn-lg btn-success" disabled>🎩 Add Headware</button>
      <button class="btn btn-lg btn-primary" disabled>Save</button>
    </div>
  </div>

  <!-- Alert Modal -->
  <AlertModal v-model:show="showAlert" :message="alertMessage" />
</template>

<style scoped>
.carousel-layout {
  width: 100%;
  gap: 20px;
  display: flex;
  flex-direction: row;
  align-items: flex-start;
}

.main-carousel-wrapper {
  display: flex;
  flex-direction: column;
  gap: 15px;
  align-items: center;
  flex: 0 0 auto;        
  min-width: 320px;   
  max-width: 320px; 
}

.carousel-wrapper,
.carousel-container {
  width: 100%;
  max-width: 320px;
  border: 2px solid var(--bs-border-color);
  border-radius: 10px;
  padding: 5px;
  box-shadow: 0 2px 6px rgba(0,0,0,0.15);
  position: relative;
  background-color: var(--bs-body-bg);
}

.image-container {
  width: 100%;
  height: 200px;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}

.carousel-img {
  max-width: 100%;
  max-height: 100%;
  width: auto;
  height: auto;
  object-fit: contain;
}

.carousel-nav button {
  font-size: 1.6rem;
  width: 45px;
  height: 45px;
  border-radius: 50%;
  background-color: rgba(0,0,0,0.6);
  color: #fff;
  top: 50%;
  transform: translateY(-50%);
  z-index: 10;
}

.carousel-nav.prev {
  left: -55px;
}

.carousel-nav.next {
  right: -55px;
}

.carousel-nav button:hover {
  background-color: rgba(0,0,0,0.85);
}

.action-buttons button {
  font-weight: 600;
  width: 100%;
  font-size: 1.1rem;
  box-shadow: 0 4px 6px rgba(0,0,0,0.1);
  transition: all 0.2s ease-in-out;
  border-color: var(--bs-border-color);
}

.action-buttons button:hover {
  transform: scale(1.03);
}

.desktop-buttons {
  position: fixed;
  bottom: 20px;
  right: 20px;
  max-width: 200px;
}

.remove-btn {
  position: absolute;
  top: -10px;
  right: -10px;
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background-color: var(--bs-danger);
  color: var(--bs-body-bg);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  z-index: 20;
  box-shadow: 0 2px 4px rgba(0,0,0,0.2);
  font-weight: bold;
  font-size: 1.2rem;
  line-height: 1;
}

.remove-btn:hover {
  background-color: var(--bs-danger-border-subtle);
  transform: scale(1.1);
}

.remove-x {
  display: block;
  margin-top: -2px;
}

@media (max-width: 1024px) {
  .carousel-layout {
    flex-direction: column; 
    align-items: center;
  }

  .main-carousel-wrapper {
    gap: 10px;
    align-items: center;
  }

  .accessories-wrapper {
    margin-top: 20px;
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    gap: 15px;
  }

  .action-buttons {
    position: sticky;
    top: 0;
    left: 0;
    width: 100%;
    z-index: 20;
    padding: 10px 0;
    align-items: center;
  }
  
  .accessory-item {
    max-width: 200px;
    margin: 0 auto;  
  }
}

.accessories-wrapper {
  display: flex;
  flex-wrap: wrap;
  justify-content: flex-start; 
  gap: 15px;
}

.accessory-item {
  position: relative;
  max-width: 200px; 
  flex: 0 0 auto;  
}
</style>