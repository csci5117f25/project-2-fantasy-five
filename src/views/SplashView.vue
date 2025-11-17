<!-- views/SplashView.vue -->
<template>
  <div class="splash d-flex flex-column min-vh-100 text-white">
    
    <!-- HERO SECTION -->
    <div class="flex-grow-1 d-flex justify-content-center align-items-center text-center px-4">
      <div>
        <h1 class="display-3 fw-bold mb-3">CLOSET CLOUD</h1>
        <p class="lead opacity-75">Track what you wear<br>Simplify your Style</p>
      </div>
    </div>

    <!-- AUTH BUTTONS -->
    <div class="p-4">
      <div class="d-grid gap-3 mx-auto" style="max-width: 300px">
        <button 
          class="btn btn-light btn-lg fw-bold text-primary"
          @click="$router.push('/signup')"
        >
          Sign Up
        </button>

        <button 
          class="btn btn-outline-light btn-lg fw-bold"
          @click="$router.push('/login')"
        >
          Log In
        </button>
      </div>
    </div>

  </div>
</template>

<script>
export default {
  name: 'SplashView'
}
</script>

<style scoped>
.splash {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}
</style>
