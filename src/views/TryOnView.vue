<script setup>
    import 'vue3-carousel/carousel.css'
    import { Carousel, Slide, Navigation } from 'vue3-carousel';
    import { db } from '@/firebase';
    import { useCollection, useCurrentUser } from 'vuefire';
    import { collection, query, addDoc, doc, serverTimestamp, where, or } from 'firebase/firestore';
    import { ref, computed, onMounted, onUnmounted } from 'vue';
    import FilterPanel from '@/components/FilterPanel.vue';
   
    const user = useCurrentUser()
    const extra = ref(0) 
    const currentTop = computed(() => tops.value?.[randomTop.value])
    const isTop = computed(() => currentTop.value?.category === 'top')
    const isMobile = ref(false)
    const randomTop = ref(0)
    const randomBottom = ref(0)
    const randomShoe = ref(0)
    const randomHat = ref(0)

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

    const getClothing = useCollection(() => {
        if(!user.value) return null
        return collection(doc(db, 'users', user.value.uid), 'clothingItems')
    })

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
    }

    const saveOutfit = async () => {
        if(!user.value) return

        const outfit = []

        if(tops.value?.length) {
            outfit.push(tops.value[randomTop.value].id)
        }
        if(bottoms.value?.length) {
            outfit.push(bottoms.value[randomBottom.value].id)
        }
        if(shoes.value?.length) {
            outfit.push(shoes.value[randomShoe.value].id)
        }
        if(headware.value?.length) {
            outfit.push(headware.value[randomHat.value].id)
        }
        if(extra.value > 0 && accessories.value?.length) {
            outfit.push(...accessories.value.slice(0, extra.value).map(acc => acc.id))
        }   

        try {
            const outfitsRef = collection(doc(db, 'users', user.value.uid), 'outfits')

            await addDoc(outfitsRef, {
                outfit,
                createdAt: serverTimestamp()
            })

            alert("Successfully Saved")
        } catch (err) {
            console.log("Error Saving", err)
        }
    }

</script>

<template>
    <div v-if="!isMobile" class="row g-4">
        <!-- <div class="content-layout">
            <div class="col-lg-3">
                <div class="sticky-top" style="top: 1rem">
                    <FilterPanel style="width: 200px;"/>
                </div>
            </div>
 -->
            <div class="all-content">
                <div class="main-outfit">
                    <Carousel v-bind="config" style="width:300px;" v-model="randomHat">
                        <Slide v-for="image in headware" :key="image.id">
                            <img :src="image.imageUrl"/>
                        </Slide>
                        <template #addons>
                            <Navigation />
                        </template>
                    </Carousel>
                    <Carousel v-bind="config" style="width:300px;" v-model="randomTop">
                        <Slide v-for="image in tops" :key="image.id">
                            <img :src="image.imageUrl"/>
                        </Slide>
                        <template #addons>
                            <Navigation />
                        </template>
                    </Carousel>
                    <Carousel v-bind="config" style="width:300px;" v-show="isTop === true" v-model="randomBottom">
                        <Slide v-for="image in bottoms" :key="image.id">
                            <img :src="image.imageUrl"/>
                        </Slide>
                        <template #addons>
                            <Navigation />
                        </template>
                    </Carousel>
                    <Carousel v-bind="config" style="width:300px;" v-model="randomShoe">
                        <Slide v-for="image in shoes" :key="image.id">
                            <img :src="image.imageUrl"/>
                        </Slide>
                        <template #addons>
                            <Navigation />
                        </template>
                    </Carousel>
                </div>
                <div class="accessories">
                    <Carousel v-bind="config" style="width:250px;" v-for="count in extra">
                        <Slide v-for="image in accessories" :key="image.id">
                            <img :src="image.imageUrl"/>
                        </Slide>
                        <template #addons>
                            <Navigation />
                        </template>
                    </Carousel>
                </div>
                <div class="buttons">
                    <button @click="randomize">Random</button>
                    <button @click="extra++">Add On</button>
                    <button @click="extra--" v-show="extra >= 1">Remove Add On</button>
                    <button @click="saveOutfit">Save</button>
                </div>
            </div>
     <!--    </div> -->
    </div> 

    <div v-else>
        <!-- <FilterPanel /> -->
        <div class="all-content-mobile">
            <div class="carousel-layout">
                <div class="main-outfit-mobile">
                    <Carousel v-bind="config" style="width:250px;" v-model="randomHat">
                        <Slide v-for="image in headware" :key="image.id" >
                            <img :src="image.imageUrl"/>
                        </Slide>
                        <template #addons>
                            <Navigation />
                        </template>
                    </Carousel>
                    <Carousel v-bind="config" style="width:250px;" v-model="randomTop">
                        <Slide v-for="image in tops" :key="image.id">
                            <img :src="image.imageUrl"/>
                        </Slide>
                        <template #addons>
                            <Navigation />
                        </template>
                    </Carousel>
                    <Carousel v-bind="config" style="width:250px;" v-show="isTop === true" v-model="randomBottom">
                        <Slide v-for="image in bottoms" :key="image.id">
                            <img :src="image.imageUrl"/>
                        </Slide>
                        <template #addons>
                            <Navigation />
                        </template>
                    </Carousel>
                    <Carousel v-bind="config" style="width:250px;" v-model="randomShoe">
                        <Slide v-for="image in shoes" :key="image.id">
                            <img :src="image.imageUrl"/>
                        </Slide>
                        <template #addons>
                            <Navigation />
                        </template>
                    </Carousel>
                </div>
                <div class="accessories">
                    <Carousel v-bind="config" style="width:250px;" v-for="count in extra">
                        <Slide v-for="image in accessories" :key="image.id">
                            <img :src="image.imageUrl"/>
                        </Slide>
                        <template #addons>
                            <Navigation />
                        </template>
                    </Carousel>
                </div>
            </div>
            <div class="buttons-mobile">
                <button @click="randomize">Random</button>
                <button @click="extra++">Add On</button>
                <button @click="extra--" v-show="extra >= 1">Remove Add On</button>
                <button @click="saveOutfit">Save</button>
            </div>
        </div>
    </div>
</template>

<style scoped>
    img {
        width: auto;
        height: 200px;
    }
    
    .all-content {
        display: flex;
        flex-direction: row;
        gap: 20px;
        height: 800px;
        align-items: center;
    }

    .main-outfit-mobile {
        display: flex;
        flex-direction: column;
    }

    .buttons {
        display: flex;
        flex-direction: column;
        gap: 40px;
    }

    .accesories {
        display: flex;
        flex-direction: column;
    }
    
    .content-layout {
        display: flex;
        flex-direction: row;
        gap: 20px;
        z-index: 0;
    }

    .all-content-mobile {
        display: flex;
        flex-direction: column;
    }

    .carousel-layout {
        display: flex;
        flex-direction: row;
        gap: 20px;
        justify-content: center;
        align-items: center;
    }

    .buttons-mobile {
        display: flex;
        flex-direction: column;
    }
</style>
