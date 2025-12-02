<script setup>   
    import 'vue3-carousel/carousel.css'
    import { Carousel, Slide, Navigation } from 'vue3-carousel';
    import { db, storage } from '@/firebase';
    import { useCollection, useCurrentUser } from 'vuefire';
    import { collection, query, addDoc, doc, serverTimestamp, where, or } from 'firebase/firestore';
    import { ref, computed, onMounted, onUnmounted } from 'vue';
    import { ref as storageRef, uploadString, getDownloadURL } from 'firebase/storage';
    import AlertModal from '@/components/AlertModal.vue';
    // import FilterPanel from '@/components/FilterPanel.vue';
   
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
    
    const showAlertModal = (message) => {
        alertMessage.value = message
        showAlert.value = true
    }

    const checkMobile = () => { isMobile.value = window.innerWidth < 1024 }
    onMounted(() => { checkMobile(); window.addEventListener('resize', checkMobile) })
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
        // { items: headware, model: randomHat, condition: addHeadware},
        { items: tops, model: randomTop, condition: true },
        { items: bottoms, model: randomBottom, condition: isTop },
        { items: shoes, model: randomShoe, condition: true }])

    // const getClothing = useCollection(() => {
    //     if(!user.value) return null
    //     return collection(doc(db, 'users', user.value.uid), 'clothingItems')
    // })

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

    async function loadImage(url) {
        return new Promise((resolve, reject) => {
            const img = new Image()
            img.crossOrigin = 'anonymous'
            img.onload = () => resolve(img)
            img.onerror = () => reject(new Error(`Failed to load image: ${url}`))
            img.src = url
        })
    }

    function drawImageContain(ctx, img, dx, dy, dWidth, dHeight) {
        const iw = img.width
        const ih = img.height
        const scale = Math.min(dWidth / iw, dHeight / ih)
        const sw = iw * scale
        const sh = ih * scale
        const sx = dx + (dWidth - sw) / 2
        const sy = dy + (dHeight - sh) / 2
        ctx.drawImage(img, 0, 0, iw, ih, sx, sy, sw, sh)
    }

    async function generateCollageFromUrls(urls = [], size = 800) {
        const imagesToUse = urls.slice(0, 4)
        if (imagesToUse.length === 0) return null

        const canvas = document.createElement('canvas')
        canvas.width = size
        canvas.height = size
        const ctx = canvas.getContext('2d')
        ctx.fillStyle = '#ffffff'
        ctx.fillRect(0, 0, size, size)

        const imgs = await Promise.all(imagesToUse.map(u => loadImage(u)))

        if (imgs.length === 1) {
            drawImageContain(ctx, imgs[0], 0, 0, size, size)
        } else if (imgs.length === 2) {
            const w = Math.floor(size / 2)
            drawImageContain(ctx, imgs[0], 0, 0, w, size)
            drawImageContain(ctx, imgs[1], w, 0, size - w, size)
        } else if (imgs.length === 3) {
            const half = Math.floor(size / 2)
            drawImageContain(ctx, imgs[0], 0, 0, half, half)
            drawImageContain(ctx, imgs[1], half, 0, size - half, half)
            drawImageContain(ctx, imgs[2], 0, half, size, size - half)
        } else {
            const half = Math.floor(size / 2)
            drawImageContain(ctx, imgs[0], 0, 0, half, half)
            drawImageContain(ctx, imgs[1], half, 0, size - half, half)
            drawImageContain(ctx, imgs[2], 0, half, half, size - half)
            drawImageContain(ctx, imgs[3], half, half, size - half, size - half)
        }

        return canvas.toDataURL('image/png')
    }

    const saveOutfit = async () => {
        if(!user.value) return

        const outfitDetails = []

        if(tops.value?.length) outfitDetails.push(tops.value[randomTop.value])
        if(bottoms.value?.length && isTop.value) outfitDetails.push(bottoms.value[randomBottom.value])
        if(shoes.value?.length) outfitDetails.push(shoes.value[randomShoe.value])
        if(headware.value?.length && addHeadware.value) outfitDetails.push(headware.value[randomHat.value])
        if(extra.value > 0 && accessories.value?.length) {
            for(let i = 0; i < extra.value; i++) {
                const idx = randomAccessories.value[i]
                if(idx != undefined) {
                    outfitDetails.push(accessories.value[idx])
                }
            }
        }

        try {
            const urls = outfitDetails.map(item => item.imageUrl).filter(Boolean)
            let collageUrl = null

            if(urls.length > 0){
                const dataUrl = await generateCollageFromUrls(urls, 1200)
                if(dataUrl){
                    const fileName = `${Date.now()}-collage.png`
                    const storagePath = `users/${user.value.uid}/outfits/${fileName}`
                    const fRef = storageRef(storage, storagePath)
                    await uploadString(fRef, dataUrl, 'data_url')
                    collageUrl = await getDownloadURL(fRef)
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
                imageUrl: collageUrl || '',
                createdAt: serverTimestamp()
            })

            showAlertModal("Successfully Saved")
        } catch (err) {
            console.log("Error Saving", err)
            showAlertModal("Failed to save outfit")
        }
    }

    const toggleHead = () => {
        addHeadware.value = !addHeadware.value
    }

    const removeAddOn = (index) => {
        if (extra.value > 0) {
            extra.value--
            accessoryIdx.value.splice(index, 1)
            randomAccessories.value.splice(index, 1)
        }
    }
</script>

<template>
    <div class="container-fluid p-4 d-flex flex-column align-items-center">

    <!-- ACTION BUTTONS mobile -->
    <div class="action-buttons d-flex flex-column gap-2 mb-3" v-if="isMobile">
        <button class="btn btn-lg btn-dark" @click="randomize">🌀 Random</button>
        <button class="btn btn-lg btn-success" @click="extra++; randomAccessories.push(0); accessoryIdx.push(Math.random().toString(36).substring(2, 10))">✨ Add On</button>
        <button class="btn btn-lg btn-success" v-show="addHeadware === false" @click="toggleHead">🎩 Add Headware</button>
        <!-- <button class="btn btn-lg btn-warning" v-show="addHeadware === true" @click="toggleHead">Remove Headware</button> -->
        <button class="btn btn-lg btn-primary" style="background-color: #0d6efd; color: white;" @click="saveOutfit">Save</button>
    </div>

    <div class="carousel-layout d-flex flex-column flex-lg-row align-items-center justify-content-center gap-4 w-100">

        <div class="main-carousel-column d-flex flex-column align-items-center gap-3">

            <!-- HEADWEAR -->
            <div v-if="addHeadware" class="carousel-wrapper" style="margin-bottom: 15px; position: relative; max-width: 320px;">
                <div class="remove-btn" @click="toggleHead">
                    <span class="remove-x">×</span>
                </div>

                <Carousel v-bind="config" class="carousel-outline" v-model="randomHat">
                    <Slide v-for="image in headware" :key="image.id">
                        <div class="image-container">
                            <img :src="image.imageUrl" class="carousel-img"/>
                        </div>
                    </Slide>
                    <template #addons>
                        <Navigation class="carousel-nav"/>
                    </template>
                </Carousel>
            </div>

            <!-- MAIN CAROUSELS -->
            <div class="main-carousel-wrapper d-flex flex-column align-items-center gap-3">
                <div v-for="(carouselData, index) in carousels" :key="index" v-show="carouselData.condition" class="carousel-wrapper">
                    <Carousel v-bind="config" class="carousel-outline" v-model="carouselData.model">
                        <Slide v-for="image in carouselData.items" :key="image.id">
                            <div class="image-container">
                                <img :src="image.imageUrl" class="carousel-img"/>
                            </div>
                        </Slide>
                        <template #addons>
                            <Navigation class="carousel-nav"/>
                        </template>
                    </Carousel>
                </div>
            </div>
        </div>
        
        <!-- ACCESSORIES -->
        <div class="accessories-wrapper d-flex flex-wrap justify-content-start gap-3 mt-3 mt-lg-0" v-if="extra > 0">
            <div v-for="(id, index) in accessoryIdx" :key="id" class="carousel-container accessory-item">
                <div class="remove-btn" @click="removeAddOn(index)">
                    <span class="remove-x">×</span>
                </div>
                <Carousel v-bind="config" class="carousel-outline"  v-model="randomAccessories[index]">
                <Slide v-for="image in accessories" :key="image.id" >
                    <div class="image-container">
                        <img :src="image.imageUrl" class="carousel-img"/>
                    </div>
                </Slide>
                <template #addons>
                    <Navigation class="carousel-nav"/>
                </template>
                </Carousel>
            </div>
        </div>
    </div>

    <!-- DESKTOP BUTTONS -->
    <div class="action-buttons d-flex flex-column gap-2 desktop-buttons" v-if="!isMobile">
        <button class="btn btn-lg btn-dark" @click="randomize">🌀 Random</button>
        <button class="btn btn-lg btn-success" @click="extra++; randomAccessories.push(0); accessoryIdx.push(Math.random().toString(36).substring(2, 10))">✨ Add On</button>
        <button class="btn btn-lg btn-success" v-show="addHeadware === false" @click="toggleHead">🎩 Add Headware</button>
        <!-- <button class="btn btn-lg btn-warning" v-show="addHeadware === true" @click="toggleHead">Remove Headware</button> -->
        <button class="btn btn-lg btn-primary" style="background-color: #0d6efd; color: white;" @click="saveOutfit">Save</button>
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

.carousel-wrapper, .carousel-container {
  width: 100%;
  max-width: 320px;
  border: 2px solid #dee2e6;
  border-radius: 10px;
  padding: 5px;
  box-shadow: 0 2px 6px rgba(0,0,0,0.15);
  position: relative;
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
  background-color: #f8f9fa; 
  color: #333;             
  font-size: 1.1rem;
  font-weight: 600;
  box-shadow: 0 4px 6px rgba(0,0,0,0.1);
  transition: all 0.2s ease-in-out;
  border: 1px solid #ddd;
}

.action-buttons button:hover {
  background-color: #e9ecef;
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
  background-color: #dc3545;
  color: white;
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
  background-color: #c82333;
  transform: scale(1.1);
}

.remove-x {
  display: block;
  margin-top: -2px;
}

@media(max-width:1024px) {
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