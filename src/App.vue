<script setup></script>

<template>
  <div id="app">
    <router-view />
  </div>
</template>

<style>
.image-container {
  width: 100%;
  aspect-ratio: 800 / 1000;
  overflow: hidden;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: #f8f9fa;
}

.image-container img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.placeholder-image {
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: var(--bs-primary);
  color: white;
  font-size: 3rem;
}

html, body {
  scrollbar-width: none;
}
</style>


