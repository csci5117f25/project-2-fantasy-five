<template>
  <div class="d-flex flex-column justify-content-center align-items-center vh-100 text-center bg-light">
    <h1 class="display-3 mb-3">404</h1>
    <p class="lead mb-4">The page you're looking for doesn't exist.</p>
    <router-link to="/" class="btn btn-dark btn-lg">
      Go to Home
    </router-link>
  </div>
</template>

<script>
export default {
  name: 'NotFound'
}
</script>

<style scoped>
.not-found {
  padding: 1rem;
}
</style>
