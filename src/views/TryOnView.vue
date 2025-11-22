<script>
    import { motionValue } from 'motion';
import { motion, useAnimate } from 'motion-v'
    export default {
        data() {
            return {
                images: [
                    {id: 1, url:"/src/assets/jeans.jpg"},
                    {id: 2, url:"/src/assets/shoe.jpg"},
                    {id:3, url:"/src/assets/tshirt.jpeg"}
                ]
            };
        }
    };
</script>

<template>
    <v-container style="display: flex; flex-direction: column; align-items: center;">
        <v-carousel hide-delimiters  style="height: 25vh; width: 500px;" :show-arrows="true">
            <v-carousel-item v-for="x in images" v-bind:src="x.url" contain></v-carousel-item>
        </v-carousel>
        <v-carousel hide-delimiters  style="height: 25vh; width: 500px;" :show-arrows="true">
            <v-carousel-item v-for="x in images" v-bind:src="x.url" contain></v-carousel-item>
        </v-carousel>
        <v-container style="display: flex; flex-direction: row;">
            <v-carousel hide-delimiters  style="height: 25vh; width: 500px;" :show-arrows="true">
                <v-carousel-item v-for="x in images" v-bind:src="x.url" contain></v-carousel-item>
            </v-carousel>
            <v-carousel hide-delimiters  style="height: 25vh; width: 500px;" :show-arrows="true">
                <v-carousel-item v-for="x in images" v-bind:src="x.url" contain></v-carousel-item>
            </v-carousel>
        </v-container>
        
    </v-container>
    <div><motion-div class="trash-can" :drag="true" :dragTransition="{ bounceStiffness: 200, bounceDamping: 15 }"></motion-div>
</div>
</template>

<style>
</style>
