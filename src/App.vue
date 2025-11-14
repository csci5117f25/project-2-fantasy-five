<script setup></script>

<template>
  <div id="app">
    <router-view />

    <div v-if="loading" class="global-loading">
      <div class="loading-spinner"></div>
    </div>
  </div>
</template>

<style scoped></style>


