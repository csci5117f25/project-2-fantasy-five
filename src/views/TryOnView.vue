<script setup>
    import 'vue3-carousel/carousel.css'
    import { Carousel, Slide, Navigation } from 'vue3-carousel';
    import { db } from '@/firebase';
    import { useCollection, useCurrentUser } from 'vuefire';
    import { collection, query, orderBy, updateDoc, doc, serverTimestamp, where, or } from 'firebase/firestore';
    import { ref, computed, onMounted, onUnmounted } from 'vue';
   
    const user = useCurrentUser()
    const extra = ref(0) 
    const isTop = ref(true)

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

</script>

<template>
    <div class="all-content">
        <div class="main-outfit">
            <Carousel v-bind="config" style="width:300px;">
                <Slide v-for="image in headware" :key="image.id">
                    <img :src="image.imageUrl"/>
                </Slide>
                <template #addons>
                    <Navigation />
                </template>
            </Carousel>
            <Carousel v-bind="config" style="width:300px;">
                <Slide v-for="image in tops" :key="image.id">
                    <img :src="image.imageUrl"/>
                </Slide>
                <template #addons>
                    <Navigation />
                </template>
            </Carousel>
            <Carousel v-bind="config" style="width:300px;" >
                <Slide v-for="image in bottoms" :key="image.id">
                    <img :src="image.imageUrl"/>
                </Slide>
                <template #addons>
                    <Navigation />
                </template>
            </Carousel>
            <Carousel v-bind="config" style="width:300px;">
                <Slide v-for="image in shoes" :key="image.id">
                    <img :src="image.imageUrl"/>
                </Slide>
                <template #addons>
                    <Navigation />
                </template>
            </Carousel>
        </div>
        <div class="accessories" >
            <Carousel v-bind="config" style="width:300px;" v-for="count in extra">
                <Slide v-for="image in accessories" :key="image.id">
                    <img :src="image.imageUrl"/>
                </Slide>
                <template #addons>
                    <Navigation />
                </template>
            </Carousel>
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
        justify-content: center;
        gap: 20px;
    }

    .main-outfit {
    }

    .accesories {
        display: flex;
        flex-direction: column;
    }
</style>
